-- ============================================================
-- Migration: Task Review Workflow, Work Summary & Permissions
-- Branch: feature/task-review-workflow
-- Date: 2026-06-02
--
-- Changes:
--   1. Add 'ready_for_review' to tasks.status check constraint
--   2. Add task_work_log column (TEXT, default '')
--   3. Replace permissive task update RLS with role-based policies
--   4. Add trigger to enforce status transitions & column guards
--   5. Restrict task creation to admins only
-- ============================================================

-- 1. Expand status check constraint to include 'ready_for_review'
alter table public.tasks drop constraint if exists tasks_status_check;
alter table public.tasks add constraint tasks_status_check
  check (status in ('todo', 'in_progress', 'ready_for_review', 'completed'));

-- 2. Add task_work_log column (backward compatible — defaults to empty string)
alter table public.tasks add column if not exists task_work_log text not null default '';

-- 3. Replace permissive task update & insert policies
--    Drop old policies first
drop policy if exists "authorized users update tasks" on public.tasks;
drop policy if exists "authorized users create tasks" on public.tasks;

-- 3a. Only admins can create tasks
create policy "admins create tasks" on public.tasks
for insert to authenticated
with check (public.is_admin() and created_by = auth.uid());

-- 3b. Assigned member can update their own task (status + work_log only, enforced by trigger)
create policy "assigned member updates own task" on public.tasks
for update to authenticated
using (assigned_to = auth.uid() and public.can_access_project(project_id))
with check (assigned_to = auth.uid() and public.can_access_project(project_id));

-- 3c. Admin can update any task they can access
create policy "admin updates tasks" on public.tasks
for update to authenticated
using (public.is_admin() and public.can_access_project(project_id))
with check (public.is_admin() and public.can_access_project(project_id));

-- 4. Trigger function: enforce status transitions & column-level guards
create or replace function public.enforce_task_workflow()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  caller_role text;
  is_assignee boolean;
begin
  -- Determine caller role
  select role into caller_role from public.profiles where id = auth.uid();
  is_assignee := (old.assigned_to = auth.uid());

  -- ADMIN: can change status + task_work_log freely, and all other fields
  if caller_role = 'admin' then
    -- Enforce valid admin status transitions
    -- Admins can do: ready_for_review -> completed, ready_for_review -> in_progress
    -- Admins also get full control for any other transition
    return new;
  end if;

  -- ASSIGNED MEMBER: can only change status and task_work_log
  if is_assignee then
    -- Guard: non-status/work_log columns must remain unchanged
    if new.title        is distinct from old.title or
       new.description  is distinct from old.description or
       new.project_id   is distinct from old.project_id or
       new.assigned_to  is distinct from old.assigned_to or
       new.priority     is distinct from old.priority or
       new.due_date     is distinct from old.due_date or
       new.created_by   is distinct from old.created_by then
      raise exception 'You can only update status and work summary for your assigned tasks';
    end if;

    -- Enforce valid member status transitions
    if new.status is distinct from old.status then
      if not (
        (old.status = 'todo' and new.status = 'in_progress') or
        (old.status = 'in_progress' and new.status = 'ready_for_review')
      ) then
        raise exception 'Invalid status transition: % -> %', old.status, new.status;
      end if;

      -- Require non-empty work log when submitting for review
      if new.status = 'ready_for_review' and (new.task_work_log is null or trim(new.task_work_log) = '') then
        raise exception 'Please provide a work summary before submitting for review.';
      end if;
    end if;

    return new;
  end if;

  -- OTHER MEMBERS: no update allowed (RLS should block, but extra safety)
  raise exception 'You do not have permission to update this task';
end;
$$;

drop trigger if exists tasks_enforce_workflow on public.tasks;
create trigger tasks_enforce_workflow before update on public.tasks
for each row execute function public.enforce_task_workflow();
