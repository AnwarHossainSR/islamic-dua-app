-- ============================================
-- ISLAMIC DUA APP - SQLite / libSQL SCHEMA
-- ============================================
-- Works with a local SQLite file (file:./data/local.db) or Turso (libsql://...).
-- All ids are TEXT (uuid v4 generated in application code).
-- Timestamps that were TIMESTAMPTZ in Postgres are stored as ISO-8601 TEXT.
-- Timestamps that were BIGINT epoch-millis in Postgres remain INTEGER millis.
-- Booleans are stored as INTEGER 0/1.
-- ============================================

-- Auth users (replaces Supabase Auth `auth.users`)
CREATE TABLE IF NOT EXISTS auth_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  email_confirmed INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Admin Users
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Challenge Templates
CREATE TABLE IF NOT EXISTS challenge_templates (
  id TEXT PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  description_bn TEXT,
  description_ar TEXT,
  description_en TEXT,
  arabic_text TEXT NOT NULL,
  transliteration_bn TEXT,
  translation_bn TEXT NOT NULL,
  translation_en TEXT,
  daily_target_count INTEGER NOT NULL DEFAULT 21,
  total_days INTEGER NOT NULL DEFAULT 21,
  recommended_time TEXT,
  recommended_prayer TEXT,
  reference TEXT,
  fazilat_bn TEXT,
  fazilat_ar TEXT,
  fazilat_en TEXT,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  icon TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  is_featured INTEGER DEFAULT 0,
  total_participants INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- User Challenge Progress
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge_id TEXT REFERENCES challenge_templates(id) ON DELETE CASCADE,
  current_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completed_days INTEGER DEFAULT 0,
  missed_days INTEGER DEFAULT 0,
  started_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_completed_at INTEGER,
  completed_at INTEGER,
  paused_at INTEGER,
  daily_reminder_enabled INTEGER DEFAULT 1,
  reminder_time TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- User Challenge Daily Logs
CREATE TABLE IF NOT EXISTS user_challenge_daily_logs (
  id TEXT PRIMARY KEY,
  user_progress_id TEXT REFERENCES user_challenge_progress(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  challenge_id TEXT REFERENCES challenge_templates(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  completion_date TEXT NOT NULL DEFAULT (date('now')),
  count_completed INTEGER NOT NULL,
  target_count INTEGER NOT NULL,
  is_completed INTEGER DEFAULT 0,
  started_at INTEGER,
  completed_at INTEGER,
  duration_seconds INTEGER,
  notes TEXT,
  mood TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Activity Stats
CREATE TABLE IF NOT EXISTS activity_stats (
  id TEXT PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  unique_slug TEXT UNIQUE NOT NULL,
  total_count INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  arabic_text TEXT,
  activity_type TEXT DEFAULT 'dhikr',
  icon TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- User Activity Stats
CREATE TABLE IF NOT EXISTS user_activity_stats (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  activity_stat_id TEXT REFERENCES activity_stats(id) ON DELETE CASCADE,
  total_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_at INTEGER,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(user_id, activity_stat_id)
);

-- Challenge <-> Activity mapping
CREATE TABLE IF NOT EXISTS challenge_activity_mapping (
  id TEXT PRIMARY KEY,
  challenge_id TEXT REFERENCES challenge_templates(id) ON DELETE CASCADE,
  activity_stat_id TEXT REFERENCES activity_stats(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Duas
CREATE TABLE IF NOT EXISTS duas (
  id TEXT PRIMARY KEY,
  title_bn TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  dua_text_ar TEXT NOT NULL,
  translation_bn TEXT,
  translation_en TEXT,
  transliteration TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  source TEXT,
  reference TEXT,
  benefits TEXT,
  is_important INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  tags TEXT, -- JSON-encoded array of strings
  audio_url TEXT,
  created_by TEXT,
  created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000),
  updated_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000)
);

-- Dua Categories
CREATE TABLE IF NOT EXISTS dua_categories (
  id TEXT PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#10b981',
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- App Settings
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  type TEXT NOT NULL DEFAULT 'string',
  label TEXT NOT NULL,
  description TEXT,
  is_public INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(user_id, key)
);

-- Permissions
CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  resource TEXT,
  action TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Role -> Permission mapping (role stored as text)
CREATE TABLE IF NOT EXISTS role_permissions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  permission_id TEXT NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE(role, permission_id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT DEFAULT '🔔',
  action_url TEXT,
  is_read INTEGER DEFAULT 0,
  expires_at INTEGER,
  metadata TEXT,
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- WebAuthn Credentials
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter INTEGER NOT NULL DEFAULT 0,
  device_name TEXT NOT NULL DEFAULT 'Unknown Device',
  device_type TEXT DEFAULT 'platform',
  last_used_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- API Logs
CREATE TABLE IF NOT EXISTS api_logs (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  meta TEXT,
  timestamp INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000)
);

-- User Missed Challenges
CREATE TABLE IF NOT EXISTS user_missed_challenges (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL REFERENCES challenge_templates(id) ON DELETE CASCADE,
  missed_date TEXT NOT NULL,
  reason TEXT DEFAULT 'not_completed',
  was_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000),
  UNIQUE(user_id, challenge_id, missed_date)
);

-- AI Chat Sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  chat_mode TEXT NOT NULL DEFAULT 'general' CHECK (chat_mode IN ('general', 'database')),
  created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000),
  updated_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000)
);

-- AI Chat Messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata TEXT,
  created_at INTEGER DEFAULT (CAST(strftime('%s','now') AS INTEGER) * 1000)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_duas_category ON duas(category);
CREATE INDEX IF NOT EXISTS idx_duas_is_active ON duas(is_active);
CREATE INDEX IF NOT EXISTS idx_ucp_user ON user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ucdl_user ON user_challenge_daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ucdl_progress ON user_challenge_daily_logs(user_progress_id);
CREATE INDEX IF NOT EXISTS idx_uas_user ON user_activity_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_umc_user ON user_missed_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_ts ON api_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user ON ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_session ON ai_chat_messages(session_id);
