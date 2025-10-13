-- ============================================
-- MULTI-DAY DUA CHALLENGE SYSTEM
-- ============================================

-- Challenge Templates table (Admin creates these)
CREATE TABLE IF NOT EXISTS challenge_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title_bn TEXT NOT NULL,
  title_ar TEXT,
  title_en TEXT,
  description_bn TEXT,
  description_ar TEXT,
  description_en TEXT,
  
  -- Dua content
  arabic_text TEXT NOT NULL,
  transliteration_bn TEXT,
  translation_bn TEXT NOT NULL,
  translation_en TEXT,
  
  -- Challenge configuration
  total_days INTEGER NOT NULL DEFAULT 21,
  repetitions_per_day INTEGER NOT NULL DEFAULT 300,
  recommended_time TEXT, -- e.g., 'after_isha', 'after_fajr', 'anytime'
  
  -- Display
  icon TEXT,
  color TEXT DEFAULT '#10b981',
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  reference TEXT,
  benefits_bn TEXT,
  benefits_ar TEXT,
  benefits_en TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Challenge Progress (User enrolls in a challenge)
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  template_id UUID REFERENCES challenge_templates(id) ON DELETE CASCADE,
  
  -- Progress tracking
  current_day INTEGER DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Dates
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, template_id, is_active)
);

-- Daily Progress (Tracks each day's completion)
CREATE TABLE IF NOT EXISTS challenge_daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_challenge_id UUID REFERENCES user_challenges(id) ON DELETE CASCADE,
  
  -- Day tracking
  day_number INTEGER NOT NULL,
  date DATE NOT NULL,
  
  -- Progress
  current_count INTEGER DEFAULT 0,
  target_count INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  
  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_challenge_id, day_number)
);

-- Challenge Statistics (Aggregated stats)
CREATE TABLE IF NOT EXISTS challenge_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  template_id UUID REFERENCES challenge_templates(id) ON DELETE CASCADE,
  
  -- Completion stats
  total_attempts INTEGER DEFAULT 0,
  total_completions INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  
  -- Timing stats
  total_days_participated INTEGER DEFAULT 0,
  average_daily_count INTEGER DEFAULT 0,
  
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, template_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_challenge_templates_active ON challenge_templates(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_challenge_templates_featured ON challenge_templates(is_featured) WHERE is_featured = true;

CREATE INDEX IF NOT EXISTS idx_user_challenges_user ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_template ON user_challenges(template_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_active ON user_challenges(user_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_daily_progress_challenge ON challenge_daily_progress(user_challenge_id);
CREATE INDEX IF NOT EXISTS idx_daily_progress_date ON challenge_daily_progress(date);

CREATE INDEX IF NOT EXISTS idx_challenge_stats_user ON challenge_stats(user_id);

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_challenge_templates_updated_at 
  BEFORE UPDATE ON challenge_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenges_updated_at 
  BEFORE UPDATE ON user_challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_daily_progress_updated_at 
  BEFORE UPDATE ON challenge_daily_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenge_stats_updated_at 
  BEFORE UPDATE ON challenge_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE challenge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_stats ENABLE ROW LEVEL SECURITY;

-- Challenge Templates policies
CREATE POLICY "Challenge templates are viewable by everyone"
  ON challenge_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage challenge templates"
  ON challenge_templates FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- User Challenges policies
CREATE POLICY "Users can view their own challenges"
  ON user_challenges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own challenges"
  ON user_challenges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Daily Progress policies
CREATE POLICY "Users can view their own daily progress"
  ON challenge_daily_progress FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_challenges uc
      WHERE uc.id = challenge_daily_progress.user_challenge_id
      AND uc.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own daily progress"
  ON challenge_daily_progress FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_challenges uc
      WHERE uc.id = challenge_daily_progress.user_challenge_id
      AND uc.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_challenges uc
      WHERE uc.id = challenge_daily_progress.user_challenge_id
      AND uc.user_id = auth.uid()
    )
  );

-- Challenge Stats policies
CREATE POLICY "Users can view their own stats"
  ON challenge_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON challenge_stats FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert default challenge templates
INSERT INTO challenge_templates (
  title_bn, title_ar, title_en,
  description_bn,
  arabic_text,
  transliteration_bn,
  translation_bn,
  total_days,
  repetitions_per_day,
  recommended_time,
  benefits_bn,
  is_featured,
  display_order
)
SELECT * FROM (VALUES
  (
    'এশার নামাজের পর ২১ দিনের চ্যালেঞ্জ',
    'تحدي 21 يومًا بعد صلاة العشاء',
    '21-Day Challenge After Isha',
    'টানা ২১ দিন এশার নামাজের পর এই দোয়া ৩০০ বার পড়ুন',
    'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    'লা ইলাহা ইল্লা আন্তা সুবহানাকা ইন্নি কুন্তু মিনায্‌যালিমিন',
    'আপনি ব্যতীত কোনো উপাস্য নেই; আপনি পবিত্র, নিশ্চয়ই আমি অন্যায়কারীদের অন্তর্ভুক্ত।',
    21,
    300,
    'after_isha',
    'এই দোয়া পড়লে সকল বিপদ থেকে মুক্তি পাওয়া যায় এবং আল্লাহর রহমত লাভ হয়।',
    true,
    1
  ),
  (
    'ফজরের পর ৪০ দিনের চ্যালেঞ্জ',
    'تحدي 40 يومًا بعد صلاة الفجر',
    '40-Day Challenge After Fajr',
    'টানা ৪০ দিন ফজরের নামাজের পর এই দোয়া ১০০ বার পড়ুন',
    'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ',
    'লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারিকা লাহু',
    'আল্লাহ ছাড়া কোনো উপাস্য নেই, তিনি একক, তাঁর কোনো শরিক নেই।',
    40,
    100,
    'after_fajr',
    'এই দোয়া নিয়মিত পড়লে রিযিকে বরকত হয় এবং সকল চিন্তা দূর হয়।',
    true,
    2
  )
) AS v(
  title_bn, title_ar, title_en, description_bn, arabic_text, transliteration_bn,
  translation_bn, total_days, repetitions_per_day, recommended_time, benefits_bn, is_featured, display_order
)
WHERE NOT EXISTS (
  SELECT 1 FROM challenge_templates WHERE title_en = v.title_en
);
