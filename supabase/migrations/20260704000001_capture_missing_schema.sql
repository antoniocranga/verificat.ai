-- Capture tables and RPCs that exist in production but were missing from migrations.
-- This file brings the migration set into sync with the live schema.
-- No structure is altered — only definitions that already exist are recorded.

-- 1. Sources table additions (columns added via dashboard, not migrations)
alter table public.sources add column if not exists feed_url text;
alter table public.sources add column if not exists category text;
alter table public.sources add column if not exists language text[] default '{}';

-- 2. Create source_articles table
create table if not exists public.source_articles (
  id uuid default gen_random_uuid() primary key,
  source_id uuid not null references public.sources on delete cascade,
  article_url text not null,
  title text not null,
  content text not null,
  summary text,
  published_at timestamp with time zone,
  ingested_at timestamp with time zone default timezone('utc'::text, now()),
  embedding vector(1536),
  chunk_index integer default 0,
  token_count integer,
  search_vector tsvector,
  constraint source_articles_article_url_key unique (article_url)
);

-- 3. Create ingest_runs table
create table if not exists public.ingest_runs (
  id uuid default gen_random_uuid() primary key,
  ran_at timestamp with time zone default timezone('utc'::text, now()),
  source_id uuid references public.sources(id),
  articles_added integer default 0,
  errors text,
  duration_ms integer
);

-- 4. Create handoff_tokens table
create table if not exists public.handoff_tokens (
  token uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id text not null,
  expires_at timestamp with time zone not null default (timezone('utc'::text, now()) + '00:05:00'::interval),
  used_at timestamp with time zone,
  created_at timestamp with time zone not null default timezone('utc'::text, now())
);

-- 5. Indexes for source_articles
create index if not exists source_articles_source_id_idx on public.source_articles (source_id);
create index if not exists source_articles_published_at_idx on public.source_articles (published_at desc);
create index if not exists source_articles_search_idx on public.source_articles using gin (search_vector);
create index if not exists source_articles_embedding_idx on public.source_articles using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- 6. Indexes for handoff_tokens
create index if not exists handoff_tokens_token_idx on public.handoff_tokens (token);
create index if not exists handoff_tokens_user_id_idx on public.handoff_tokens (user_id);

-- 7. Enable RLS on new tables
alter table public.source_articles enable row level security;
alter table public.ingest_runs enable row level security;
alter table public.handoff_tokens enable row level security;

-- 8. RLS policies for source_articles
create policy "source_articles are publicly readable"
  on public.source_articles for select
  using (true);

create policy "Edge Function can insert source_articles"
  on public.source_articles for insert
  with check (true);

-- 9. RLS policies for ingest_runs
create policy "ingest_runs are publicly readable"
  on public.ingest_runs for select
  using (true);

create policy "Edge Function can insert ingest_runs"
  on public.ingest_runs for insert
  with check (true);

-- 10. RLS policies for handoff_tokens
create policy "Users can view own handoff tokens"
  on public.handoff_tokens for select
  using (auth.uid() = user_id);

create policy "Service role can insert handoff tokens"
  on public.handoff_tokens for insert
  with check (true);

create policy "Service role can update handoff tokens"
  on public.handoff_tokens for update
  using (true)
  with check (true);

-- 11. Create match_source_articles RPC
create or replace function public.match_source_articles(
  query_embedding vector(1536),
  match_threshold double precision default 0.55,
  match_count integer default 6,
  filter_categories text[] default null,
  filter_languages text[] default null
)
returns table(
  id uuid,
  source_id uuid,
  source_name text,
  source_category text,
  article_url text,
  title text,
  content text,
  published_at timestamp with time zone,
  similarity double precision
)
language plpgsql as $$
begin
  return query
  select
    sa.id,
    sa.source_id,
    s.name          as source_name,
    s.category      as source_category,
    sa.article_url,
    sa.title,
    sa.content,
    sa.published_at,
    1 - (sa.embedding <=> query_embedding) as similarity
  from public.source_articles sa
  join public.sources s on s.id = sa.source_id
  where
    (filter_categories is null or s.category = any(filter_categories))
    and (filter_languages is null or s.language && filter_languages)
    and 1 - (sa.embedding <=> query_embedding) > match_threshold
  order by sa.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 12. Create search_source_articles RPC
create or replace function public.search_source_articles(
  search_query text,
  match_count integer default 10,
  filter_categories text[] default null,
  filter_languages text[] default null
)
returns table(
  id uuid,
  source_id uuid,
  source_name text,
  source_category text,
  article_url text,
  title text,
  content text,
  published_at timestamp with time zone,
  rank real
)
language plpgsql as $$
declare
  keywords text[];
  query tsquery;
begin
  select array_agg(distinct lower(w))
  from (
    select regexp_split_to_table(search_query, E'\\W+') w
  ) t
  where length(w) >= 4 into keywords;

  if keywords is null or array_length(keywords, 1) = 0 then return; end if;

  select to_tsquery('english', string_agg(keyword || ':*', ' | ' order by keyword))
  from unnest(keywords) keyword
  into query;

  if query is null then return; end if;

  return query
  select
    sa.id,
    sa.source_id,
    s.name          as source_name,
    s.category      as source_category,
    sa.article_url,
    sa.title,
    sa.content,
    sa.published_at,
    ts_rank(sa.search_vector, query) as rank
  from public.source_articles sa
  join public.sources s on s.id = sa.source_id
  where
    sa.search_vector @@ query
    and (filter_categories is null or s.category = any(filter_categories))
    and (filter_languages is null or s.language && filter_languages)
  order by rank desc
  limit match_count;
end;
$$;
