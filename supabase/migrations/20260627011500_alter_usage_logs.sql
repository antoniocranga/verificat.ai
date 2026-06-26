-- Make user_id nullable in usage_logs to allow anonymous fact-check tracking
ALTER TABLE public.usage_logs ALTER COLUMN user_id DROP NOT NULL;
