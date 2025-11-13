-- Complete migration script to convert all timestamp fields to Unix timestamps (bigint)
-- Run this single script in Supabase SQL Editor to preserve all existing data

-- Add new bigint columns (only for existing tables)
ALTER TABLE challenge_templates ADD COLUMN created_at_new BIGINT, ADD COLUMN updated_at_new BIGINT;
ALTER TABLE user_challenge_progress ADD COLUMN started_at_new BIGINT, ADD COLUMN last_completed_at_new BIGINT, ADD COLUMN completed_at_new BIGINT, ADD COLUMN paused_at_new BIGINT, ADD COLUMN created_at_new BIGINT, ADD COLUMN updated_at_new BIGINT;
ALTER TABLE user_challenge_daily_logs ADD COLUMN started_at_new BIGINT, ADD COLUMN completed_at_new BIGINT, ADD COLUMN created_at_new BIGINT;
ALTER TABLE activity_stats ADD COLUMN created_at_new BIGINT, ADD COLUMN updated_at_new BIGINT;
ALTER TABLE user_activity_stats ADD COLUMN last_completed_at_new BIGINT, ADD COLUMN created_at_new BIGINT, ADD COLUMN updated_at_new BIGINT;
ALTER TABLE challenge_activity_mapping ADD COLUMN created_at_new BIGINT;
ALTER TABLE permissions ADD COLUMN created_at_new BIGINT;
ALTER TABLE role_permissions ADD COLUMN created_at_new BIGINT;
ALTER TABLE admin_users ADD COLUMN created_at_new BIGINT, ADD COLUMN updated_at_new BIGINT;
ALTER TABLE duas ADD COLUMN created_at_new BIGINT, ADD COLUMN updated_at_new BIGINT;
ALTER TABLE dua_categories ADD COLUMN created_at_new BIGINT;
ALTER TABLE app_settings ADD COLUMN created_at_new BIGINT, ADD COLUMN updated_at_new BIGINT;
ALTER TABLE user_settings ADD COLUMN created_at_new BIGINT, ADD COLUMN updated_at_new BIGINT;
ALTER TABLE notifications ADD COLUMN created_at_new BIGINT;
ALTER TABLE webauthn_credentials ADD COLUMN created_at_new BIGINT, ADD COLUMN updated_at_new BIGINT, ADD COLUMN last_used_at_new BIGINT;
ALTER TABLE api_logs ADD COLUMN timestamp_new BIGINT;
ALTER TABLE user_missed_challenges ADD COLUMN created_at_new BIGINT;
ALTER TABLE ai_chat_sessions ADD COLUMN created_at_new BIGINT, ADD COLUMN updated_at_new BIGINT;
ALTER TABLE ai_chat_messages ADD COLUMN created_at_new BIGINT;

-- Convert existing data
UPDATE challenge_templates SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000, updated_at_new = EXTRACT(EPOCH FROM updated_at) * 1000;
UPDATE user_challenge_progress SET started_at_new = EXTRACT(EPOCH FROM started_at) * 1000, last_completed_at_new = EXTRACT(EPOCH FROM last_completed_at) * 1000, completed_at_new = EXTRACT(EPOCH FROM completed_at) * 1000, paused_at_new = EXTRACT(EPOCH FROM paused_at) * 1000, created_at_new = EXTRACT(EPOCH FROM created_at) * 1000, updated_at_new = EXTRACT(EPOCH FROM updated_at) * 1000;
UPDATE user_challenge_daily_logs SET started_at_new = EXTRACT(EPOCH FROM started_at) * 1000, completed_at_new = EXTRACT(EPOCH FROM completed_at) * 1000, created_at_new = EXTRACT(EPOCH FROM created_at) * 1000;
UPDATE activity_stats SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000, updated_at_new = EXTRACT(EPOCH FROM updated_at) * 1000;
UPDATE user_activity_stats SET last_completed_at_new = EXTRACT(EPOCH FROM last_completed_at) * 1000, created_at_new = EXTRACT(EPOCH FROM created_at) * 1000, updated_at_new = EXTRACT(EPOCH FROM updated_at) * 1000;
UPDATE challenge_activity_mapping SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000;
UPDATE permissions SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000;
UPDATE role_permissions SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000;
UPDATE admin_users SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000, updated_at_new = EXTRACT(EPOCH FROM updated_at) * 1000;
UPDATE duas SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000, updated_at_new = EXTRACT(EPOCH FROM updated_at) * 1000;
UPDATE dua_categories SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000;
UPDATE app_settings SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000, updated_at_new = EXTRACT(EPOCH FROM updated_at) * 1000;
UPDATE user_settings SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000, updated_at_new = EXTRACT(EPOCH FROM updated_at) * 1000;
UPDATE notifications SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000;
UPDATE webauthn_credentials SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000, updated_at_new = EXTRACT(EPOCH FROM updated_at) * 1000, last_used_at_new = EXTRACT(EPOCH FROM last_used_at) * 1000;
UPDATE api_logs SET timestamp_new = EXTRACT(EPOCH FROM timestamp) * 1000;
UPDATE user_missed_challenges SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000;
UPDATE ai_chat_sessions SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000, updated_at_new = EXTRACT(EPOCH FROM updated_at) * 1000;
UPDATE ai_chat_messages SET created_at_new = EXTRACT(EPOCH FROM created_at) * 1000;

