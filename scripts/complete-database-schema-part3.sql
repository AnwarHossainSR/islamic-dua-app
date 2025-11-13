-- ============================================
-- ACTIVITY STATS FUNCTIONS
-- ============================================

-- Function to increment activity stats
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
    
    -- Get the count to add
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

-- Function to create activity stat for challenge
CREATE OR REPLACE FUNCTION create_activity_stat_for_challenge()
RETURNS TRIGGER AS $$
DECLARE
  v_activity_stat_id UUID;
  v_slug TEXT;
  v_activity_type TEXT;
BEGIN
  -- Generate slug from title
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
  
  -- Check if activity stat already exists
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

-- ============================================
-- NOTIFICATION FUNCTIONS
-- ============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_icon TEXT DEFAULT '🔔',
  p_action_url TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_metadata TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, icon, action_url, expires_at, metadata)
  VALUES (p_user_id, p_type, p_title, p_message, p_icon, p_action_url, p_expires_at, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET is_read = TRUE 
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications 
  SET is_read = TRUE 
  WHERE user_id = p_user_id AND is_read = FALSE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ACTIVITY STATS TRIGGERS
-- ============================================

-- Trigger for activity stats increment
CREATE TRIGGER trigger_increment_activity_stats
  AFTER INSERT ON user_challenge_daily_logs
  FOR EACH ROW
  EXECUTE FUNCTION increment_activity_stats();

-- Trigger for challenge stats update
CREATE TRIGGER trigger_update_challenge_stats
  AFTER UPDATE ON user_challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_challenge_stats();

-- Trigger for auto-creating activity stats
CREATE TRIGGER trigger_create_activity_stat_for_challenge
  AFTER INSERT ON challenge_templates
  FOR EACH ROW
  EXECUTE FUNCTION create_activity_stat_for_challenge();

-- ============================================
-- ROW LEVEL SECURITY SETUP
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenge_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_activity_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE duas ENABLE ROW LEVEL SECURITY;
ALTER TABLE dua_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- User preferences policies
CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own preferences"
  ON user_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admin users policies
CREATE POLICY "Users can view their own admin record"
  ON admin_users FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage admin users"
  ON admin_users FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

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


-- Achievement policies
CREATE POLICY "Achievements are viewable by everyone"
  ON challenge_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

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

-- Duas policies
CREATE POLICY "Anyone can view active duas"
  ON duas FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can view all duas"
  ON duas FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin can manage duas"
  ON duas FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Categories policies
CREATE POLICY "Anyone can view active categories"
  ON dua_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage categories"
  ON dua_categories FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- App settings policies
CREATE POLICY "Public settings are viewable by everyone"
  ON app_settings FOR SELECT
  USING (is_public = true);

CREATE POLICY "Admin can view all settings"
  ON app_settings FOR SELECT
  USING (is_admin());

CREATE POLICY "Admin can update settings"
  ON app_settings FOR UPDATE
  USING (is_admin());

-- User settings policies
CREATE POLICY "Users can view their own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own settings"
  ON user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- WebAuthn policies
CREATE POLICY "Anyone can view credentials"
  ON webauthn_credentials FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own credentials"
  ON webauthn_credentials FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- API logs policies
CREATE POLICY "Admin users can view logs"
  ON api_logs FOR SELECT
  USING (is_admin());

CREATE POLICY "System can insert logs"
  ON api_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin users can delete logs"
  ON api_logs FOR DELETE
  USING (is_admin());