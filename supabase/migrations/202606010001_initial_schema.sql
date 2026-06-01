create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null unique,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  status text not null default 'planning' check (status in ('planning', 'active', 'completed')),
  start_date date,

  due_date date not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  assigned_at timestamptz not null default now(),
  unique (project_id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 180),
  description text not null default '',
  assigned_to uuid references public.profiles(id),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_date date not null,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('project', 'task', 'project_member')),
  entity_id uuid not null,
  action text not null check (action in ('created', 'updated', 'deleted')),
  user_id uuid references public.profiles(id) on delete set null,
  timestamp timestamptz not null default now()
);

create index project_members_user_id_idx on public.project_members(user_id);
create index tasks_project_id_idx on public.tasks(project_id);
create index tasks_assigned_to_idx on public.tasks(assigned_to);
create index activity_logs_timestamp_idx on public.activity_logs(timestamp desc);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin') $$;

create or replace function public.can_access_project(target_project_id uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select public.is_admin() or exists (
    select 1 from public.project_members
    where project_id = target_project_id and user_id = auth.uid()
  )
$$;

create or replace function public.current_profile_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.profiles where id = auth.uid() $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), coalesce(new.email, ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.add_project_owner()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.project_members (project_id, user_id, role) values (new.id, new.created_by, 'owner');
  return new;
end;
$$;

create trigger on_project_created
after insert on public.projects for each row execute function public.add_project_owner();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

create or replace function public.log_activity()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  record_id uuid;
begin
  record_id := case when tg_op = 'DELETE' then old.id else new.id end;
  insert into public.activity_logs(entity_type, entity_id, action, user_id)
  values (
    case tg_table_name when 'projects' then 'project' when 'tasks' then 'task' else 'project_member' end,
    record_id,
    case tg_op when 'INSERT' then 'created' when 'UPDATE' then 'updated' else 'deleted' end,
    auth.uid()
  );
  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

create trigger projects_log_activity after insert or update or delete on public.projects
for each row execute function public.log_activity();
create trigger tasks_log_activity after insert or update or delete on public.tasks
for each row execute function public.log_activity();
create trigger project_members_log_activity after insert or update or delete on public.project_members
for each row execute function public.log_activity();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.activity_logs enable row level security;

revoke all on public.profiles, public.projects, public.project_members, public.tasks, public.activity_logs from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.project_members to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select on public.activity_logs to authenticated;

create policy "profiles visible to authenticated users" on public.profiles
for select to authenticated using (true);
create policy "users update own profile" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and role = public.current_profile_role());
create policy "admins update profiles" on public.profiles
for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "authorized users read projects" on public.projects
for select to authenticated using (public.can_access_project(id));
create policy "admins create projects" on public.projects
for insert to authenticated with check (public.is_admin() and created_by = auth.uid());
create policy "admins update projects" on public.projects
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete projects" on public.projects
for delete to authenticated using (public.is_admin());

create policy "authorized users read memberships" on public.project_members
for select to authenticated using (public.can_access_project(project_id));
create policy "admins create memberships" on public.project_members
for insert to authenticated with check (public.is_admin());
create policy "admins update memberships" on public.project_members
for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins delete memberships" on public.project_members
for delete to authenticated using (public.is_admin());

create policy "authorized users read tasks" on public.tasks
for select to authenticated using (public.can_access_project(project_id));
create policy "authorized users create tasks" on public.tasks
for insert to authenticated with check (public.can_access_project(project_id) and created_by = auth.uid());
create policy "authorized users update tasks" on public.tasks
for update to authenticated using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
create policy "admins delete tasks" on public.tasks
for delete to authenticated using (public.is_admin());

create policy "authorized users read activity" on public.activity_logs
for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.projects where id = entity_id and public.can_access_project(id)
  ) or exists (
    select 1 from public.tasks where id = entity_id and public.can_access_project(project_id)
  ) or exists (
    select 1 from public.project_members where id = entity_id and public.can_access_project(project_id)
  )
);

alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.project_members;
alter publication supabase_realtime add table public.tasks;

-- Promote the first trusted account after signup from the Supabase SQL editor:
-- update public.profiles set role = 'admin' where email = 'admin@example.com';
