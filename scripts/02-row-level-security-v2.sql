-- Heaven Rose Islamic - Row Level Security Policies (Fixed)
-- This script sets up RLS policies without infinite recursion

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Categories are manageable by admins" ON categories;
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON tags;
DROP POLICY IF EXISTS "Tags are manageable by admins" ON tags;
DROP POLICY IF EXISTS "Active duas are viewable by everyone" ON duas;
DROP POLICY IF EXISTS "Duas are manageable by admins" ON duas;
DROP POLICY IF EXISTS "Dua tags are viewable by everyone" ON dua_tags;
DROP POLICY IF EXISTS "Dua tags are manageable by admins" ON dua_tags;
DROP POLICY IF EXISTS "Fazilat are viewable by everyone" ON fazilat;
DROP POLICY IF EXISTS "Fazilat are manageable by admins" ON fazilat;
DROP POLICY IF EXISTS "Day-wise duas are viewable by everyone" ON day_wise_duas;
DROP POLICY IF EXISTS "Day-wise duas are manageable by admins" ON day_wise_duas;
DROP POLICY IF EXISTS "Dhikr presets are viewable by everyone" ON dhikr_presets;
DROP POLICY IF EXISTS "Dhikr presets are manageable by admins" ON dhikr_presets;
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON user_bookmarks;
DROP POLICY IF EXISTS "Users can insert their own bookmarks" ON user_bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON user_bookmarks;
DROP POLICY IF EXISTS "Users can view their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admin users can view themselves" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_super_admin();

-- Create a helper function to check if user is admin (bypasses RLS)
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

-- Create a helper function to check if user is super admin (bypasses RLS)
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

-- Categories: Public read, admin write
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Categories are manageable by admins"
  ON categories FOR ALL
  USING (is_admin());

-- Tags: Public read, admin write
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Tags are manageable by admins"
  ON tags FOR ALL
  USING (is_admin());

-- Duas: Public read active duas, admin write all
CREATE POLICY "Active duas are viewable by everyone"
  ON duas FOR SELECT
  USING (is_active = true);

CREATE POLICY "Duas are manageable by admins"
  ON duas FOR ALL
  USING (is_admin());

-- Dua Tags: Public read, admin write
CREATE POLICY "Dua tags are viewable by everyone"
  ON dua_tags FOR SELECT
  USING (true);

CREATE POLICY "Dua tags are manageable by admins"
  ON dua_tags FOR ALL
  USING (is_admin());

-- Fazilat: Public read, admin write
CREATE POLICY "Fazilat are viewable by everyone"
  ON fazilat FOR SELECT
  USING (true);

CREATE POLICY "Fazilat are manageable by admins"
  ON fazilat FOR ALL
  USING (is_admin());

-- Day-wise Duas: Public read, admin write
CREATE POLICY "Day-wise duas are viewable by everyone"
  ON day_wise_duas FOR SELECT
  USING (true);

CREATE POLICY "Day-wise duas are manageable by admins"
  ON day_wise_duas FOR ALL
  USING (is_admin());

-- Dhikr Presets: Public read, admin write
CREATE POLICY "Dhikr presets are viewable by everyone"
  ON dhikr_presets FOR SELECT
  USING (true);

CREATE POLICY "Dhikr presets are manageable by admins"
  ON dhikr_presets FOR ALL
  USING (is_admin());

-- User Bookmarks: Users can only manage their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
  ON user_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks"
  ON user_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
  ON user_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- User Preferences: Users can only manage their own preferences
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin Users: Simple policies without recursion
CREATE POLICY "Admin users can view themselves"
  ON admin_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (is_super_admin());
