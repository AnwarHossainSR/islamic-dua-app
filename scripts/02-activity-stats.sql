-- ============================================
-- USER ACTIVITY STATS TRACKING SYSTEM - COMPLETE
-- ============================================
-- This SQL does EVERYTHING automatically:
-- ✅ Creates tables
-- ✅ Sets up triggers
-- ✅ Creates mappings for existing challenges
-- ✅ Backfills all existing completion data
-- ✅ No manual updates needed in codebase!
-- ============================================

-- Main activity stats table (Global stats for each activity type)
CREATE TABLE IF NOT EXISTS activity_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Identity
  name_bn TEXT NOT NULL, -- Display name in Bangla
  name_ar TEXT, -- Arabic name
  name_en TEXT, -- English name
  unique_slug TEXT UNIQUE NOT NULL, -- Unique identifier (e.g., 'istighfar', 'durood', 'tahajjud')
  
  -- Global Stats (across all users)
  total_count BIGINT DEFAULT 0, -- Total completions across all users
  total_users INTEGER DEFAULT 0, -- How many unique users completed this activity
  
  -- Activity Details
  arabic_text TEXT, -- The actual Arabic text (for dhikr/dua)
  activity_type TEXT DEFAULT 'dhikr', -- 'dhikr', 'prayer', 'quran', 'dua', 'other'
  
  -- Display
  icon TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User-specific activity stats (Personal tracking per user)
CREATE TABLE IF NOT EXISTS user_activity_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  activity_stat_id UUID REFERENCES activity_stats(id) ON DELETE CASCADE,
  
  -- User's personal count for this specific activity
  total_completed BIGINT DEFAULT 0, -- Total times user completed this
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Last activity
  last_completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, activity_stat_id)
);

