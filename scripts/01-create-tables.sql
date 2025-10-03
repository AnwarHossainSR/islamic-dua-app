-- Heaven Rose Islamic - Database Schema
-- This script creates all necessary tables for the Islamic Dua & Dhikr application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_duas_category ON duas(category_id);
CREATE INDEX IF NOT EXISTS idx_duas_featured ON duas(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_duas_active ON duas(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_day_wise_duas_day ON day_wise_duas(day_of_week);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_fazilat_dua ON fazilat(dua_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
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
