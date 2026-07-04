-- Drop fact_checks.assigned_to — column is never written or read by any code path.
-- ⚠️ BACKUP REQUIRED: Take a full database backup before applying this migration.
--
-- Down migration:
--   alter table public.fact_checks add column assigned_to uuid references public.profiles on delete set null;

alter table public.fact_checks drop column if exists assigned_to;