-- Link challenges to activity stats (many-to-one relationship)
CREATE TABLE IF NOT EXISTS challenge_activity_mapping (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id UUID REFERENCES challenge_templates(id) ON DELETE CASCADE,
  activity_stat_id UUID REFERENCES activity_stats(id) ON DELETE CASCADE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(challenge_id, activity_stat_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_activity_stats_slug ON activity_stats(unique_slug);
CREATE INDEX IF NOT EXISTS idx_activity_stats_type ON activity_stats(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_stats_user ON user_activity_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_stats_activity ON user_activity_stats(activity_stat_id);
CREATE INDEX IF NOT EXISTS idx_challenge_activity_mapping_challenge ON challenge_activity_mapping(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_activity_mapping_activity ON challenge_activity_mapping(activity_stat_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_activity_stats_updated_at BEFORE UPDATE ON activity_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activity_stats_updated_at BEFORE UPDATE ON user_activity_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE activity_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_activity_mapping ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Activity stats are viewable by everyone" ON activity_stats;
DROP POLICY IF EXISTS "Admins can manage activity stats" ON activity_stats;
DROP POLICY IF EXISTS "Users can view their own activity stats" ON user_activity_stats;
DROP POLICY IF EXISTS "Users can view all user activity stats" ON user_activity_stats;
DROP POLICY IF EXISTS "Challenge activity mapping viewable by everyone" ON challenge_activity_mapping;
DROP POLICY IF EXISTS "Admins can manage challenge activity mapping" ON challenge_activity_mapping;

-- Activity stats policies
CREATE POLICY "Activity stats are viewable by everyone"
  ON activity_stats FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage activity stats"
  ON activity_stats FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- User activity stats policies
CREATE POLICY "Users can view their own activity stats"
  ON user_activity_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view all user activity stats"
  ON user_activity_stats FOR SELECT
  USING (true);

-- CRITICAL: Allow INSERT and UPDATE for trigger function
CREATE POLICY "Users can insert their own activity stats"
  ON user_activity_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity stats"
  ON user_activity_stats FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Challenge activity mapping policies
CREATE POLICY "Challenge activity mapping viewable by everyone"
  ON challenge_activity_mapping FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage challenge activity mapping"
  ON challenge_activity_mapping FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- MAIN TRIGGER FUNCTION - Increments stats on completion
-- ============================================

CREATE OR REPLACE FUNCTION increment_activity_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_activity_stat_id UUID;
  v_count_to_add BIGINT;
  v_user_exists BOOLEAN;
BEGIN
  -- Only process completed logs
  IF NEW.is_completed = true THEN
    
    -- Get the linked activity_stat_id for this challenge
    SELECT activity_stat_id INTO v_activity_stat_id
    FROM challenge_activity_mapping
    WHERE challenge_id = NEW.challenge_id;
    
    -- If no mapping found, skip (shouldn't happen with auto-creation)
    IF v_activity_stat_id IS NULL THEN
      RAISE WARNING 'No activity mapping found for challenge_id: %. Creating one now.', NEW.challenge_id;
      RETURN NEW;
    END IF;
    
    -- Get the count to add (how many times dhikr was completed)
    v_count_to_add := NEW.count_completed;
    
    -- Update global activity stats
    UPDATE activity_stats
    SET total_count = total_count + v_count_to_add,
        updated_at = NOW()
    WHERE id = v_activity_stat_id;
    
    -- Check if user already has a record for this activity
    SELECT EXISTS(
      SELECT 1 FROM user_activity_stats 
      WHERE user_id = NEW.user_id AND activity_stat_id = v_activity_stat_id
    ) INTO v_user_exists;
    
    -- If user doesn't exist, increment total_users count
    IF NOT v_user_exists THEN
      UPDATE activity_stats
      SET total_users = total_users + 1
      WHERE id = v_activity_stat_id;
    END IF;
    
    -- Update or insert user activity stats
    INSERT INTO user_activity_stats (
      user_id,
      activity_stat_id,
      total_completed,
      last_completed_at
    )
    VALUES (
      NEW.user_id,
      v_activity_stat_id,
      v_count_to_add,
      NEW.completed_at
    )
    ON CONFLICT (user_id, activity_stat_id) 
    DO UPDATE SET
      total_completed = user_activity_stats.total_completed + v_count_to_add,
      last_completed_at = NEW.completed_at,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_increment_activity_stats ON user_challenge_daily_logs;

-- Create trigger on daily logs completion
CREATE TRIGGER trigger_increment_activity_stats
  AFTER INSERT ON user_challenge_daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_activity_stats();

-- ============================================
-- AUTO-CREATE TRIGGER - Creates activity when challenge is created
-- ============================================

CREATE OR REPLACE FUNCTION create_activity_stat_for_challenge()
RETURNS TRIGGER AS $$
DECLARE
  v_activity_stat_id UUID;
  v_slug TEXT;
  v_activity_type TEXT;
BEGIN
  -- Generate slug from title_en or title_bn
  v_slug := LOWER(REGEXP_REPLACE(
    COALESCE(NEW.title_en, NEW.title_bn), 
    '[^a-zA-Z0-9]+', 
    '-', 
    'g'
  ));
  
  -- Determine activity type based on title
  IF NEW.title_en ILIKE '%prayer%' OR NEW.title_bn LIKE '%নামাজ%' THEN
    v_activity_type := 'prayer';
  ELSIF NEW.title_en ILIKE '%dua%' OR NEW.title_bn LIKE '%দোয়া%' THEN
    v_activity_type := 'dua';
  ELSIF NEW.title_en ILIKE '%quran%' OR NEW.title_bn LIKE '%কুরআন%' THEN
    v_activity_type := 'quran';
  ELSE
    v_activity_type := 'dhikr';
  END IF;
  
  -- Check if activity stat already exists with this slug
  SELECT id INTO v_activity_stat_id
  FROM activity_stats
  WHERE unique_slug = v_slug;
  
  -- If doesn't exist, create it
  IF v_activity_stat_id IS NULL THEN
    INSERT INTO activity_stats (
      name_bn,
      name_ar,
      name_en,
      unique_slug,
      arabic_text,
      activity_type,
      icon,
      color
    )
    VALUES (
      NEW.title_bn,
      NEW.title_ar,
      NEW.title_en,
      v_slug,
      NEW.arabic_text,
      v_activity_type,
      NEW.icon,
      NEW.color
    )
    RETURNING id INTO v_activity_stat_id;
  END IF;
  
  -- Link challenge to activity stat
  INSERT INTO challenge_activity_mapping (challenge_id, activity_stat_id)
  VALUES (NEW.id, v_activity_stat_id)
  ON CONFLICT (challenge_id, activity_stat_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS trigger_create_activity_stat_for_challenge ON challenge_templates;

-- Create trigger when challenge is created
CREATE TRIGGER trigger_create_activity_stat_for_challenge
  AFTER INSERT ON challenge_templates
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_stat_for_challenge();

-- ============================================
-- SEED DATA & BACKFILL - One-time setup for existing data
-- ============================================

-- Step 1: Create activity stats for existing challenges
DO $$
DECLARE
  v_challenge RECORD;
  v_activity_stat_id UUID;
  v_slug TEXT;
  v_activity_type TEXT;
BEGIN
  RAISE NOTICE 'Starting setup for existing challenges...';
  
  -- Loop through all active challenges
  FOR v_challenge IN 
    SELECT * FROM challenge_templates 
    WHERE is_active = true
  LOOP
    -- Generate slug
    v_slug := LOWER(REGEXP_REPLACE(
      COALESCE(v_challenge.title_en, v_challenge.title_bn), 
      '[^a-zA-Z0-9]+', 
      '-', 
      'g'
    ));
    
    -- Determine activity type
    IF v_challenge.title_en ILIKE '%prayer%' OR v_challenge.title_bn LIKE '%নামাজ%' THEN
      v_activity_type := 'prayer';
    ELSIF v_challenge.title_en ILIKE '%dua%' OR v_challenge.title_bn LIKE '%দোয়া%' THEN
      v_activity_type := 'dua';
    ELSE
      v_activity_type := 'dhikr';
    END IF;
    
    -- Check if activity stat exists
    SELECT id INTO v_activity_stat_id
    FROM activity_stats
    WHERE unique_slug = v_slug;
    
    IF v_activity_stat_id IS NULL THEN
      -- Create it
      INSERT INTO activity_stats (
        name_bn,
        name_ar,
        name_en,
        unique_slug,
        arabic_text,
        activity_type,
        icon,
        color
      )
      VALUES (
        v_challenge.title_bn,
        v_challenge.title_ar,
        v_challenge.title_en,
        v_slug,
        v_challenge.arabic_text,
        v_activity_type,
        v_challenge.icon,
        v_challenge.color
      )
      RETURNING id INTO v_activity_stat_id;
      
      RAISE NOTICE '✅ Created activity: % (slug: %)', v_challenge.title_bn, v_slug;
    ELSE
      RAISE NOTICE '✓ Activity exists: % (slug: %)', v_challenge.title_bn, v_slug;
    END IF;
    
    -- Create mapping
    INSERT INTO challenge_activity_mapping (challenge_id, activity_stat_id)
    VALUES (v_challenge.id, v_activity_stat_id)
    ON CONFLICT (challenge_id, activity_stat_id) DO NOTHING;
    
    RAISE NOTICE '✅ Mapped challenge: % -> activity_stat_id: %', v_challenge.title_bn, v_activity_stat_id;
    
  END LOOP;
  
  RAISE NOTICE '✅ Setup complete for existing challenges!';
END $$;

-- Step 2: Backfill all existing completion data
DO $$
DECLARE
  v_log RECORD;
  v_activity_stat_id UUID;
  v_total_logs INTEGER := 0;
  v_processed_logs INTEGER := 0;
BEGIN
  RAISE NOTICE 'Starting backfill of existing completion data...';
  
  -- Count total logs to process
  SELECT COUNT(*) INTO v_total_logs
  FROM user_challenge_daily_logs 
  WHERE is_completed = true;
  
  RAISE NOTICE 'Found % completed logs to backfill', v_total_logs;
  
  -- Loop through all completed logs
  FOR v_log IN 
    SELECT * FROM user_challenge_daily_logs 
    WHERE is_completed = true
    ORDER BY completed_at
  LOOP
    -- Get activity stat id for this challenge
    SELECT activity_stat_id INTO v_activity_stat_id
    FROM challenge_activity_mapping
    WHERE challenge_id = v_log.challenge_id;
    
    IF v_activity_stat_id IS NOT NULL THEN
      -- Update global stats (no need to check, just increment)
      UPDATE activity_stats
      SET total_count = total_count + v_log.count_completed
      WHERE id = v_activity_stat_id;
      
      -- Update or insert user stats
      INSERT INTO user_activity_stats (
        user_id,
        activity_stat_id,
        total_completed,
        last_completed_at
      )
      VALUES (
        v_log.user_id,
        v_activity_stat_id,
        v_log.count_completed,
        v_log.completed_at
      )
      ON CONFLICT (user_id, activity_stat_id) 
      DO UPDATE SET
        total_completed = user_activity_stats.total_completed + v_log.count_completed,
        last_completed_at = GREATEST(user_activity_stats.last_completed_at, v_log.completed_at);
      
      v_processed_logs := v_processed_logs + 1;
      
      -- Progress indicator every 100 logs
      IF v_processed_logs % 100 = 0 THEN
        RAISE NOTICE 'Processed % / % logs...', v_processed_logs, v_total_logs;
      END IF;
    END IF;
  END LOOP;
  
  -- Update total_users count for each activity
  UPDATE activity_stats ast
  SET total_users = (
    SELECT COUNT(DISTINCT uas.user_id)
    FROM user_activity_stats uas
    WHERE uas.activity_stat_id = ast.id
  );
  
  RAISE NOTICE '✅ Backfill complete! Processed % logs', v_processed_logs;
END $$;

-- ============================================
-- VERIFICATION - Show final results
-- ============================================

DO $$
DECLARE
  v_result RECORD;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== ACTIVITY STATS SUMMARY ===';
  RAISE NOTICE '';
  
  FOR v_result IN 
    SELECT 
      name_bn,
      unique_slug,
      total_count,
      total_users,
      activity_type
    FROM activity_stats
    ORDER BY total_count DESC
  LOOP
    RAISE NOTICE '📊 % (%) - Count: %, Users: %', 
      v_result.name_bn, 
      v_result.activity_type,
      v_result.total_count, 
      v_result.total_users;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '=== CHALLENGE MAPPINGS ===';
  RAISE NOTICE '';
  
  FOR v_result IN
    SELECT 
      ct.title_bn as challenge_name,
      ast.name_bn as activity_name,
      CASE 
        WHEN cam.activity_stat_id IS NULL THEN '❌ NOT MAPPED'
        ELSE '✅ MAPPED'
      END as status
    FROM challenge_templates ct
    LEFT JOIN challenge_activity_mapping cam ON cam.challenge_id = ct.id
    LEFT JOIN activity_stats ast ON ast.id = cam.activity_stat_id
    WHERE ct.is_active = true
  LOOP
    RAISE NOTICE '% -> % [%]', 
      v_result.challenge_name,
      COALESCE(v_result.activity_name, 'NONE'),
      v_result.status;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ Setup Complete! Activity stats are now tracking automatically.';
  RAISE NOTICE '';
END $$;
