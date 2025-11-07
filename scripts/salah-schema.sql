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
  arabic_text TEXT,
  transliteration TEXT,
  translation_bn TEXT,
  translation_en TEXT,
  repetition_count INTEGER DEFAULT 1,
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

-- Insert standard tasbih for all 5 salah
INSERT INTO salah_amols (name_bn, name_en, description_bn, arabic_text, transliteration, translation_bn, repetition_count, salah_type, reward_points, is_required, sort_order) VALUES
-- Fajr
('সুবহানাল্লাহ', 'Subhanallah', 'আল্লাহর পবিত্রতা ঘোষণা', 'سُبْحَانَ اللَّهِ', 'Subhanallah', 'আল্লাহ পবিত্র', 33, 'fajr', 10, true, 1),
('আলহামদুলিল্লাহ', 'Alhamdulillah', 'আল্লাহর প্রশংসা', 'الْحَمْدُ لِلَّهِ', 'Alhamdulillah', 'সমস্ত প্রশংসা আল্লাহর', 33, 'fajr', 10, true, 2),
('আল্লাহু আকবার', 'Allahu Akbar', 'আল্লাহর মহত্ত্ব ঘোষণা', 'اللَّهُ أَكْبَرُ', 'Allahu Akbar', 'আল্লাহ সবচেয়ে বড়', 34, 'fajr', 10, true, 3),
-- Dhuhr
('সুবহানাল্লাহ', 'Subhanallah', 'আল্লাহর পবিত্রতা ঘোষণা', 'سُبْحَانَ اللَّهِ', 'Subhanallah', 'আল্লাহ পবিত্র', 33, 'dhuhr', 10, true, 1),
('আলহামদুলিল্লাহ', 'Alhamdulillah', 'আল্লাহর প্রশংসা', 'الْحَمْدُ لِلَّهِ', 'Alhamdulillah', 'সমস্ত প্রশংসা আল্লাহর', 33, 'dhuhr', 10, true, 2),
('আল্লাহু আকবার', 'Allahu Akbar', 'আল্লাহর মহত্ত্ব ঘোষণা', 'اللَّهُ أَكْبَرُ', 'Allahu Akbar', 'আল্লাহ সবচেয়ে বড়', 34, 'dhuhr', 10, true, 3),
-- Asr
('সুবহানাল্লাহ', 'Subhanallah', 'আল্লাহর পবিত্রতা ঘোষণা', 'سُبْحَانَ اللَّهِ', 'Subhanallah', 'আল্লাহ পবিত্র', 33, 'asr', 10, true, 1),
('আলহামদুলিল্লাহ', 'Alhamdulillah', 'আল্লাহর প্রশংসা', 'الْحَمْدُ لِلَّهِ', 'Alhamdulillah', 'সমস্ত প্রশংসা আল্লাহর', 33, 'asr', 10, true, 2),
('আল্লাহু আকবার', 'Allahu Akbar', 'আল্লাহর মহত্ত্ব ঘোষণা', 'اللَّهُ أَكْبَرُ', 'Allahu Akbar', 'আল্লাহ সবচেয়ে বড়', 34, 'asr', 10, true, 3),
-- Maghrib
('সুবহানাল্লাহ', 'Subhanallah', 'আল্লাহর পবিত্রতা ঘোষণা', 'سُبْحَانَ اللَّهِ', 'Subhanallah', 'আল্লাহ পবিত্র', 33, 'maghrib', 10, true, 1),
('আলহামদুলিল্লাহ', 'Alhamdulillah', 'আল্লাহর প্রশংসা', 'الْحَمْدُ لِلَّهِ', 'Alhamdulillah', 'সমস্ত প্রশংসা আল্লাহর', 33, 'maghrib', 10, true, 2),
('আল্লাহু আকবার', 'Allahu Akbar', 'আল্লাহর মহত্ত্ব ঘোষণা', 'اللَّهُ أَكْبَرُ', 'Allahu Akbar', 'আল্লাহ সবচেয়ে বড়', 34, 'maghrib', 10, true, 3),
-- Isha
('সুবহানাল্লাহ', 'Subhanallah', 'আল্লাহর পবিত্রতা ঘোষণা', 'سُبْحَانَ اللَّهِ', 'Subhanallah', 'আল্লাহ পবিত্র', 33, 'isha', 10, true, 1),
('আলহামদুলিল্লাহ', 'Alhamdulillah', 'আল্লাহর প্রশংসা', 'الْحَمْدُ لِلَّهِ', 'Alhamdulillah', 'সমস্ত প্রশংসা আল্লাহর', 33, 'isha', 10, true, 2),
('আল্লাহু আকবার', 'Allahu Akbar', 'আল্লাহর মহত্ত্ব ঘোষণা', 'اللَّهُ أَكْبَرُ', 'Allahu Akbar', 'আল্লাহ সবচেয়ে বড়', 34, 'isha', 10, true, 3),
-- 3 Kul (Qul Surahs) for all 5 salah
-- Fajr - 3 Kul
('সূরা ইখলাস', 'Surah Ikhlas', 'তাওহীদের সূরা', 'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', 'Qul huwallahu ahad, Allahus samad, lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad', 'বলুন, তিনি আল্লাহ, এক। আল্লাহ অমুখাপেক্ষী। তিনি কাউকে জন্ম দেননি এবং তিনি জন্মগ্রহণ করেননি। এবং তার সমকক্ষ কেউ নেই।', 1, 'fajr', 15, true, 4),
('সূরা ফালাক', 'Surah Falaq', 'ভোরের সূরা', 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِن شَرِّ مَا خَلَقَ', 'Qul auzu birabbil falaq, min sharri ma khalaq', 'বলুন, আমি ভোরের রবের আশ্রয় চাই তার সৃষ্টির মন্দ থেকে', 1, 'fajr', 15, true, 5),
('সূরা নাস', 'Surah Nas', 'মানুষের সূরা', 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَٰهِ النَّاسِ', 'Qul auzu birabbin nas, malikin nas, ilahin nas', 'বলুন, আমি মানুষের রবের আশ্রয় চাই, মানুষের মালিক, মানুষের ইলাহ', 1, 'fajr', 15, true, 6),
-- Dhuhr - 3 Kul
('সূরা ইখলাস', 'Surah Ikhlas', 'তাওহীদের সূরা', 'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', 'Qul huwallahu ahad, Allahus samad, lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad', 'বলুন, তিনি আল্লাহ, এক। আল্লাহ অমুখাপেক্ষী। তিনি কাউকে জন্ম দেননি এবং তিনি জন্মগ্রহণ করেননি। এবং তার সমকক্ষ কেউ নেই।', 1, 'dhuhr', 15, true, 4),
('সূরা ফালাক', 'Surah Falaq', 'ভোরের সূরা', 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِن شَرِّ مَا خَلَقَ', 'Qul auzu birabbil falaq, min sharri ma khalaq', 'বলুন, আমি ভোরের রবের আশ্রয় চাই তার সৃষ্টির মন্দ থেকে', 1, 'dhuhr', 15, true, 5),
('সূরা নাস', 'Surah Nas', 'মানুষের সূরা', 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَٰهِ النَّاسِ', 'Qul auzu birabbin nas, malikin nas, ilahin nas', 'বলুন, আমি মানুষের রবের আশ্রয় চাই, মানুষের মালিক, মানুষের ইলাহ', 1, 'dhuhr', 15, true, 6),
-- Asr - 3 Kul
('সূরা ইখলাস', 'Surah Ikhlas', 'তাওহীদের সূরা', 'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', 'Qul huwallahu ahad, Allahus samad, lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad', 'বলুন, তিনি আল্লাহ, এক। আল্লাহ অমুখাপেক্ষী। তিনি কাউকে জন্ম দেননি এবং তিনি জন্মগ্রহণ করেননি। এবং তার সমকক্ষ কেউ নেই।', 1, 'asr', 15, true, 4),
('সূরা ফালাক', 'Surah Falaq', 'ভোরের সূরা', 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِن شَرِّ مَا خَلَقَ', 'Qul auzu birabbil falaq, min sharri ma khalaq', 'বলুন, আমি ভোরের রবের আশ্রয় চাই তার সৃষ্টির মন্দ থেকে', 1, 'asr', 15, true, 5),
('সূরা নাস', 'Surah Nas', 'মানুষের সূরা', 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَٰهِ النَّاسِ', 'Qul auzu birabbin nas, malikin nas, ilahin nas', 'বলুন, আমি মানুষের রবের আশ্রয় চাই, মানুষের মালিক, মানুষের ইলাহ', 1, 'asr', 15, true, 6),
-- Maghrib - 3 Kul
('সূরা ইখলাস', 'Surah Ikhlas', 'তাওহীদের সূরা', 'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', 'Qul huwallahu ahad, Allahus samad, lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad', 'বলুন, তিনি আল্লাহ, এক। আল্লাহ অমুখাপেক্ষী। তিনি কাউকে জন্ম দেননি এবং তিনি জন্মগ্রহণ করেননি। এবং তার সমকক্ষ কেউ নেই।', 1, 'maghrib', 15, true, 4),
('সূরা ফালাক', 'Surah Falaq', 'ভোরের সূরা', 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِن شَرِّ مَا خَلَقَ', 'Qul auzu birabbil falaq, min sharri ma khalaq', 'বলুন, আমি ভোরের রবের আশ্রয় চাই তার সৃষ্টির মন্দ থেকে', 1, 'maghrib', 15, true, 5),
('সূরা নাস', 'Surah Nas', 'মানুষের সূরা', 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَٰهِ النَّاسِ', 'Qul auzu birabbin nas, malikin nas, ilahin nas', 'বলুন, আমি মানুষের রবের আশ্রয় চাই, মানুষের মালিক, মানুষের ইলাহ', 1, 'maghrib', 15, true, 6),
-- Isha - 3 Kul
('সূরা ইখলাস', 'Surah Ikhlas', 'তাওহীদের সূরা', 'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', 'Qul huwallahu ahad, Allahus samad, lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad', 'বলুন, তিনি আল্লাহ, এক। আল্লাহ অমুখাপেক্ষী। তিনি কাউকে জন্ম দেননি এবং তিনি জন্মগ্রহণ করেননি। এবং তার সমকক্ষ কেউ নেই।', 1, 'isha', 15, true, 4),
('সূরা ফালাক', 'Surah Falaq', 'ভোরের সূরা', 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ مِن شَرِّ مَا خَلَقَ', 'Qul auzu birabbil falaq, min sharri ma khalaq', 'বলুন, আমি ভোরের রবের আশ্রয় চাই তার সৃষ্টির মন্দ থেকে', 1, 'isha', 15, true, 5),
('সূরা নাস', 'Surah Nas', 'মানুষের সূরা', 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَٰهِ النَّاسِ', 'Qul auzu birabbin nas, malikin nas, ilahin nas', 'বলুন, আমি মানুষের রবের আশ্রয় চাই, মানুষের মালিক, মানুষের ইলাহ', 1, 'isha', 15, true, 6),
-- Additional amols
('তাহাজ্জুদের দোয়া', 'Tahajjud Dua', 'রাতের নামাজের বিশেষ দোয়া', 'رَبِّ اغْفِرْ لِي ذَنْبِي', 'Rabbighfir li dhanbi', 'হে আমার রব! আমার গুনাহ ক্ষমা করুন', 100, 'tahajjud', 50, false, 1),
('চাশতের তাসবীহ', 'Chasht Tasbih', 'সকালের নফল নামাজের তাসবীহ', 'لَا إِلَٰهَ إِلَّا اللَّهُ', 'La ilaha illallah', 'আল্লাহ ছাড়া কোনো উপাস্য নেই', 100, 'chasht', 30, false, 1);

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