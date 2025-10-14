-- Heaven Rose Islamic - Complete Database Setup
-- This script safely creates/updates all database objects
-- Can be run multiple times without errors

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES (Non-Challenge Parts Unchanged)
-- ============================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_bn TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to existing tables
DO $$ 
BEGIN
  -- Add is_active to categories if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'categories' AND column_name = 'is_active') THEN
    ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_bn TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Duas table
CREATE TABLE IF NOT EXISTS duas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title_bn TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  arabic_text TEXT NOT NULL,
  transliteration_bn TEXT,
  translation_bn TEXT NOT NULL,
  translation_en TEXT,
  reference TEXT,
  audio_url TEXT,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to duas table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'duas' AND column_name = 'is_active') THEN
    ALTER TABLE duas ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Dua Tags junction table
CREATE TABLE IF NOT EXISTS dua_tags (
  dua_id UUID REFERENCES duas(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (dua_id, tag_id)
);

-- Fazilat (Virtues) table
CREATE TABLE IF NOT EXISTS fazilat (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dua_id UUID REFERENCES duas(id) ON DELETE CASCADE,
  text_bn TEXT NOT NULL,
  text_ar TEXT,
  text_en TEXT,
  reference TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Day-wise Duas table
CREATE TABLE IF NOT EXISTS day_wise_duas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dua_id UUID REFERENCES duas(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(dua_id, day_of_week)
);

-- Dhikr Presets table
CREATE TABLE IF NOT EXISTS dhikr_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_bn TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  arabic_text TEXT NOT NULL,
  transliteration_bn TEXT,
  translation_bn TEXT NOT NULL,
  target_count INTEGER NOT NULL DEFAULT 33,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to dhikr_presets table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'dhikr_presets' AND column_name = 'is_active') THEN
    ALTER TABLE dhikr_presets ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- User Bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  dua_id UUID REFERENCES duas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, dua_id)
);

-- User Preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  language TEXT DEFAULT 'bn',
  theme TEXT DEFAULT 'light',
  font_size TEXT DEFAULT 'medium',
  show_transliteration BOOLEAN DEFAULT true,
  show_translation BOOLEAN DEFAULT true,
  auto_play_audio BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Add missing columns to admin_users table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'admin_users' AND column_name = 'is_active') THEN
    ALTER TABLE admin_users ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ============================================
