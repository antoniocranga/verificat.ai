-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Create claim_embeddings table
create table public.claim_embeddings (
  id uuid default gen_random_uuid() primary key,
  claim_id uuid references public.claims on delete cascade not null,
  embedding vector(1536) not null, -- 1536 dimensions matches standard embeddings (e.g. OpenAI text-embedding-3-small)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS)
alter table public.claim_embeddings enable row level security;

-- 4. Setup RLS policies inheriting F2.1 posture
create policy "Embeddings are viewable by everyone"
  on public.claim_embeddings for select
  using (true);

create policy "Editors can insert embeddings"
  on public.claim_embeddings for insert
  with check (public.is_editor());

create policy "Editors can update embeddings"
  on public.claim_embeddings for update
  using (public.is_editor())
  with check (public.is_editor());

create policy "Editors can delete embeddings"
  on public.claim_embeddings for delete
  using (public.is_editor());

-- 5. Create HNSW index for fast similarity search per ADR-003
create index claim_embeddings_hnsw_idx on public.claim_embeddings using hnsw (embedding vector_cosine_ops);

-- 6. Create RPC function for claim similarity matching
create or replace function public.match_claims(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  claim_id uuid,
  text text,
  similarity float
)
language plpgsql stable as $$
begin
  return query
  select
    ce.id,
    ce.claim_id,
    c.text,
    1 - (ce.embedding <=> query_embedding) as similarity
  from public.claim_embeddings ce
  join public.claims c on c.id = ce.claim_id
  where 1 - (ce.embedding <=> query_embedding) > match_threshold
  order by ce.embedding <=> query_embedding
  limit match_count;
end;
$$;
