-- Nightly cron job to refresh daily rankings
-- This job runs at 00:05 UTC every day to calculate momentum scores

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the daily rankings refresh job
-- Runs at 00:05 UTC every day (5 minutes after midnight to ensure all data is collected)
SELECT cron.schedule(
    'refresh-daily-rankings',
    '5 0 * * *', -- At 00:05 UTC every day
    'SELECT refresh_daily_rankings(CURRENT_DATE);'
);

-- Also schedule a job to refresh rankings for the previous day
-- This ensures we catch any late-arriving data
SELECT cron.schedule(
    'refresh-previous-day-rankings',
    '10 0 * * *', -- At 00:10 UTC every day
    'SELECT refresh_daily_rankings(CURRENT_DATE - INTERVAL ''1 day'');'
);

-- Grant necessary permissions for cron jobs
GRANT USAGE ON SCHEMA cron TO service_role; 