-- INDEXES (Non-Challenge Parts Unchanged)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_duas_category ON duas(category_id);
CREATE INDEX IF NOT EXISTS idx_duas_featured ON duas(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_duas_active ON duas(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_day_wise_duas_day ON day_wise_duas(day_of_week);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_fazilat_dua ON fazilat(dua_id);

-- ============================================
-- TRIGGERS (Non-Challenge Parts Unchanged)
-- ============================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_duas_updated_at ON duas;
DROP TRIGGER IF EXISTS update_dhikr_presets_updated_at ON dhikr_presets;
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_duas_updated_at BEFORE UPDATE ON duas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dhikr_presets_updated_at BEFORE UPDATE ON dhikr_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (Non-Challenge Parts Unchanged)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE duas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dua_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE fazilat ENABLE ROW LEVEL SECURITY;
ALTER TABLE day_wise_duas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dhikr_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;
DROP POLICY IF EXISTS "Duas are viewable by everyone" ON duas;
DROP POLICY IF EXISTS "Admins can manage duas" ON duas;
DROP POLICY IF EXISTS "Dua tags are viewable by everyone" ON dua_tags;
DROP POLICY IF EXISTS "Admins can manage dua tags" ON dua_tags;
DROP POLICY IF EXISTS "Fazilat are viewable by everyone" ON fazilat;
DROP POLICY IF EXISTS "Admins can manage fazilat" ON fazilat;
DROP POLICY IF EXISTS "Day wise duas are viewable by everyone" ON day_wise_duas;
DROP POLICY IF EXISTS "Admins can manage day wise duas" ON day_wise_duas;
DROP POLICY IF EXISTS "Dhikr presets are viewable by everyone" ON dhikr_presets;
DROP POLICY IF EXISTS "Admins can manage dhikr presets" ON dhikr_presets;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON user_bookmarks;
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON user_bookmarks;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view their own admin record" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;

-- Drop and recreate helper functions
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_super_admin();

-- Create helper functions with SECURITY DEFINER to avoid RLS recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Tags policies
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage tags"
  ON tags FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Duas policies
CREATE POLICY "Duas are viewable by everyone"
  ON duas FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage duas"
  ON duas FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Dua tags policies
CREATE POLICY "Dua tags are viewable by everyone"
  ON dua_tags FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage dua tags"
  ON dua_tags FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Fazilat policies
CREATE POLICY "Fazilat are viewable by everyone"
  ON fazilat FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage fazilat"
  ON fazilat FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Day wise duas policies
CREATE POLICY "Day wise duas are viewable by everyone"
  ON day_wise_duas FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage day wise duas"
  ON day_wise_duas FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Dhikr presets policies
CREATE POLICY "Dhikr presets are viewable by everyone"
  ON dhikr_presets FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage dhikr presets"
  ON dhikr_presets FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- User bookmarks policies
CREATE POLICY "Users can view their own bookmarks"
  ON user_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks"
  ON user_bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin users policies (simplified to avoid recursion)
CREATE POLICY "Users can view their own admin record"
  ON admin_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ============================================
-- SEED DATA (Non-Challenge Parts Unchanged)
-- ============================================

-- Insert Categories (only if they don't exist)
INSERT INTO categories (name_bn, name_ar, name_en, slug, icon, display_order)
SELECT * FROM (VALUES
  ('সকাল-সন্ধ্যার দোয়া', 'أذكار الصباح والمساء', 'Morning & Evening Duas', 'morning-evening', '🌅', 1),
  ('নামাজের দোয়া', 'أدعية الصلاة', 'Prayer Duas', 'prayer', '🤲', 2),
  ('কুরআনের দোয়া', 'أدعية القرآن', 'Quranic Duas', 'quran', '📖', 3),
  ('ঘুমের দোয়া', 'أذكار النوم', 'Sleep Duas', 'sleep', '🌙', 4),
  ('খাবারের দোয়া', 'أدعية الطعام', 'Food Duas', 'food', '🍽️', 5),
  ('ভ্রমণের দোয়া', 'أدعية السفر', 'Travel Duas', 'travel', '✈️', 6),
  ('রোগ-মুক্তির দোয়া', 'أدعية الشفاء', 'Healing Duas', 'healing', '💊', 7),
  ('তওবার দোয়া', 'أدعية التوبة', 'Repentance Duas', 'repentance', '🙏', 8)
) AS v(name_bn, name_ar, name_en, slug, icon, display_order)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = v.slug);

-- Insert Tags (only if they don't exist)
INSERT INTO tags (name_bn, name_ar, name_en, slug)
SELECT * FROM (VALUES
  ('সুন্নাহ', 'سنة', 'Sunnah', 'sunnah'),
  ('ফজিলতপূর্ণ', 'فضيلة', 'Virtuous', 'virtuous'),
  ('সংক্ষিপ্ত', 'قصير', 'Short', 'short'),
  ('দীর্ঘ', 'طويل', 'Long', 'long'),
  ('প্রতিদিন', 'يومي', 'Daily', 'daily'),
  ('বিশেষ', 'خاص', 'Special', 'special')
) AS v(name_bn, name_ar, name_en, slug)
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = v.slug);

-- Insert Sample Duas (only if they don't exist)
DO $$
DECLARE
  morning_evening_id UUID;
  food_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO morning_evening_id FROM categories WHERE slug = 'morning-evening' LIMIT 1;
  SELECT id INTO food_id FROM categories WHERE slug = 'food' LIMIT 1;

  -- Insert Ayatul Kursi if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM duas WHERE title_en = 'Morning Dua - Ayatul Kursi') THEN
    INSERT INTO duas (category_id, title_bn, title_ar, title_en, arabic_text, transliteration_bn, translation_bn, translation_en, reference, is_featured)
    VALUES (
      morning_evening_id,
      'সকালের দোয়া - আয়াতুল কুরসি',
      'آية الكرسي',
      'Morning Dua - Ayatul Kursi',
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
      'আল্লাহু লা ইলাহা ইল্লা হুওয়াল হাইয়্যুল কাইয়্যুম',
      'আল্লাহ, তিনি ছাড়া কোন উপাস্য নেই। তিনি চিরঞ্জীব, সর্বসত্তার ধারক।',
      'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.',
      'সূরা বাকারা ২:২৫৫',
      true
    );
  END IF;

  -- Insert Dua Before Eating if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM duas WHERE title_en = 'Dua Before Eating') THEN
    INSERT INTO duas (category_id, title_bn, title_ar, title_en, arabic_text, transliteration_bn, translation_bn, translation_en, reference, is_featured)
    VALUES (
      food_id,
      'খাবার শুরুর দোয়া',
      'دعاء قبل الطعام',
      'Dua Before Eating',
      'بِسْمِ اللَّهِ',
      'বিসমিল্লাহ',
      'আল্লাহর নামে (শুরু করছি)',
      'In the name of Allah',
      'বুখারী ও মুসলিম',
      true
    );
  END IF;

  -- Insert Dua After Eating if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM duas WHERE title_en = 'Dua After Eating') THEN
    INSERT INTO duas (category_id, title_bn, title_ar, title_en, arabic_text, transliteration_bn, translation_bn, translation_en, reference)
    VALUES (
      food_id,
      'খাবার শেষের দোয়া',
      'دعاء بعد الطعام',
      'Dua After Eating',
      'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
      'আলহামদুলিল্লাহিল্লাযী আতআমানা ওয়া সাক্বানা ওয়া জাআলানা মুসলিমীন',
      'সকল প্রশংসা আল্লাহর জন্য যিনি আমাদের খাওয়ালেন, পান করালেন এবং আমাদের মুসলিম বানালেন।',
      'All praise is due to Allah who fed us, gave us drink, and made us Muslims.',
      'আবু দাউদ ৩৮৫০'
    );
  END IF;
