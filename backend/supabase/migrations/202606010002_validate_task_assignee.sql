create or replace function public.validate_task_assignee()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if new.assigned_to is not null and not exists (
    select 1 from public.project_members
    where project_id = new.project_id and user_id = new.assigned_to
  ) then
    raise exception 'Task assignee must be a member of the project';
  end if;
  return new;
end;
$$;

drop trigger if exists tasks_validate_assignee on public.tasks;
create trigger tasks_validate_assignee before insert or update on public.tasks
for each row execute function public.validate_task_assignee();
