-- ============================================
-- USER ACTIVITY STATS TRACKING SYSTEM
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
-- When challenge is created, link to activity_stats
-- When challenge is deleted, this link is removed (but activity_stats remains)
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

-- Challenge activity mapping policies
CREATE POLICY "Challenge activity mapping viewable by everyone"
  ON challenge_activity_mapping FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage challenge activity mapping"
  ON challenge_activity_mapping FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to increment activity stats when challenge is completed
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
    
    -- If no mapping found, skip
    IF v_activity_stat_id IS NULL THEN
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

-- Function to create activity stat when challenge is created
CREATE OR REPLACE FUNCTION create_activity_stat_for_challenge()
RETURNS TRIGGER AS $$
DECLARE
  v_activity_stat_id UUID;
  v_slug TEXT;
BEGIN
  -- Generate slug from title_en or title_bn
  v_slug := LOWER(REGEXP_REPLACE(
    COALESCE(NEW.title_en, NEW.title_bn), 
    '[^a-zA-Z0-9]+', 
    '-', 
    'g'
  ));
  
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
      'dhikr',
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
-- SEED DATA - Create activity stats for existing challenges
-- ============================================

-- Insert activity stats for existing challenges
INSERT INTO activity_stats (name_bn, name_ar, name_en, unique_slug, arabic_text, activity_type, icon, color)
VALUES
  (
    'ইস্তিগফার',
    'الاستغفار',
    'Istighfar',
    'istighfar',
    'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    'dhikr',
    '🤲',
    '#10b981'
  ),
  (
    'সুবহানাল্লাহি ওয়া বিহামদিহি',
    'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    'Subhanallahi wa bihamdihi',
    'subhanallah-wa-bihamdihi',
    'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    'dhikr',
    '📿',
    '#3b82f6'
  ),
  (
    'দুরূদ শরীফ',
    'الصلاة على النبي',
    'Durood Shareef',
    'durood-shareef',
    'صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ',
    'dhikr',
    '🤲',
    '#10b981'
  ),
  (
    'তাহাজ্জুদ নামাজ',
    'قيام الليل',
    'Tahajjud Prayer',
    'tahajjud-prayer',
    'none',
    'prayer',
    '🌙',
    '#10b981'
  ),
  (
    'যুন্নুনের দোয়া',
    'دعاء ذي النون',
    'Dua of Yunus',
    'dua-yunus',
    'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    'dua',
    '🤲',
    '#8b5cf6'
  )
ON CONFLICT (unique_slug) DO NOTHING;

-- Link existing challenges to activity stats
INSERT INTO challenge_activity_mapping (challenge_id, activity_stat_id)
SELECT 
  ct.id as challenge_id,
  ast.id as activity_stat_id
FROM challenge_templates ct
JOIN activity_stats ast ON (
  -- Match by title or slug
  LOWER(REGEXP_REPLACE(COALESCE(ct.title_en, ct.title_bn), '[^a-zA-Z0-9]+', '-', 'g')) = ast.unique_slug
)
ON CONFLICT (challenge_id, activity_stat_id) DO NOTHING;

-- Update existing activity stats with current completion counts
UPDATE activity_stats ast
SET 
  total_count = COALESCE((
    SELECT SUM(cdl.count_completed)
    FROM user_challenge_daily_logs cdl
    JOIN challenge_activity_mapping cam ON cam.challenge_id = cdl.challenge_id
    WHERE cam.activity_stat_id = ast.id
      AND cdl.is_completed = true
  ), 0),
  total_users = COALESCE((
    SELECT COUNT(DISTINCT cdl.user_id)
    FROM user_challenge_daily_logs cdl
    JOIN challenge_activity_mapping cam ON cam.challenge_id = cdl.challenge_id
    WHERE cam.activity_stat_id = ast.id
      AND cdl.is_completed = true
  ), 0);