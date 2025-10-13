-- ============================================
-- SEED DATA
-- ============================================

-- Insert Categories (only if they don't exist)
INSERT INTO categories (name_bn, name_ar, name_en, slug, icon, display_order)
SELECT * FROM (VALUES
  ('সকাল-সন্ধ্যার দোয়া', 'أذكار الصباح والمساء', 'Morning & Evening Duas', 'morning-evening', '🌅', 1),
  ('নামাজের দোয়া', 'أدعية الصلاة', 'Prayer Duas', 'prayer', '🤲', 2),
  ('কুরআনের দোয়া', 'أدعية القرآن', 'Quranic Duas', 'quran', '📖', 3),
  ('ঘুমের দোয়া', 'أذكار النوم', 'Sleep Duas', 'sleep', '🌙', 4),
  ('খাবারের দোয়া', 'أدعية الطعام', 'Food Duas', 'food', '🍽️', 5),
  ('ভ্রমণের দোয়া', 'أدعية السفر', 'Travel Duas', 'travel', '✈️', 6),
  ('রোগ-মুক্তির দোয়া', 'أدعية الشفاء', 'Healing Duas', 'healing', '💊', 7),
  ('তওবার দোয়া', 'أدعية التوبة', 'Repentance Duas', 'repentance', '🙏', 8)
) AS v(name_bn, name_ar, name_en, slug, icon, display_order)
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = v.slug);

-- Insert Tags (only if they don't exist)
INSERT INTO tags (name_bn, name_ar, name_en, slug)
SELECT * FROM (VALUES
  ('সুন্নাহ', 'سنة', 'Sunnah', 'sunnah'),
  ('ফজিলতপূর্ণ', 'فضيلة', 'Virtuous', 'virtuous'),
  ('সংক্ষিপ্ত', 'قصير', 'Short', 'short'),
  ('দীর্ঘ', 'طويل', 'Long', 'long'),
  ('প্রতিদিন', 'يومي', 'Daily', 'daily'),
  ('বিশেষ', 'خاص', 'Special', 'special')
) AS v(name_bn, name_ar, name_en, slug)
WHERE NOT EXISTS (SELECT 1 FROM tags WHERE slug = v.slug);

-- Insert Sample Duas (only if they don't exist)
DO $$
DECLARE
  morning_evening_id UUID;
  food_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO morning_evening_id FROM categories WHERE slug = 'morning-evening' LIMIT 1;
  SELECT id INTO food_id FROM categories WHERE slug = 'food' LIMIT 1;

  -- Insert Ayatul Kursi if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM duas WHERE title_en = 'Morning Dua - Ayatul Kursi') THEN
    INSERT INTO duas (category_id, title_bn, title_ar, title_en, arabic_text, transliteration_bn, translation_bn, translation_en, reference, is_featured)
    VALUES (
      morning_evening_id,
      'সকালের দোয়া - আয়াতুল কুরসি',
      'آية الكرسي',
      'Morning Dua - Ayatul Kursi',
      'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
      'আল্লাহু লা ইলাহা ইল্লা হুওয়াল হাইয়্যুল কাইয়্যুম',
      'আল্লাহ, তিনি ছাড়া কোন উপাস্য নেই। তিনি চিরঞ্জীব, সর্বসত্তার ধারক।',
      'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.',
      'সূরা বাকারা ২:২৫৫',
      true
    );
  END IF;

  -- Insert Dua Before Eating if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM duas WHERE title_en = 'Dua Before Eating') THEN
    INSERT INTO duas (category_id, title_bn, title_ar, title_en, arabic_text, transliteration_bn, translation_bn, translation_en, reference, is_featured)
    VALUES (
      food_id,
      'খাবার শুরুর দোয়া',
      'دعاء قبل الطعام',
      'Dua Before Eating',
      'بِسْمِ اللَّهِ',
      'বিসমিল্লাহ',
      'আল্লাহর নামে (শুরু করছি)',
      'In the name of Allah',
      'বুখারী ও মুসলিম',
      true
    );
  END IF;

  -- Insert Dua After Eating if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM duas WHERE title_en = 'Dua After Eating') THEN
    INSERT INTO duas (category_id, title_bn, title_ar, title_en, arabic_text, transliteration_bn, translation_bn, translation_en, reference)
    VALUES (
      food_id,
      'খাবার শেষের দোয়া',
      'دعاء بعد الطعام',
      'Dua After Eating',
      'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
      'আলহামদুলিল্লাহিল্লাযী আতআমানা ওয়া সাক্বানা ওয়া জাআলানা মুসলিমীন',
      'সকল প্রশংসা আল্লাহর জন্য যিনি আমাদের খাওয়ালেন, পান করালেন এবং আমাদের মুসলিম বানালেন।',
      'All praise is due to Allah who fed us, gave us drink, and made us Muslims.',
      'আবু দাউদ ৩৮৫০'
    );
  END IF;
END $$;

-- Insert Dhikr Presets (only if they don't exist)
INSERT INTO dhikr_presets (name_bn, name_ar, name_en, arabic_text, transliteration_bn, translation_bn, target_count, is_default, display_order)
SELECT * FROM (VALUES
  ('সুবহানাল্লাহ', 'سبحان الله', 'SubhanAllah', 'سُبْحَانَ اللَّهِ', 'সুবহানাল্লাহ', 'আল্লাহ পবিত্র', 33, true, 1),
  ('আলহামদুলিল্লাহ', 'الحمد لله', 'Alhamdulillah', 'الْحَمْدُ لِلَّهِ', 'আলহামদুলিল্লাহ', 'সকল প্রশংসা আল্লাহর', 33, true, 2),
  ('আল্লাহু আকবার', 'الله أكبر', 'Allahu Akbar', 'اللَّهُ أَكْبَرُ', 'আল্লাহু আকবার', 'আল্লাহ মহান', 34, true, 3),
  ('লা ইলাহা ইল্লাল্লাহ', 'لا إله إلا الله', 'La ilaha illallah', 'لَا إِلَٰهَ إِلَّا اللَّهُ', 'লা ইলাহা ইল্লাল্লাহ', 'আল্লাহ ছাড়া কোন উপাস্য নেই', 100, false, 4),
  ('আস্তাগফিরুল্লাহ', 'أستغفر الله', 'Astaghfirullah', 'أَسْتَغْفِرُ اللَّهَ', 'আস্তাগফিরুল্লাহ', 'আমি আল্লাহর কাছে ক্ষমা চাই', 100, false, 5),
   ('এশার নামাজের পরের দোয়া (টানা ২১ দিন)', 'دعاء بعد صلاة العشاء', 'Eshar Namazer Porer Dua (Tana 21 Din)', 
  'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
  'লা ইলাহা ইল্লা আন্তা সুবহানাকা ইন্নি কুন্তু মিনায্‌যালিমিন',
  'আপনি ব্যতীত কোনো উপাস্য নেই; আপনি পবিত্র, নিশ্চয়ই আমি অন্যায়কারীদের অন্তর্ভুক্ত।',
  300, false, 6)
) AS v(name_bn, name_ar, name_en, arabic_text, transliteration_bn, translation_bn, target_count, is_default, display_order)
WHERE NOT EXISTS (SELECT 1 FROM dhikr_presets WHERE name_en = v.name_en);

-- Note:
-- Dua of Yunus (A.S.) is to be recited 300 times daily after Isha prayer for 21 consecutive days.

