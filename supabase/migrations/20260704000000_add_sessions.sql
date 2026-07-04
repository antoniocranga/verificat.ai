-- Add sessions table and link claims to sessions

-- 1. Create sessions table
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  device_id text,
  mode text not null check (mode in ('realtime', 'recording')) default 'realtime',
  started_at timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  claim_count integer default 0 not null,
  verdict_summary jsonb default '{}'::jsonb not null
);

-- Grant access to standard roles (required since this is created via SQL)
grant select, insert, update, delete on public.sessions to anon, authenticated, service_role;
-- 2. Add session_id to existing claims table
alter table public.claims
  add column session_id uuid references public.sessions on delete set null;

-- 3. Enable RLS
alter table public.sessions enable row level security;

-- 4. RLS policies for sessions
create policy "Sessions are viewable by everyone"
  on public.sessions for select
  using (true);

create policy "Service role can insert sessions"
  on public.sessions for insert
  with check (true);

create policy "Service role can update sessions"
  on public.sessions for update
  using (true)
  with check (true);

create policy "Service role can delete sessions"
  on public.sessions for delete
  using (true);

-- 5. Index for session list queries
create index idx_sessions_created_at on public.sessions (created_at desc);
create index idx_claims_session_id on public.claims (session_id);
