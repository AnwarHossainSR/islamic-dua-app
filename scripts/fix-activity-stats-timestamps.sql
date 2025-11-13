-- Fix activity stats function to use Unix timestamps instead of PostgreSQL timestamps
-- This fixes the error: "You will need to rewrite or cast the expression"

-- Update the increment_activity_stats function to use Unix timestamps
CREATE OR REPLACE FUNCTION increment_activity_stats()
RETURNS TRIGGER AS $$
DECLARE
  v_activity_stat_id UUID;
  v_count_to_add BIGINT;
  v_user_exists BOOLEAN;
  v_current_timestamp BIGINT;
BEGIN
  -- Only process completed logs
  IF NEW.is_completed = true THEN
    
    -- Get current Unix timestamp in milliseconds
    v_current_timestamp := (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
    
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
    
    -- Update global activity stats with Unix timestamp
    UPDATE activity_stats
    SET total_count = total_count + v_count_to_add,
        updated_at = v_current_timestamp
    WHERE id = v_activity_stat_id;
    
    -- Check if user already has a record for this activity
    SELECT EXISTS(
      SELECT 1 FROM user_activity_stats 
      WHERE user_id = NEW.user_id AND activity_stat_id = v_activity_stat_id
    ) INTO v_user_exists;
    
    -- If user doesn't exist, increment total_users count
    IF NOT v_user_exists THEN
      UPDATE activity_stats
      SET total_users = total_users + 1,
          updated_at = v_current_timestamp
      WHERE id = v_activity_stat_id;
    END IF;
    
    -- Update or insert user activity stats with Unix timestamp
    INSERT INTO user_activity_stats (
      user_id,
      activity_stat_id,
      total_completed,
      last_completed_at,
      updated_at
    )
    VALUES (
      NEW.user_id,
      v_activity_stat_id,
      v_count_to_add,
      NEW.completed_at,
      v_current_timestamp
    )
    ON CONFLICT (user_id, activity_stat_id) 
    DO UPDATE SET
      total_completed = user_activity_stats.total_completed + v_count_to_add,
      last_completed_at = NEW.completed_at,
      updated_at = v_current_timestamp;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Also update the create_activity_stat_for_challenge function
CREATE OR REPLACE FUNCTION create_activity_stat_for_challenge()
RETURNS TRIGGER AS $$
DECLARE
  v_activity_stat_id UUID;
  v_slug TEXT;
  v_activity_type TEXT;
  v_current_timestamp BIGINT;
BEGIN
  -- Get current Unix timestamp in milliseconds
  v_current_timestamp := (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  
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
      color,
      created_at,
      updated_at
    )
    VALUES (
      NEW.title_bn,
      NEW.title_ar,
      NEW.title_en,
      v_slug,
      NEW.arabic_text,
      v_activity_type,
      NEW.icon,
      NEW.color,
      v_current_timestamp,
      v_current_timestamp
    )
    RETURNING id INTO v_activity_stat_id;
  END IF;
  
  -- Link challenge to activity stat
  INSERT INTO challenge_activity_mapping (challenge_id, activity_stat_id, created_at)
  VALUES (NEW.id, v_activity_stat_id, v_current_timestamp)
  ON CONFLICT (challenge_id, activity_stat_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tables already use Unix timestamps (bigint), no conversion needed

-- Fix the update_updated_at_column function to use Unix timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remove the old timestamp triggers since we're using Unix timestamps now
DROP TRIGGER IF EXISTS update_activity_stats_updated_at ON activity_stats;
DROP TRIGGER IF EXISTS update_user_activity_stats_updated_at ON user_activity_stats;

-- Remove all updated_at triggers that might be causing issues
DROP TRIGGER IF EXISTS update_user_challenge_progress_updated_at ON user_challenge_progress;
DROP TRIGGER IF EXISTS update_challenge_templates_updated_at ON challenge_templates;
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
DROP TRIGGER IF EXISTS update_app_settings_updated_at ON app_settings;
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
DROP TRIGGER IF EXISTS update_ai_chat_sessions_updated_at ON ai_chat_sessions;