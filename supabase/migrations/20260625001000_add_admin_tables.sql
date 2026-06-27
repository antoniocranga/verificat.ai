-- Abuse reports table (F7.3)
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reported_by uuid references public.profiles on delete set null,
  claim_id uuid references public.claims on delete cascade,
  verdict_id uuid references public.verdicts on delete cascade,
  reason text not null,
  description text,
  status text default 'open' not null check (status in ('open', 'investigating', 'resolved', 'dismissed')),
  handled_by uuid references public.profiles on delete set null,
  resolution_note text
);

alter table public.reports enable row level security;

create policy "Reports are viewable by admins and moderators"
  on public.reports for select
  using (public.is_moderator());

create policy "Reports can be inserted by any authenticated user"
  on public.reports for insert
  with check (auth.uid() = reported_by);

create policy "Admins can update reports"
  on public.reports for update
  using (public.is_moderator())
  with check (public.is_moderator());

create policy "Admins can delete reports"
  on public.reports for delete
  using (public.is_superadmin());

-- Usage logs table (F7.4)
create table public.usage_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references public.profiles on delete cascade not null,
  service text not null,
  tokens int,
  duration_ms int,
  cost decimal(10, 6),
  endpoint text,
  metadata jsonb default '{}'::jsonb
);

alter table public.usage_logs enable row level security;

create policy "Usage logs are viewable by admins"
  on public.usage_logs for select
  using (public.is_superadmin());

create policy "Usage logs can be inserted by service role"
  on public.usage_logs for insert
  with check (public.is_superadmin());

create policy "Usage logs are viewable by the owning user"
  on public.usage_logs for select
  using (user_id = auth.uid());

-- Index for usage queries
create index usage_logs_user_id_idx on public.usage_logs (user_id);
create index usage_logs_service_idx on public.usage_logs (service);
create index usage_logs_created_at_idx on public.usage_logs (created_at);

-- Reports index
create index reports_status_idx on public.reports (status);
create index reports_reported_by_idx on public.reports (reported_by);