END $$;

-- Insert Dhikr Presets (only if they don't exist)
INSERT INTO dhikr_presets (name_bn, name_ar, name_en, arabic_text, transliteration_bn, translation_bn, target_count, is_default, display_order)
SELECT * FROM (VALUES
  ('সুবহানাল্লাহ', 'سبحان الله', 'SubhanAllah', 'سُبْحَانَ اللَّهِ', 'সুবহানাল্লাহ', 'আল্লাহ পবিত্র', 33, true, 1),
  ('আলহামদুলিল্লাহ', 'الحمد لله', 'Alhamdulillah', 'الْحَمْدُ لِلَّهِ', 'আলহামদুলিল্লাহ', 'সকল প্রশংসা আল্লাহর', 33, true, 2),
  ('আল্লাহু আকবার', 'الله أكبر', 'Allahu Akbar', 'اللَّهُ أَكْبَرُ', 'আল্লাহু আকবার', 'আল্লাহ মহান', 34, true, 3),
  ('লা ইলাহা ইল্লাল্লাহ', 'لا إله إلا الله', 'La ilaha illallah', 'لَا إِلَٰهَ إِلَّا اللَّهُ', 'লা ইলাহা ইল্লাল্লাহ', 'আল্লাহ ছাড়া কোন উপাস্য নেই', 100, false, 4),
  ('আস্তাগফিরুল্লাহ', 'أستغفر الله', 'Astaghfirullah', 'أَسْتَغْفِرُ اللَّهَ', 'আস্তাগফিরুল্লাহ', 'আমি আল্লাহর কাছে ক্ষমা চাই', 100, false, 5),
  ('এশার নামাজের পরের দোয়া (টানা ২১ দিন)', 'دعاء بعد صلاة العشاء', 'Eshar Namazer Porer Dua (Tana 21 Din)', 
  'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
  'লা ইলাহা ইল্লা আন্তা সুবহানাকা ইন্নি কুন্তু মিনায্‌যালিমিন',
  'আপনি ব্যতীত কোনো উপাস্য নেই; আপনি পবিত্র, নিশ্চয়ই আমি অন্যায়কারীদের অন্তর্ভুক্ত।',
  300, false, 6)
) AS v(name_bn, name_ar, name_en, arabic_text, transliteration_bn, translation_bn, target_count, is_default, display_order)
WHERE NOT EXISTS (SELECT 1 FROM dhikr_presets WHERE name_en = v.name_en);

-- ============================================
-- DAILY DHIKR CHALLENGE TABLES (Renamed to challenge_templates)
-- ============================================

-- Drop old tables if they exist (to clean up dhikr_challenges references)
DROP TABLE IF EXISTS user_challenge_daily_logs CASCADE;
DROP TABLE IF EXISTS user_challenge_bookmarks CASCADE;
DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS challenge_achievements CASCADE;
DROP TABLE IF EXISTS user_challenge_progress CASCADE;
DROP TABLE IF EXISTS dhikr_challenges CASCADE;

-- Challenge Templates (Renamed from dhikr_challenges)
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
  daily_target_count INTEGER NOT NULL DEFAULT 21, -- How many times per day
  total_days INTEGER NOT NULL DEFAULT 21, -- Total days to complete
  recommended_time TEXT, -- 'after_fajr', 'after_maghrib', 'after_isha', 'anytime', 'morning', 'evening'
  recommended_prayer TEXT, -- 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha', null
  
  -- Metadata
  reference TEXT,
  fazilat_bn TEXT, -- Benefits/virtues
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

-- User Challenge Progress (Updated FK to challenge_templates)
CREATE TABLE IF NOT EXISTS user_challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  challenge_id UUID REFERENCES challenge_templates(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_day INTEGER DEFAULT 1, -- Which day they're on (1-21)
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
  
  UNIQUE(user_id, challenge_id, started_at) -- Allow user to restart same challenge
);

-- Daily Completion Records (Updated FK to challenge_templates)
CREATE TABLE IF NOT EXISTS user_challenge_daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_progress_id UUID REFERENCES user_challenge_progress(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  challenge_id UUID REFERENCES challenge_templates(id) ON DELETE CASCADE,
  
  -- Day info
  day_number INTEGER NOT NULL, -- Which day of the challenge (1-21)
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Completion details
  count_completed INTEGER NOT NULL, -- How many times they did it
  target_count INTEGER NOT NULL, -- What was the target
  is_completed BOOLEAN DEFAULT false, -- Did they meet the target?
  
  -- Time tracking
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  duration_seconds INTEGER, -- How long it took
  
  -- Optional notes
  notes TEXT,
  mood TEXT, -- 'great', 'good', 'okay', 'difficult'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_progress_id, day_number)
);

