-- Convert all timestamps to Bangladesh time (UTC+6)
-- Run this in Supabase SQL Editor

-- Challenge Templates
UPDATE challenge_templates 
SET 
  created_at = created_at + INTERVAL '6 hours',
  updated_at = updated_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL OR updated_at IS NOT NULL;

-- User Challenge Progress
UPDATE user_challenge_progress 
SET 
  started_at = started_at + INTERVAL '6 hours',
  last_completed_at = last_completed_at + INTERVAL '6 hours',
  completed_at = completed_at + INTERVAL '6 hours',
  paused_at = paused_at + INTERVAL '6 hours',
  created_at = created_at + INTERVAL '6 hours',
  updated_at = updated_at + INTERVAL '6 hours'
WHERE started_at IS NOT NULL OR last_completed_at IS NOT NULL OR completed_at IS NOT NULL 
   OR paused_at IS NOT NULL OR created_at IS NOT NULL OR updated_at IS NOT NULL;

-- User Challenge Daily Logs
UPDATE user_challenge_daily_logs 
SET 
  started_at = started_at + INTERVAL '6 hours',
  completed_at = completed_at + INTERVAL '6 hours',
  created_at = created_at + INTERVAL '6 hours'
WHERE started_at IS NOT NULL OR completed_at IS NOT NULL OR created_at IS NOT NULL;


-- Activity Stats
UPDATE activity_stats 
SET 
  created_at = created_at + INTERVAL '6 hours',
  updated_at = updated_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL OR updated_at IS NOT NULL;

-- User Activity Stats
UPDATE user_activity_stats 
SET 
  last_completed_at = last_completed_at + INTERVAL '6 hours',
  created_at = created_at + INTERVAL '6 hours',
  updated_at = updated_at + INTERVAL '6 hours'
WHERE last_completed_at IS NOT NULL OR created_at IS NOT NULL OR updated_at IS NOT NULL;

-- Challenge Activity Mapping
UPDATE challenge_activity_mapping 
SET created_at = created_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL;


-- Permissions
UPDATE permissions 
SET created_at = created_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL;

-- Role Permissions
UPDATE role_permissions 
SET created_at = created_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL;

-- Admin Users
UPDATE admin_users 
SET 
  created_at = created_at + INTERVAL '6 hours',
  updated_at = updated_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL OR updated_at IS NOT NULL;

-- Duas
UPDATE duas 
SET 
  created_at = created_at + INTERVAL '6 hours',
  updated_at = updated_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL OR updated_at IS NOT NULL;

-- Dua Categories
UPDATE dua_categories 
SET created_at = created_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL;

-- App Settings
UPDATE app_settings 
SET 
  created_at = created_at + INTERVAL '6 hours',
  updated_at = updated_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL OR updated_at IS NOT NULL;

-- User Settings
UPDATE user_settings 
SET 
  created_at = created_at + INTERVAL '6 hours',
  updated_at = updated_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL OR updated_at IS NOT NULL;

-- Notifications
UPDATE notifications 
SET 
  expires_at = expires_at + INTERVAL '6 hours',
  created_at = created_at + INTERVAL '6 hours'
WHERE expires_at IS NOT NULL OR created_at IS NOT NULL;

-- API Logs
UPDATE api_logs 
SET timestamp = timestamp + INTERVAL '6 hours'
WHERE timestamp IS NOT NULL;

-- AI Chat Sessions
UPDATE ai_chat_sessions 
SET 
  created_at = created_at + INTERVAL '6 hours',
  updated_at = updated_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL OR updated_at IS NOT NULL;

-- AI Chat Messages
UPDATE ai_chat_messages 
SET created_at = created_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL;

-- User Missed Challenges
UPDATE user_missed_challenges 
SET created_at = created_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL;

-- User Logs (if exists)
UPDATE api_logs 
SET created_at = created_at + INTERVAL '6 hours'
WHERE created_at IS NOT NULL;

-- Set timezone for future inserts
ALTER DATABASE postgres SET timezone TO 'Asia/Dhaka';