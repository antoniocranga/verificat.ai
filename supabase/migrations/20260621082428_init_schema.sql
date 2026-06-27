-- Initial schema definition for verificat.xyz

-- 1. Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  full_name text,
  role text default 'user' not null check (role in ('admin', 'fact_checker', 'user'))
);

-- 2. Create sources table
create table public.sources (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  url text unique not null,
  trust_score numeric check (trust_score >= 0 and trust_score <= 100)
);

-- 3. Create claims table
create table public.claims (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  text text not null,
  normalized_text text,
  language text default 'ro' not null,
  detected_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create fact_checks table
create table public.fact_checks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  claim_id uuid references public.claims on delete cascade not null,
  assigned_to uuid references public.profiles on delete set null,
  status text default 'pending' not null check (status in ('pending', 'in_progress', 'completed', 'unverified'))
);

-- 5. Create verdicts table
create table public.verdicts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  fact_check_id uuid references public.fact_checks on delete cascade not null,
  verdict text not null check (verdict in ('True', 'Mostly True', 'Partially True', 'Misleading', 'False', 'Unverified')),
  confidence_score numeric check (confidence_score >= 0 and confidence_score <= 100) not null,
  explanation text not null
);

-- 6. Create verdict_sources junction table
create table public.verdict_sources (
  verdict_id uuid references public.verdicts on delete cascade not null,
  source_id uuid references public.sources on delete cascade not null,
  primary key (verdict_id, source_id)
);

-- 7. Create audit_log table
create table public.audit_log (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  actor_id uuid references public.profiles on delete set null,
  action text not null,
  payload jsonb not null
);

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.sources enable row level security;
alter table public.claims enable row level security;
alter table public.fact_checks enable row level security;
alter table public.verdicts enable row level security;
alter table public.verdict_sources enable row level security;
alter table public.audit_log enable row level security;

-- 8. Create helper function to check if active user is an editor (admin or fact_checker)
create or replace function public.is_editor()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'fact_checker')
  );
end;
$$ language plpgsql security definer;

-- 9. Setup RLS policies

-- public.profiles policies
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profiles"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- public.sources policies
create policy "Sources are viewable by everyone"
  on public.sources for select
  using (true);

create policy "Editors can insert sources"
  on public.sources for insert
  with check (public.is_editor());

create policy "Editors can update sources"
  on public.sources for update
  using (public.is_editor())
  with check (public.is_editor());

create policy "Editors can delete sources"
  on public.sources for delete
  using (public.is_editor());

-- public.claims policies
create policy "Claims are viewable by everyone"
  on public.claims for select
  using (true);

create policy "Editors can insert claims"
  on public.claims for insert
  with check (public.is_editor());

create policy "Editors can update claims"
  on public.claims for update
  using (public.is_editor())
  with check (public.is_editor());

create policy "Editors can delete claims"
  on public.claims for delete
  using (public.is_editor());

-- public.fact_checks policies
create policy "Fact checks are viewable by everyone"
  on public.fact_checks for select
  using (true);

create policy "Editors can insert fact checks"
  on public.fact_checks for insert
  with check (public.is_editor());

create policy "Editors can update fact checks"
  on public.fact_checks for update
  using (public.is_editor())
  with check (public.is_editor());

create policy "Editors can delete fact checks"
  on public.fact_checks for delete
  using (public.is_editor());

-- public.verdicts policies
create policy "Verdicts are viewable by everyone"
  on public.verdicts for select
  using (true);

create policy "Editors can insert verdicts"
  on public.verdicts for insert
  with check (public.is_editor());

create policy "Editors can update verdicts"
  on public.verdicts for update
  using (public.is_editor())
  with check (public.is_editor());

create policy "Editors can delete verdicts"
  on public.verdicts for delete
  using (public.is_editor());

-- public.verdict_sources policies
create policy "Verdict sources are viewable by everyone"
  on public.verdict_sources for select
  using (true);

create policy "Editors can insert verdict sources"
  on public.verdict_sources for insert
  with check (public.is_editor());

create policy "Editors can update verdict sources"
  on public.verdict_sources for update
  using (public.is_editor())
  with check (public.is_editor());

create policy "Editors can delete verdict sources"
  on public.verdict_sources for delete
  using (public.is_editor());

-- Note: public.audit_log has no policies, meaning it is strictly deny-all-but-service-role.

-- 10. Trigger to automatically scaffold profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    'user'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