-- Drop old columns and rename new ones
ALTER TABLE challenge_templates DROP COLUMN created_at;
ALTER TABLE challenge_templates DROP COLUMN updated_at;
ALTER TABLE challenge_templates RENAME COLUMN created_at_new TO created_at;
ALTER TABLE challenge_templates RENAME COLUMN updated_at_new TO updated_at;

ALTER TABLE user_challenge_progress DROP COLUMN started_at;
ALTER TABLE user_challenge_progress DROP COLUMN last_completed_at;
ALTER TABLE user_challenge_progress DROP COLUMN completed_at;
ALTER TABLE user_challenge_progress DROP COLUMN paused_at;
ALTER TABLE user_challenge_progress DROP COLUMN created_at;
ALTER TABLE user_challenge_progress DROP COLUMN updated_at;
ALTER TABLE user_challenge_progress RENAME COLUMN started_at_new TO started_at;
ALTER TABLE user_challenge_progress RENAME COLUMN last_completed_at_new TO last_completed_at;
ALTER TABLE user_challenge_progress RENAME COLUMN completed_at_new TO completed_at;
ALTER TABLE user_challenge_progress RENAME COLUMN paused_at_new TO paused_at;
ALTER TABLE user_challenge_progress RENAME COLUMN created_at_new TO created_at;
ALTER TABLE user_challenge_progress RENAME COLUMN updated_at_new TO updated_at;

ALTER TABLE user_challenge_daily_logs DROP COLUMN started_at;
ALTER TABLE user_challenge_daily_logs DROP COLUMN completed_at;
ALTER TABLE user_challenge_daily_logs DROP COLUMN created_at;
ALTER TABLE user_challenge_daily_logs RENAME COLUMN started_at_new TO started_at;
ALTER TABLE user_challenge_daily_logs RENAME COLUMN completed_at_new TO completed_at;
ALTER TABLE user_challenge_daily_logs RENAME COLUMN created_at_new TO created_at;

ALTER TABLE activity_stats DROP COLUMN created_at;
ALTER TABLE activity_stats DROP COLUMN updated_at;
ALTER TABLE activity_stats RENAME COLUMN created_at_new TO created_at;
ALTER TABLE activity_stats RENAME COLUMN updated_at_new TO updated_at;

ALTER TABLE user_activity_stats DROP COLUMN last_completed_at;
ALTER TABLE user_activity_stats DROP COLUMN created_at;
ALTER TABLE user_activity_stats DROP COLUMN updated_at;
ALTER TABLE user_activity_stats RENAME COLUMN last_completed_at_new TO last_completed_at;
ALTER TABLE user_activity_stats RENAME COLUMN created_at_new TO created_at;
ALTER TABLE user_activity_stats RENAME COLUMN updated_at_new TO updated_at;

ALTER TABLE challenge_activity_mapping DROP COLUMN created_at;
ALTER TABLE challenge_activity_mapping RENAME COLUMN created_at_new TO created_at;

