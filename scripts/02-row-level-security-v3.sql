-- Drop existing policies and create new ones with security definer functions to fix infinite recursion
-- Run this script to replace the problematic RLS policies

-- First, drop all existing policies
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

-- Drop existing functions if they exist
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
