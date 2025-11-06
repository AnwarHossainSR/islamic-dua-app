-- Salah Module Database Schema

-- Drop all salah related tables and objects
DROP TABLE IF EXISTS user_salah_stats CASCADE;
DROP TABLE IF EXISTS user_salah_progress CASCADE;
DROP TABLE IF EXISTS salah_amols CASCADE;
DROP TABLE IF EXISTS salah_prayers CASCADE;

-- Salah prayers table
CREATE TABLE salah_prayers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_bn TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  prayer_time TEXT NOT NULL CHECK (prayer_time IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha')),
  description_bn TEXT,
  description_ar TEXT,
  description_en TEXT,
  icon TEXT DEFAULT '🕌',
  color TEXT DEFAULT '#10b981',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Salah amols (practices) table
CREATE TABLE salah_amols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salah_prayer_id UUID REFERENCES salah_prayers(id) ON DELETE CASCADE,
  name_bn TEXT NOT NULL,
  name_en TEXT,
  description_bn TEXT,
  description_en TEXT,
  reward_points INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User salah progress tracking
CREATE TABLE user_salah_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  salah_prayer_id UUID REFERENCES salah_prayers(id) ON DELETE CASCADE,
  completed_date DATE DEFAULT CURRENT_DATE,
  completed_amols JSONB DEFAULT '[]', -- Array of completed amol IDs
  total_amols INTEGER DEFAULT 0,
  completion_percentage INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, salah_prayer_id, completed_date)
);

-- User salah statistics
CREATE TABLE user_salah_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_prayers_completed INTEGER DEFAULT 0,
  total_amols_completed INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_salah_prayers_prayer_time ON salah_prayers(prayer_time);
CREATE INDEX idx_salah_prayers_active ON salah_prayers(is_active);
CREATE INDEX idx_salah_amols_prayer_id ON salah_amols(salah_prayer_id);
CREATE INDEX idx_salah_amols_active ON salah_amols(is_active);
CREATE INDEX idx_user_salah_progress_user_id ON user_salah_progress(user_id);
CREATE INDEX idx_user_salah_progress_date ON user_salah_progress(completed_date);
CREATE INDEX idx_user_salah_stats_user_id ON user_salah_stats(user_id);

-- RLS Policies
ALTER TABLE salah_prayers ENABLE ROW LEVEL SECURITY;
ALTER TABLE salah_amols ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_salah_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_salah_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for salah prayers and amols
CREATE POLICY "Public read access for salah prayers" ON salah_prayers FOR SELECT USING (true);
CREATE POLICY "Public read access for salah amols" ON salah_amols FOR SELECT USING (true);

-- Admin write access for salah prayers and amols
CREATE POLICY "Admin write access for salah prayers" ON salah_prayers FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

CREATE POLICY "Admin write access for salah amols" ON salah_amols FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- User access for their own progress and stats
CREATE POLICY "Users can manage their own salah progress" ON user_salah_progress FOR ALL USING (
  auth.uid() = user_id
);

CREATE POLICY "Users can manage their own salah stats" ON user_salah_stats FOR ALL USING (
  auth.uid() = user_id
);

-- Insert default salah prayers
INSERT INTO salah_prayers (name_bn, name_ar, name_en, prayer_time, description_bn, icon, sort_order) VALUES
('ফজরের নামাজের পর আমল', 'أعمال بعد صلاة الفجر', 'Post-Fajr Practices', 'fajr', 'ফজরের নামাজের পর টেনশন-দুশ্চিন্তা দূর করার আমল', '🌅', 1),
('যোহরের নামাজের পর আমল', 'أعمال بعد صلاة الظهر', 'Post-Dhuhr Practices', 'dhuhr', 'যোহরের নামাজের পর মানসিক শান্তির আমল', '☀️', 2),
('আসরের নামাজের পর আমল', 'أعمال بعد صلاة العصر', 'Post-Asr Practices', 'asr', 'আসরের নামাজের পর ক্লান্তি দূর করার আমল', '🌇', 3),
('মাগরিবের নামাজের পর আমল', 'أعمال بعد صلاة المغرب', 'Post-Maghrib Practices', 'maghrib', 'মাগরিবের নামাজের পর অশান্তি দূর করার আমল', '🌆', 4),
('এশার নামাজের পর আমল', 'أعمال بعد صلاة العشاء', 'Post-Isha Practices', 'isha', 'এশার নামাজের পর রাতের শান্তির আমল', '🌙', 5)
ON CONFLICT DO NOTHING;

-- Insert sample amols for Fajr
INSERT INTO salah_amols (salah_prayer_id, name_bn, name_en, description_bn, description_en, reward_points, is_required, sort_order) VALUES
(
  (SELECT id FROM salah_prayers WHERE prayer_time = 'fajr' LIMIT 1),
  'ইস্তিগফার',
  'Istighfar',
  'আল্লাহর কাছে ক্ষমা চাওয়া - গুনাহ মাফ হয় এবং মানসিক শান্তি আসে',
  'Seeking forgiveness from Allah - sins are forgiven and mental peace comes',
  10,
  true,
  1
),
(
  (SELECT id FROM salah_prayers WHERE prayer_time = 'fajr' LIMIT 1),
  'দুশ্চিন্তা দূর করার দোয়া',
  'Dua for removing anxiety',
  'মানসিক শান্তি আসে এবং দিনের শুরুতে টেনশন কমে',
  'Mental peace comes and tension reduces at the start of the day',
  15,
  false,
  2
);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_salah_prayers_updated_at BEFORE UPDATE ON salah_prayers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_salah_amols_updated_at BEFORE UPDATE ON salah_amols FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_salah_progress_updated_at BEFORE UPDATE ON user_salah_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_salah_stats_updated_at BEFORE UPDATE ON user_salah_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();