-- User Challenge Bookmarks (Updated FK to challenge_templates)
CREATE TABLE IF NOT EXISTS user_challenge_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  challenge_id UUID REFERENCES challenge_templates(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, challenge_id)
);

-- Challenge Achievements (Badges/Milestones)
CREATE TABLE IF NOT EXISTS challenge_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- 'first_challenge', 'streak_7', 'streak_21', 'complete_5_challenges'
  title_bn TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  description_bn TEXT,
  description_ar TEXT,
  description_en TEXT,
  icon TEXT,
  badge_color TEXT,
  requirement_type TEXT NOT NULL, -- 'days_completed', 'streak', 'challenges_completed'
  requirement_value INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements (Earned badges)
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES challenge_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, achievement_id)
);

-- ============================================
-- INDEXES (Updated for challenge_templates)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_challenge_templates_active ON challenge_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_challenge_templates_featured ON challenge_templates(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user ON user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_status ON user_challenge_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_challenge_daily_logs_user ON user_challenge_daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_daily_logs_progress ON user_challenge_daily_logs(user_progress_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_daily_logs_date ON user_challenge_daily_logs(completion_date);
CREATE INDEX IF NOT EXISTS idx_user_challenge_bookmarks_user ON user_challenge_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- ============================================
-- TRIGGERS (Updated for challenge_templates)
-- ============================================

CREATE TRIGGER update_challenge_templates_updated_at BEFORE UPDATE ON challenge_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenge_progress_updated_at BEFORE UPDATE ON user_challenge_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (Updated for challenge_templates)
-- ============================================

ALTER TABLE challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Challenges are viewable by everyone" ON challenge_templates;
DROP POLICY IF EXISTS "Admins can manage challenges" ON challenge_templates;
DROP POLICY IF EXISTS "Users can view their own progress" ON user_challenge_progress;
DROP POLICY IF EXISTS "Users can manage their own progress" ON user_challenge_progress;
DROP POLICY IF EXISTS "Users can view their own daily logs" ON user_challenge_daily_logs;
DROP POLICY IF EXISTS "Users can manage their own daily logs" ON user_challenge_daily_logs;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON user_challenge_bookmarks;
DROP POLICY IF EXISTS "Users can manage their own bookmarks" ON user_challenge_bookmarks;
DROP POLICY IF EXISTS "Achievements are viewable by everyone" ON challenge_achievements;
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;

-- Challenge policies
CREATE POLICY "Challenges are viewable by everyone"
  ON challenge_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage challenges"
  ON challenge_templates FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Progress policies
CREATE POLICY "Users can view their own progress"
  ON user_challenge_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own progress"
  ON user_challenge_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Daily logs policies
CREATE POLICY "Users can view their own daily logs"
  ON user_challenge_daily_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own daily logs"
  ON user_challenge_daily_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bookmark policies
CREATE POLICY "Users can view their own bookmarks"
  ON user_challenge_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own bookmarks"
  ON user_challenge_bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Achievement policies
CREATE POLICY "Achievements are viewable by everyone"
  ON challenge_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS (Updated for challenge_templates)
-- ============================================

-- Function to update challenge stats (Updated table name)
CREATE OR REPLACE FUNCTION update_challenge_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE challenge_templates
    SET total_completions = total_completions + 1
    WHERE id = NEW.challenge_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_challenge_stats ON user_challenge_progress;
CREATE TRIGGER trigger_update_challenge_stats
  AFTER UPDATE ON user_challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_stats();

-- Function to check and award achievements (Unchanged)
CREATE OR REPLACE FUNCTION check_and_award_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
  total_completed INTEGER;
  max_streak INTEGER;
BEGIN
  -- Get user stats
  SELECT 
    COUNT(*) FILTER (WHERE status = 'completed'),
    MAX(longest_streak)
  INTO total_completed, max_streak
  FROM user_challenge_progress
  WHERE user_id = p_user_id;
  
  -- Award achievements based on stats
  -- First challenge completion
  INSERT INTO user_achievements (user_id, achievement_id)
  SELECT p_user_id, id
  FROM challenge_achievements
  WHERE code = 'first_challenge' 
    AND NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_id = challenge_achievements.id
    )
    AND total_completed >= 1
  ON CONFLICT (user_id, achievement_id) DO NOTHING;
  
  -- Streak achievements
  INSERT INTO user_achievements (user_id, achievement_id)
  SELECT p_user_id, id
  FROM challenge_achievements
  WHERE requirement_type = 'streak' 
    AND requirement_value <= max_streak
    AND NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = p_user_id AND achievement_id = challenge_achievements.id
    )
  ON CONFLICT (user_id, achievement_id) DO NOTHING;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated increment function: Allow any authenticated user (or adjust as needed)
