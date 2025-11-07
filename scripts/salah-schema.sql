-- Salah Module Database Schema - Redesigned

-- Drop all salah related tables and objects
DROP TABLE IF EXISTS user_salah_progress CASCADE;
DROP TABLE IF EXISTS salah_amols CASCADE;

-- Salah amols table (no separate prayers table - using static categories)
CREATE TABLE salah_amols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_bn TEXT NOT NULL,
  name_en TEXT,
  description_bn TEXT,
  description_en TEXT,
  salah_type TEXT NOT NULL CHECK (salah_type IN ('fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'tahajjud', 'chasht', 'ishraq', 'nafal')),
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
  amol_id UUID REFERENCES salah_amols(id) ON DELETE CASCADE,
  completed_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, amol_id, completed_date)
);

-- Indexes for better performance
CREATE INDEX idx_salah_amols_type ON salah_amols(salah_type);
CREATE INDEX idx_salah_amols_active ON salah_amols(is_active);
CREATE INDEX idx_user_salah_progress_user_id ON user_salah_progress(user_id);
CREATE INDEX idx_user_salah_progress_date ON user_salah_progress(completed_date);
CREATE INDEX idx_user_salah_progress_amol ON user_salah_progress(amol_id);

-- RLS Policies
ALTER TABLE salah_amols ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_salah_progress ENABLE ROW LEVEL SECURITY;

-- Public read access for salah amols
CREATE POLICY "Public read access for salah amols" ON salah_amols FOR SELECT USING (true);

-- Admin write access for salah amols
CREATE POLICY "Admin write access for salah amols" ON salah_amols FOR ALL USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- User access for their own progress
CREATE POLICY "Users can manage their own salah progress" ON user_salah_progress FOR ALL USING (
  auth.uid() = user_id
);

-- Insert sample amols
INSERT INTO salah_amols (name_bn, name_en, description_bn, salah_type, reward_points, is_required, sort_order) VALUES
('ইস্তিগফার', 'Istighfar', 'আল্লাহর কাছে ক্ষমা চাওয়া - গুনাহ মাফ হয় এবং মানসিক শান্তি আসে', 'fajr', 10, true, 1),
('দুশ্চিন্তা দূর করার দোয়া', 'Dua for removing anxiety', 'মানসিক শান্তি আসে এবং দিনের শুরুতে টেনশন কমে', 'fajr', 15, false, 2),
('সূরা ইখলাস', 'Surah Ikhlas', 'তাওহীদের সূরা - ঈমান বৃদ্ধি পায়', 'dhuhr', 20, true, 1),
('আয়াতুল কুরসী', 'Ayatul Kursi', 'আল্লাহর মহত্ত্ব বর্ণনা - সুরক্ষা পাওয়া যায়', 'asr', 25, true, 1),
('তাহাজ্জুদের দোয়া', 'Tahajjud Dua', 'রাতের নামাজের বিশেষ দোয়া', 'tahajjud', 50, false, 1),
('চাশতের তাসবীহ', 'Chasht Tasbih', 'সকালের নফল নামাজের তাসবীহ', 'chasht', 30, false, 1),
('ইশরাকের দোয়া', 'Ishraq Dua', 'সূর্যোদয়ের পর নামাজের দোয়া', 'ishraq', 35, false, 1),
('নফল নামাজের দোয়া', 'Nafal Prayer Dua', 'অতিরিক্ত নামাজের দোয়া', 'nafal', 20, false, 1);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_salah_amols_updated_at BEFORE UPDATE ON salah_amols FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_salah_progress_updated_at BEFORE UPDATE ON user_salah_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();