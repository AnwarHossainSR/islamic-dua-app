-- Missed Challenges Tracking System

-- Create missed challenges table
CREATE TABLE IF NOT EXISTS user_missed_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES challenge_templates(id) ON DELETE CASCADE,
  missed_date DATE NOT NULL,
  reason TEXT DEFAULT 'not_completed', -- 'not_completed', 'skipped', 'paused'
  was_active BOOLEAN DEFAULT true, -- was the challenge active for this user on this date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_missed_challenges_user_id ON user_missed_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_missed_challenges_date ON user_missed_challenges(missed_date);
CREATE INDEX IF NOT EXISTS idx_user_missed_challenges_challenge ON user_missed_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_missed_challenges_user_date ON user_missed_challenges(user_id, missed_date);

-- Enable RLS
ALTER TABLE user_missed_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policy - users can only see their own missed challenges
CREATE POLICY "Users can manage their own missed challenges" ON user_missed_challenges FOR ALL USING (
  auth.uid() = user_id
);

-- Function to automatically track missed challenges
CREATE OR REPLACE FUNCTION track_missed_challenges()
RETURNS void AS $$
DECLARE
  target_date DATE;
  user_record RECORD;
  challenge_record RECORD;
  progress_record RECORD;
  daily_log_record RECORD;
BEGIN
  -- Track for yesterday (since we run this daily)
  target_date := CURRENT_DATE - INTERVAL '1 day';
  
  -- Loop through all users who have active challenges
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM user_challenge_progress 
    WHERE status = 'active'
  LOOP
    -- Loop through all active challenges for this user
    FOR challenge_record IN
      SELECT ucp.challenge_id, ucp.user_id, ct.title_bn
      FROM user_challenge_progress ucp
      JOIN challenge_templates ct ON ucp.challenge_id = ct.id
      WHERE ucp.user_id = user_record.user_id 
      AND ucp.status = 'active'
      AND ct.is_active = true
    LOOP
      -- Check if user completed this challenge on target_date
      SELECT * INTO daily_log_record
      FROM user_challenge_daily_logs
      WHERE user_id = challenge_record.user_id
      AND challenge_id = challenge_record.challenge_id
      AND completion_date = target_date
      AND is_completed = true;
      
      -- If no completion found, mark as missed
      IF NOT FOUND THEN
        -- Check if already recorded as missed
        SELECT * INTO progress_record
        FROM user_missed_challenges
        WHERE user_id = challenge_record.user_id
        AND challenge_id = challenge_record.challenge_id
        AND missed_date = target_date;
        
        -- If not already recorded, insert missed record
        IF NOT FOUND THEN
          INSERT INTO user_missed_challenges (
            user_id, 
            challenge_id, 
            missed_date, 
            reason, 
            was_active
          ) VALUES (
            challenge_record.user_id,
            challenge_record.challenge_id,
            target_date,
            'not_completed',
            true
          );
        END IF;
      END IF;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get user's missed challenges for last 3 months
CREATE OR REPLACE FUNCTION get_user_missed_challenges_3months(p_user_id UUID)
RETURNS TABLE (
  missed_date DATE,
  challenge_id UUID,
  challenge_title_bn TEXT,
  challenge_icon TEXT,
  challenge_color TEXT,
  reason TEXT,
  days_ago INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    umc.missed_date,
    umc.challenge_id,
    ct.title_bn,
    ct.icon,
    ct.color,
    umc.reason,
    (CURRENT_DATE - umc.missed_date)::INTEGER as days_ago
  FROM user_missed_challenges umc
  JOIN challenge_templates ct ON umc.challenge_id = ct.id
  WHERE umc.user_id = p_user_id
  AND umc.missed_date >= CURRENT_DATE - INTERVAL '3 months'
  ORDER BY umc.missed_date DESC, ct.title_bn;
END;
$$ LANGUAGE plpgsql;

-- Backfill missed challenges for last 3 months
DO $$
DECLARE
  target_date DATE;
  user_record RECORD;
  challenge_record RECORD;
  daily_log_record RECORD;
  missed_record RECORD;
BEGIN
  -- Backfill for last 90 days
  FOR i IN 1..90 LOOP
    target_date := CURRENT_DATE - i;
    
    -- Loop through all users who had active challenges
    FOR user_record IN 
      SELECT DISTINCT user_id 
      FROM user_challenge_progress 
      WHERE status IN ('active', 'completed', 'paused')
      AND started_at::DATE <= target_date
    LOOP
      -- Loop through challenges that were active for this user on target_date
      FOR challenge_record IN
        SELECT ucp.challenge_id, ucp.user_id, ct.title_bn
        FROM user_challenge_progress ucp
        JOIN challenge_templates ct ON ucp.challenge_id = ct.id
        WHERE ucp.user_id = user_record.user_id 
        AND ucp.started_at::DATE <= target_date
        AND (ucp.completed_at IS NULL OR ucp.completed_at::DATE > target_date)
        AND (ucp.paused_at IS NULL OR ucp.paused_at::DATE > target_date)
        AND ct.is_active = true
      LOOP
        -- Check if user completed this challenge on target_date
        SELECT * INTO daily_log_record
        FROM user_challenge_daily_logs
        WHERE user_id = challenge_record.user_id
        AND challenge_id = challenge_record.challenge_id
        AND completion_date = target_date
        AND is_completed = true;
        
        -- If no completion found, mark as missed
        IF NOT FOUND THEN
          -- Check if already recorded as missed
          SELECT * INTO missed_record
          FROM user_missed_challenges
          WHERE user_id = challenge_record.user_id
          AND challenge_id = challenge_record.challenge_id
          AND missed_date = target_date;
          
          -- If not already recorded, insert missed record
          IF NOT FOUND THEN
            INSERT INTO user_missed_challenges (
              user_id, 
              challenge_id, 
              missed_date, 
              reason, 
              was_active
            ) VALUES (
              challenge_record.user_id,
              challenge_record.challenge_id,
              target_date,
              'not_completed',
              true
            );
          END IF;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END;
$$;

-- Drop unused tables (run these commands if confirmed unused)
-- WARNING: This will permanently delete data!

-- Check if these tables have any data first:
-- SELECT COUNT(*) FROM challenge_achievements; -- If 0, can drop
-- SELECT COUNT(*) FROM user_achievements; -- If 0, can drop  
-- SELECT COUNT(*) FROM user_challenge_bookmarks; -- If 0, can drop
-- SELECT COUNT(*) FROM user_preferences; -- If 0, can drop

-- Dropping unused tables (confirmed no data and no active usage)

DROP TABLE IF EXISTS user_achievements CASCADE;
DROP TABLE IF EXISTS challenge_achievements CASCADE;
DROP TABLE IF EXISTS user_challenge_bookmarks CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;