CREATE OR REPLACE FUNCTION increment(p_row_id UUID, p_table_name TEXT, p_column_name TEXT)
RETURNS void AS $$  
BEGIN
  -- Optional: Remove or comment out the admin check for user-initiated actions
  -- IF NOT is_admin() THEN
  --   RAISE EXCEPTION 'Only admins can increment stats';
  -- END IF;
  
  -- Validate table/column exist (basic safety)
  IF p_table_name != 'challenge_templates' OR p_column_name != 'total_participants' THEN
    RAISE EXCEPTION 'Invalid table or column for increment';
  END IF;
  
  -- Execute the update
  EXECUTE format('UPDATE %I SET %I = COALESCE(%I, 0) + 1 WHERE id = $1', p_table_name, p_column_name, p_column_name) USING p_row_id;
END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED DATA (Updated for challenge_templates)
-- ============================================

-- Insert sample challenges
INSERT INTO challenge_templates (
  title_bn, title_ar, title_en, description_bn, arabic_text, transliteration_bn, 
  translation_bn, daily_target_count, total_days, recommended_time, 
  recommended_prayer, reference, fazilat_bn, difficulty_level, is_featured
)
SELECT * FROM (VALUES
  (
    'এশার নামাজের পর ২১ দিনের চ্যালেঞ্জ',
    'تحدي بعد صلاة العشاء',
    '21-Day Isha Challenge',
    'এশার নামাজের পর প্রতিদিন ৩০০ বার এই দোয়া পড়ুন। টানা ২১ দিন পড়লে বিশেষ ফজিলত পাবেন।',
    'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    'লা ইলাহা ইল্লা আন্তা সুবহানাকা ইন্নি কুন্তু মিনায্‌যালিমিন',
    'আপনি ব্যতীত কোনো উপাস্য নেই; আপনি পবিত্র, নিশ্চয়ই আমি অন্যায়কারীদের অন্তর্ভুক্ত।',
    300,
    21,
    'after_isha',
    'isha',
    'সূরা আল-আম্বিয়া ২১:৮৭',
    'এই দোয়া যুন্নুনের দোয়া নামে পরিচিত। টানা ২১ দিন পড়লে সকল দুশ্চিন্তা দূর হয় এবং বিপদ থেকে মুক্তি পাওয়া যায়।',
    'hard',
    true
  ),
  (
    'সকাল-সন্ধ্যা তাসবিহ',
    'تسبيح الصباح والمساء',
    'Morning & Evening Tasbih',
    'প্রতিদিন সকালে এবং সন্ধ্যায় ১০০ বার এই তাসবিহ পড়ুন।',
    'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    'সুবহানাল্লাহি ওয়া বিহামদিহি',
    'আল্লাহ পবিত্র এবং সকল প্রশংসা তাঁর জন্য',
    100,
    7,
    'morning',
    null,
    'বুখারী ও মুসলিম',
    'যে ব্যক্তি দিনে ১০০ বার এই তাসবিহ পড়ে, তার গুনাহসমূহ মাফ করে দেয়া হয়, যদিও তা সমুদ্রের ফেনার সমান হয়।',
    'easy',
    true
  ),
  (
    'ইস্তিগফার চ্যালেঞ্জ',
    'تحدي الاستغفار',
    'Istighfar Challenge',
    'প্রতিদিন ১০০ বার ইস্তিগফার করুন এবং আল্লাহর ক্ষমা প্রার্থনা করুন।',
    'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    'আস্তাগফিরুল্লাহা ওয়া আতুবু ইলাইহি',
    'আমি আল্লাহর কাছে ক্ষমা চাই এবং তাঁর কাছে তওবা করি',
    100,
    30,
    'anytime',
    null,
    'বুখারী',
    'নবী ﷺ দিনে ১০০ বারের বেশি ইস্তিগফার করতেন।',
    'medium',
    true
  )
) AS v(title_bn, title_ar, title_en, description_bn, arabic_text, transliteration_bn, translation_bn, daily_target_count, total_days, recommended_time, recommended_prayer, reference, fazilat_bn, difficulty_level, is_featured)
WHERE NOT EXISTS (
  SELECT 1 FROM challenge_templates WHERE title_en = v.title_en
);

