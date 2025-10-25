-- ============================================
-- DATABASE-DRIVEN NOTIFICATION SYSTEM
-- ============================================

-- Create notification types enum
CREATE TYPE notification_type AS ENUM ('dua_reminder', 'challenge_reminder', 'achievement', 'system', 'prayer_time');

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT DEFAULT '🔔',
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  dua_reminders BOOLEAN DEFAULT TRUE,
  challenge_reminders BOOLEAN DEFAULT TRUE,
  achievement_notifications BOOLEAN DEFAULT TRUE,
  system_notifications BOOLEAN DEFAULT TRUE,
  prayer_time_reminders BOOLEAN DEFAULT FALSE,
  reminder_times JSONB DEFAULT '["06:00", "12:00", "18:00", "21:00"]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification schedules table for recurring notifications
CREATE TABLE IF NOT EXISTS notification_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  schedule_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_sent TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_schedules_user_id ON notification_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_schedules_active ON notification_schedules(is_active);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_icon TEXT DEFAULT '🔔',
  p_action_url TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
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

-- Function to delete notification
CREATE OR REPLACE FUNCTION delete_notification(p_notification_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  DELETE FROM notifications 
  WHERE id = p_notification_id AND user_id = p_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old notifications (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '30 days' 
     OR (expires_at IS NOT NULL AND expires_at < NOW());
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send scheduled notifications
CREATE OR REPLACE FUNCTION send_scheduled_notifications()
RETURNS INTEGER AS $$
DECLARE
  schedule_record RECORD;
  sent_count INTEGER := 0;
  current_time TIME := CURRENT_TIME;
  current_date DATE := CURRENT_DATE;
BEGIN
  FOR schedule_record IN 
    SELECT * FROM notification_schedules 
    WHERE is_active = TRUE 
      AND schedule_time <= current_time
      AND (last_sent IS NULL OR DATE(last_sent) < current_date)
  LOOP
    -- Create the notification
    PERFORM create_notification(
      schedule_record.user_id,
      schedule_record.type,
      schedule_record.title,
      schedule_record.message,
      CASE schedule_record.type
        WHEN 'dua_reminder' THEN '📿'
        WHEN 'challenge_reminder' THEN '🎯'
        WHEN 'prayer_time' THEN '🕌'
        ELSE '🔔'
      END
    );
    
    -- Update last_sent timestamp
    UPDATE notification_schedules 
    SET last_sent = NOW() 
    WHERE id = schedule_record.id;
    
    sent_count := sent_count + 1;
  END LOOP;
  
  RETURN sent_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_schedules ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- Notification preferences policies
CREATE POLICY "Users can manage own preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Notification schedules policies  
CREATE POLICY "Users can manage own schedules" ON notification_schedules
  FOR ALL USING (auth.uid() = user_id);

-- Insert default preferences for existing users
INSERT INTO notification_preferences (user_id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;