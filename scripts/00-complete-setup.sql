-- Heaven Rose Islamic - Complete Database Setup
-- This script safely creates/updates all database objects
-- Can be run multiple times without errors

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
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
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_duas_category ON duas(category_id);
CREATE INDEX IF NOT EXISTS idx_duas_featured ON duas(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_duas_active ON duas(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_day_wise_duas_day ON day_wise_duas(day_of_week);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_fazilat_dua ON fazilat(dua_id);

-- ============================================
-- TRIGGERS
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
-- ROW LEVEL SECURITY
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
-- SEED DATA
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
  ('আস্তাগফিরুল্লাহ', 'أستغفر الله', 'Astaghfirullah', 'أَسْتَغْفِرُ اللَّهَ', 'আস্তাগফিরুল্লাহ', 'আমি আল্লাহর কাছে ক্ষমা চাই', 100, false, 5)
) AS v(name_bn, name_ar, name_en, arabic_text, transliteration_bn, translation_bn, target_count, is_default, display_order)
WHERE NOT EXISTS (SELECT 1 FROM dhikr_presets WHERE name_en = v.name_en);
