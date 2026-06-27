-- Migration: add match_facts RPC for real-time audio fact-checking pipeline
--
-- This function is called by AudioFactcheckService (via EvidenceRetrievalService's
-- pgvector search) to retrieve semantically similar facts for a spoken claim.
-- Requires: pgvector extension enabled, 'facts' table with 'embedding vector(1536)' column.
--
-- NOTE: Apply this migration manually via `supabase db push` or the Supabase dashboard.
-- Do NOT apply to production without human review (see implementation plan open question).

create or replace function match_facts(
  query_embedding vector(1536),
  match_threshold float default 0.75,
  match_count int default 3
)
returns table (
  id uuid,
  content text,
  label text,
  source text,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    label,
    source,
    1 - (embedding <=> query_embedding) as similarity
  from facts
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
