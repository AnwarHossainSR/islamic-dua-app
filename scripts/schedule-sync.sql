-- ============================================
-- RESET AND SCHEDULE MISSED CHALLENGES SYNC
-- ============================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Clear all existing cron jobs to start fresh
SELECT cron.unschedule(jobid) FROM cron.job;

-- 3. Schedule the daily sync
-- This job will run every day at 00:05 UTC (06:05 AM Bangladesh time)
SELECT cron.schedule(
  'sync-missed-challenges',
  '5 0 * * *',
  $$
  SELECT net.http_post(
    url := 'https://unktdawdchpmoufkrbqy.supabase.co/functions/v1/sync-missed-challenges-daily-basis',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVua3RkYXdkY2hwbW91ZmtyYnF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ4OTY1MywiZXhwIjoyMDc1MDY1NjUzfQ.ssgj0NasgyNws0LjKfk7nMxR_qG6K0lIO3RmRIjXJOk'
    ),
    body := '{}'
  )
  $$
);

-- 4. Verify the job is scheduled
SELECT * FROM cron.job;

-- 5. Manual Test (Direct Call)
-- SELECT net.http_post(
--   url := 'https://unktdawdchpmoufkrbqy.supabase.co/functions/v1/sync-missed-challenges-daily-basis',
--   headers := jsonb_build_object(
--     'Content-Type', 'application/json',
--     'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVua3RkYXdkY2hwbW91ZmtyYnF5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQ4OTY1MywiZXhwIjoyMDc1MDY1NjUzfQ.ssgj0NasgyNws0LjKfk7nMxR_qG6K0lIO3RmRIjXJOk'
--   ),
--   body := '{}'
-- );