ALTER TABLE permissions DROP COLUMN created_at;
ALTER TABLE permissions RENAME COLUMN created_at_new TO created_at;

ALTER TABLE role_permissions DROP COLUMN created_at;
ALTER TABLE role_permissions RENAME COLUMN created_at_new TO created_at;

ALTER TABLE admin_users DROP COLUMN created_at;
ALTER TABLE admin_users DROP COLUMN updated_at;
ALTER TABLE admin_users RENAME COLUMN created_at_new TO created_at;
ALTER TABLE admin_users RENAME COLUMN updated_at_new TO updated_at;

ALTER TABLE duas DROP COLUMN created_at;
ALTER TABLE duas DROP COLUMN updated_at;
ALTER TABLE duas RENAME COLUMN created_at_new TO created_at;
ALTER TABLE duas RENAME COLUMN updated_at_new TO updated_at;

ALTER TABLE dua_categories DROP COLUMN created_at;
ALTER TABLE dua_categories RENAME COLUMN created_at_new TO created_at;

ALTER TABLE app_settings DROP COLUMN created_at;
ALTER TABLE app_settings DROP COLUMN updated_at;
ALTER TABLE app_settings RENAME COLUMN created_at_new TO created_at;
ALTER TABLE app_settings RENAME COLUMN updated_at_new TO updated_at;

ALTER TABLE user_settings DROP COLUMN created_at;
ALTER TABLE user_settings DROP COLUMN updated_at;
ALTER TABLE user_settings RENAME COLUMN created_at_new TO created_at;
ALTER TABLE user_settings RENAME COLUMN updated_at_new TO updated_at;

ALTER TABLE notifications DROP COLUMN created_at;
ALTER TABLE notifications RENAME COLUMN created_at_new TO created_at;

ALTER TABLE webauthn_credentials DROP COLUMN created_at;
ALTER TABLE webauthn_credentials DROP COLUMN updated_at;
ALTER TABLE webauthn_credentials DROP COLUMN last_used_at;
ALTER TABLE webauthn_credentials RENAME COLUMN created_at_new TO created_at;
ALTER TABLE webauthn_credentials RENAME COLUMN updated_at_new TO updated_at;
ALTER TABLE webauthn_credentials RENAME COLUMN last_used_at_new TO last_used_at;

ALTER TABLE api_logs DROP COLUMN timestamp;
ALTER TABLE api_logs RENAME COLUMN timestamp_new TO timestamp;

ALTER TABLE user_missed_challenges DROP COLUMN created_at;
ALTER TABLE user_missed_challenges RENAME COLUMN created_at_new TO created_at;

ALTER TABLE ai_chat_sessions DROP COLUMN created_at;
ALTER TABLE ai_chat_sessions DROP COLUMN updated_at;
ALTER TABLE ai_chat_sessions RENAME COLUMN created_at_new TO created_at;
ALTER TABLE ai_chat_sessions RENAME COLUMN updated_at_new TO updated_at;

ALTER TABLE ai_chat_messages DROP COLUMN created_at;
ALTER TABLE ai_chat_messages RENAME COLUMN created_at_new TO created_at;

-- Set defaults for new records
ALTER TABLE challenge_templates ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE challenge_templates ALTER COLUMN updated_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE user_challenge_progress ALTER COLUMN started_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE user_challenge_progress ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE user_challenge_progress ALTER COLUMN updated_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE user_challenge_daily_logs ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE activity_stats ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE activity_stats ALTER COLUMN updated_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE user_activity_stats ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE user_activity_stats ALTER COLUMN updated_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE challenge_activity_mapping ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE permissions ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE role_permissions ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE admin_users ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE admin_users ALTER COLUMN updated_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE duas ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE duas ALTER COLUMN updated_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE dua_categories ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE app_settings ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE app_settings ALTER COLUMN updated_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE user_settings ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE user_settings ALTER COLUMN updated_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE notifications ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE webauthn_credentials ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE webauthn_credentials ALTER COLUMN updated_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE api_logs ALTER COLUMN timestamp SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE user_missed_challenges ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE ai_chat_sessions ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE ai_chat_sessions ALTER COLUMN updated_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
ALTER TABLE ai_chat_messages ALTER COLUMN created_at SET DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;