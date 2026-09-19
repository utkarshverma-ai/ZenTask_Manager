create or replace function public.bootstrap_initial_admin()
returns boolean language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if exists (select 1 from public.profiles where role = 'admin') then
    return false;
  end if;

  update public.profiles set role = 'admin' where id = auth.uid();
  return found;
end;
$$;

revoke all on function public.bootstrap_initial_admin() from public;
grant execute on function public.bootstrap_initial_admin() to authenticated;

create or replace function public.prevent_assigned_member_removal()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if exists (
    select 1 from public.tasks
    where project_id = old.project_id and assigned_to = old.user_id
  ) then
    raise exception 'Reassign this member''s tasks before removing them from the project';
  end if;
  return old;
end;
$$;

drop trigger if exists project_members_prevent_assigned_removal on public.project_members;
create trigger project_members_prevent_assigned_removal
before delete on public.project_members
for each row execute function public.prevent_assigned_member_removal();
