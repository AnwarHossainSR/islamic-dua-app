-- Create app settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  type TEXT NOT NULL DEFAULT 'string', -- string, boolean, number, json
  label TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, key)
);

-- Insert default app settings
INSERT INTO app_settings (key, value, category, type, label, description, is_public) VALUES
('app_name', '"Islamic Dua App"', 'general', 'string', 'App Name', 'The name of the application', true),
('app_description', '"Your companion for Islamic duas and dhikr"', 'general', 'string', 'App Description', 'Brief description of the app', true),
('maintenance_mode', 'false', 'general', 'boolean', 'Maintenance Mode', 'Temporarily disable public access', false),
('enable_bangla', 'true', 'localization', 'boolean', 'Enable Bangla', 'Show Bangla translations', true),
('enable_english', 'true', 'localization', 'boolean', 'Enable English', 'Show English translations', true),
('enable_arabic', 'true', 'localization', 'boolean', 'Enable Arabic', 'Show Arabic text', true),
('daily_dua_reminders', 'true', 'notifications', 'boolean', 'Daily Dua Reminders', 'Send daily dua notifications', false),
('prayer_time_notifications', 'false', 'notifications', 'boolean', 'Prayer Time Notifications', 'Notify users of prayer times', false),
('default_notification_time', '"08:00"', 'notifications', 'string', 'Default Notification Time', 'Default time for notifications', false),
('require_email_verification', 'true', 'security', 'boolean', 'Require Email Verification', 'Users must verify email to access content', false),
('enable_2fa', 'false', 'security', 'boolean', 'Enable Two-Factor Authentication', 'Add extra security for admin accounts', false),
('session_timeout', '60', 'security', 'number', 'Session Timeout (minutes)', 'Session timeout duration', false),
('primary_color', '"#10b981"', 'appearance', 'string', 'Primary Color', 'Main theme color', true),
('dark_mode_default', 'false', 'appearance', 'boolean', 'Dark Mode by Default', 'Use dark theme as default', true)
ON CONFLICT (key) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_is_public ON app_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(key);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- App settings policies
CREATE POLICY "Public settings are viewable by everyone" ON app_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admin can view all settings" ON app_settings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Admin can update settings" ON app_settings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- User settings policies
CREATE POLICY "Users can view their own settings" ON user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON user_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own settings" ON user_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();