-- Insert achievements
INSERT INTO challenge_achievements (code, title_bn, title_ar, title_en, description_bn, description_ar, description_en, icon, badge_color, requirement_type, requirement_value, display_order)
SELECT * FROM (VALUES
  ('first_challenge', 'প্রথম চ্যালেঞ্জ', null, 'First Challenge', 'প্রথম চ্যালেঞ্জ সম্পূর্ণ করেছেন', null, null, '🎯', '#10b981', 'challenges_completed', 1, 1),
  ('streak_7', '৭ দিনের স্ট্রীক', null, '7-Day Streak', 'টানা ৭ দিন চ্যালেঞ্জ চালিয়ে গেছেন', null, null, '🔥', '#f59e0b', 'streak', 7, 2),
  ('streak_21', '২১ দিনের স্ট্রীক', null, '21-Day Streak', 'টানা ২১ দিন চ্যালেঞ্জ চালিয়ে গেছেন', null, null, '⚡', '#ef4444', 'streak', 21, 3),
  ('complete_3', '৩টি চ্যালেঞ্জ', null, '3 Challenges', '৩টি চ্যালেঞ্জ সম্পূর্ণ করেছেন', null, null, '🏆', '#8b5cf6', 'challenges_completed', 3, 4),
  ('complete_10', '১০টি চ্যালেঞ্জ', null, '10 Challenges', '১০টি চ্যালেঞ্জ সম্পূর্ণ করেছেন', null, null, '👑', '#ec4899', 'challenges_completed', 10, 5)
) AS v(code, title_bn, title_ar, title_en, description_bn, description_ar, description_en, icon, badge_color, requirement_type, requirement_value, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM challenge_achievements WHERE code = v.code
);