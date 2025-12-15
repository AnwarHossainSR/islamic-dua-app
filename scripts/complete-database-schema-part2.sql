-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Challenge system indexes
CREATE INDEX IF NOT EXISTS idx_challenge_templates_active ON challenge_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_challenge_templates_featured ON challenge_templates(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_user ON user_challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_progress_status ON user_challenge_progress(status);
CREATE INDEX IF NOT EXISTS idx_user_challenge_daily_logs_user ON user_challenge_daily_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_daily_logs_progress ON user_challenge_daily_logs(user_progress_id);
CREATE INDEX IF NOT EXISTS idx_user_challenge_daily_logs_date ON user_challenge_daily_logs(completion_date);
CREATE INDEX IF NOT EXISTS idx_user_challenge_bookmarks_user ON user_challenge_bookmarks(user_id);

-- Activity stats indexes
CREATE INDEX IF NOT EXISTS idx_activity_stats_slug ON activity_stats(unique_slug);
CREATE INDEX IF NOT EXISTS idx_activity_stats_type ON activity_stats(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_stats_user ON user_activity_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_stats_activity ON user_activity_stats(activity_stat_id);
CREATE INDEX IF NOT EXISTS idx_challenge_activity_mapping_challenge ON challenge_activity_mapping(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_activity_mapping_activity ON challenge_activity_mapping(activity_stat_id);

-- Duas indexes
CREATE INDEX IF NOT EXISTS idx_duas_category ON duas(category);
CREATE INDEX IF NOT EXISTS idx_duas_is_important ON duas(is_important);
CREATE INDEX IF NOT EXISTS idx_duas_is_active ON duas(is_active);
CREATE INDEX IF NOT EXISTS idx_duas_tags ON duas USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_duas_created_at ON duas(created_at DESC);

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_app_settings_category ON app_settings(category);
CREATE INDEX IF NOT EXISTS idx_app_settings_is_public ON app_settings(is_public);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_key ON user_settings(key);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- WebAuthn indexes
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_user_id ON webauthn_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_credential_id ON webauthn_credentials(credential_id);
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_last_used ON webauthn_credentials(last_used_at DESC);

-- API logs indexes
CREATE INDEX IF NOT EXISTS idx_api_logs_level ON api_logs(level);
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON api_logs(timestamp DESC);

-- Missed challenges indexes
CREATE INDEX IF NOT EXISTS idx_user_missed_challenges_user_id ON user_missed_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missed_challenges_date ON user_missed_challenges(missed_date);
CREATE INDEX IF NOT EXISTS idx_user_missed_challenges_challenge ON user_missed_challenges(challenge_id);

-- AI chat indexes
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_id ON ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session_id ON ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_user_id ON ai_chat_messages(user_id);

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create WebAuthn updated_at function
CREATE OR REPLACE FUNCTION update_webauthn_credentials_updated_at()
RETURNS TRIGGER AS $$ 
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create settings updated_at function
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create duas updated_at function (uses BIGINT timestamp)
CREATE OR REPLACE FUNCTION update_duas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function for BIGINT updated_at (Unix timestamp in milliseconds)
CREATE OR REPLACE FUNCTION update_bigint_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Admin users triggers
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Challenge templates triggers
CREATE TRIGGER update_challenge_templates_updated_at BEFORE UPDATE ON challenge_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User challenge progress triggers
CREATE TRIGGER update_user_challenge_progress_updated_at BEFORE UPDATE ON user_challenge_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activity stats triggers
CREATE TRIGGER update_activity_stats_updated_at BEFORE UPDATE ON activity_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- User activity stats triggers
CREATE TRIGGER update_user_activity_stats_updated_at BEFORE UPDATE ON user_activity_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- App settings triggers
CREATE TRIGGER update_app_settings_updated_at
  BEFORE UPDATE ON app_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- User settings triggers
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Duas triggers
CREATE TRIGGER update_duas_updated_at
  BEFORE UPDATE ON duas
  FOR EACH ROW
  EXECUTE FUNCTION update_duas_updated_at();

-- WebAuthn triggers
CREATE TRIGGER update_webauthn_credentials_updated_at
  BEFORE UPDATE ON webauthn_credentials
  FOR EACH ROW
  EXECUTE FUNCTION update_webauthn_credentials_updated_at();

-- User roles triggers
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON user_roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- AI chat sessions triggers (uses BIGINT timestamp)
CREATE TRIGGER update_ai_chat_sessions_updated_at_bigint
  BEFORE UPDATE ON ai_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_bigint_updated_at();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Helper function to check if user is admin
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

-- Helper function to check if user is super admin
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

-- Function to update challenge stats
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

-- Function to increment participants
CREATE OR REPLACE FUNCTION increment_participants(p_challenge_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE challenge_templates
  SET total_participants = total_participants + 1
  WHERE id = p_challenge_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment completions
CREATE OR REPLACE FUNCTION increment_completions(p_challenge_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE challenge_templates
  SET total_completions = total_completions + 1
  WHERE id = p_challenge_id;
END;
$$ LANGUAGE plpgsql;