-- Add moderator role to existing profiles constraint
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'moderator', 'fact_checker', 'user'));

-- Helper function for superadmin check
create or replace function public.is_superadmin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Helper function for moderator check (admin or moderator)
create or replace function public.is_moderator()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'moderator')
  );
end;
$$ language plpgsql security definer;

-- RLS policy preventing self-escalation: users cannot escalate their own role
drop policy if exists "Users can update their own profiles" on public.profiles;

create policy "Users can update their own profiles"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and (
      not (role is distinct from (select role from public.profiles where id = auth.uid()))
      or public.is_superadmin()
    )
  );

-- Admin can update any profile
drop policy if exists "Admins can update any profile" on public.profiles;

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Admin full access to sources table
drop policy if exists "Admins can manage all sources" on public.sources;

create policy "Admins can manage all sources"
  on public.sources for all
  using (public.is_superadmin())
  with check (public.is_superadmin());

-- Moderator sources policies with unique names
drop policy if exists "Moderators can insert sources" on public.sources;
drop policy if exists "Moderators can update sources" on public.sources;
drop policy if exists "Moderators can delete sources" on public.sources;

create policy "Moderators can insert sources"
  on public.sources for insert
  with check (public.is_moderator());

create policy "Moderators can update sources"
  on public.sources for update
  using (public.is_moderator())
  with check (public.is_moderator());

create policy "Moderators can delete sources"
  on public.sources for delete
  using (public.is_moderator());

-- Admin can read audit_log
drop policy if exists "Admins can read audit_log" on public.audit_log;

create policy "Admins can read audit_log"
  on public.audit_log for select
  using (public.is_superadmin());

-- Admin can insert audit_log
drop policy if exists "Admins can insert audit_log" on public.audit_log;

create policy "Admins can insert audit_log"
  on public.audit_log for insert
  with check (public.is_superadmin());
