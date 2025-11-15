-- ============================================
-- ISLAMIC DUA APP - COMPLETE DATABASE SCHEMA
-- ============================================
-- This is a merged version of all SQL scripts
-- Can be run on a fresh database to set up everything
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Admin Users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin', 'admin', 'editor')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHALLENGE SYSTEM
-- ============================================

-- Challenge Templates
CREATE TABLE IF NOT EXISTS challenge_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  
  -- Challenge settings
  daily_target_count INTEGER NOT NULL DEFAULT 21,
  total_days INTEGER NOT NULL DEFAULT 21,
  recommended_time TEXT,
  recommended_prayer TEXT,
  
  -- Metadata
  reference TEXT,
  fazilat_bn TEXT,
  fazilat_ar TEXT,
  fazilat_en TEXT,
  difficulty_level TEXT DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  
  -- Display
  icon TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  
  -- Stats
  total_participants INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Challenge Progress
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  challenge_id UUID REFERENCES challenge_templates(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'failed', 'paused')),
  
  -- Streak tracking
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_completed_days INTEGER DEFAULT 0,
  missed_days INTEGER DEFAULT 0,
  
  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_completed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  paused_at TIMESTAMPTZ,
  
  -- Settings
  daily_reminder_enabled BOOLEAN DEFAULT true,
  reminder_time TIME,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, challenge_id, started_at)
);

-- Daily Completion Records
CREATE TABLE IF NOT EXISTS user_challenge_daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_progress_id UUID REFERENCES user_challenge_progress(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  challenge_id UUID REFERENCES challenge_templates(id) ON DELETE CASCADE,
  
  -- Day info
  day_number INTEGER NOT NULL,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Completion details
  count_completed INTEGER NOT NULL,
  target_count INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  
  -- Time tracking
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  -- Optional notes
  notes TEXT,
  mood TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_progress_id, day_number)
);

-- ============================================
-- ACTIVITY STATS SYSTEM
-- ============================================

-- Main activity stats table
CREATE TABLE IF NOT EXISTS activity_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  name_bn TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  unique_slug TEXT UNIQUE NOT NULL,
  
  -- Global Stats
  total_count BIGINT DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  
  -- Activity Details
  arabic_text TEXT,
  activity_type TEXT DEFAULT 'dhikr',
  
  -- Display
  icon TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-specific activity stats
CREATE TABLE IF NOT EXISTS user_activity_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  activity_stat_id UUID REFERENCES activity_stats(id) ON DELETE CASCADE,
  
  -- User's personal count
  total_completed BIGINT DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Last activity
  last_completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, activity_stat_id)
);

-- Link challenges to activity stats
CREATE TABLE IF NOT EXISTS challenge_activity_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenge_templates(id) ON DELETE CASCADE,
  activity_stat_id UUID REFERENCES activity_stats(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(challenge_id, activity_stat_id)
);

-- ============================================
-- DUAS MANAGEMENT
-- ============================================

-- Duas table
CREATE TABLE IF NOT EXISTS duas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
  is_important BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  audio_url TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dua Categories table
CREATE TABLE IF NOT EXISTS dua_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_bn TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#10b981',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SETTINGS SYSTEM
-- ============================================

-- App settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  type TEXT NOT NULL DEFAULT 'string',
  label TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- ============================================
-- PERMISSIONS SYSTEM
-- ============================================

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Permissions junction table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id UUID NOT NULL REFERENCES user_roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS SYSTEM
-- ============================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT DEFAULT '🔔',
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  metadata TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WEBAUTHN SYSTEM
-- ============================================

-- WebAuthn credentials table
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_name TEXT NOT NULL DEFAULT 'Unknown Device',
  device_type TEXT DEFAULT 'platform',
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- API LOGS
-- ============================================

-- API logs table
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  meta TEXT,
  timestamp BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- ============================================
-- MISSED CHALLENGES TRACKING
-- ============================================

-- Missed challenges table
CREATE TABLE IF NOT EXISTS user_missed_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES challenge_templates(id) ON DELETE CASCADE,
  missed_date DATE NOT NULL,
  reason TEXT DEFAULT 'not_completed',
  was_active BOOLEAN DEFAULT true,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  UNIQUE(user_id, challenge_id, missed_date)
);

-- ============================================
-- AI CHAT SYSTEM
-- ============================================

-- AI Chat Sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  chat_mode TEXT NOT NULL DEFAULT 'general' CHECK (chat_mode IN ('general', 'database')),
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT,
  updated_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- AI Chat Messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata TEXT,
  created_at BIGINT DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);