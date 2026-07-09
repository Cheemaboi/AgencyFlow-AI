create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1
$$;

create or replace function public.is_org_member(target_organization uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    join public.profiles p on p.id = om.profile_id
    where om.organization_id = target_organization
      and p.auth_user_id = auth.uid()
  )
$$;

create or replace function public.has_org_role(target_organization uuid, allowed_roles public.app_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    join public.profiles p on p.id = om.profile_id
    where om.organization_id = target_organization
      and om.role = any(allowed_roles)
      and p.auth_user_id = auth.uid()
  )
$$;

create or replace function public.can_access_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members self_member
    join public.profiles self_profile on self_profile.id = self_member.profile_id
    join public.organization_members target_member on target_member.organization_id = self_member.organization_id
    where self_profile.auth_user_id = auth.uid()
      and target_member.profile_id = target_profile_id
  )
$$;

grant execute on function public.current_profile_id() to authenticated, service_role;
grant execute on function public.is_org_member(uuid) to authenticated, service_role;
grant execute on function public.has_org_role(uuid, public.app_role[]) to authenticated, service_role;
grant execute on function public.can_access_profile(uuid) to authenticated, service_role;

drop policy if exists "profiles select self or org peers" on public.profiles;

create policy "profiles select self or org peers" on public.profiles
for select using (
  auth.uid() is not null and (
    auth_user_id = auth.uid()
    or public.can_access_profile(id)
  )
);
