-- ============================================
-- SEED DATA
-- ============================================

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

-- Insert default dua categories
INSERT INTO dua_categories (name_bn, name_ar, name_en, description, icon) VALUES
('সকালের দোয়া', 'أدعية الصباح', 'Morning Duas', 'Duas to recite in the morning', '🌅'),
('সন্ধ্যার দোয়া', 'أدعية المساء', 'Evening Duas', 'Duas to recite in the evening', '🌆'),
('খাবারের দোয়া', 'أدعية الطعام', 'Food Duas', 'Duas before and after eating', '🍽️'),
('ভ্রমণের দোয়া', 'أدعية السفر', 'Travel Duas', 'Duas for traveling', '✈️'),
('ঘুমের দোয়া', 'أدعية النوم', 'Sleep Duas', 'Duas before sleeping', '😴'),
('নামাজের দোয়া', 'أدعية الصلاة', 'Prayer Duas', 'Duas related to prayer', '🕌'),
('সাধারণ দোয়া', 'أدعية عامة', 'General Duas', 'General purpose duas', '🤲')
ON CONFLICT DO NOTHING;

-- Insert sample challenges
INSERT INTO challenge_templates (
  title_bn, title_ar, title_en, description_bn, arabic_text, transliteration_bn, 
  translation_bn, daily_target_count, total_days, recommended_time, 
  recommended_prayer, reference, fazilat_bn, difficulty_level, is_featured
)
SELECT * FROM (VALUES
  (
    'এশার নামাজের পর ২১ দিনের চ্যালেঞ্জ',
    'تحدي بعد صلاة العشاء',
    '21-Day Isha Challenge',
    'এশার নামাজের পর প্রতিদিন ৩০০ বার এই দোয়া পড়ুন। টানা ২১ দিন পড়লে বিশেষ ফজিলত পাবেন।',
    'لَا إِلٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    'লা ইলাহা ইল্লা আন্তা সুবহানাকা ইন্নি কুন্তু মিনায্যালিমিন',
    'আপনি ব্যতীত কোনো উপাস্য নেই; আপনি পবিত্র, নিশ্চয়ই আমি অন্যায়কারীদের অন্তর্ভুক্ত।',
    300,
    21,
    'after_isha',
    'isha',
    'সূরা আল-আম্বিয়া ২১:৮৭',
    'এই দোয়া যুন্নুনের দোয়া নামে পরিচিত। টানা ২১ দিন পড়লে সকল দুশ্চিন্তা দূর হয় এবং বিপদ থেকে মুক্তি পাওয়া যায়।',
    'hard',
    true
  ),
  (
    'সকাল-সন্ধ্যা তাসবিহ',
    'تسبيح الصباح والمساء',
    'Morning & Evening Tasbih',
    'প্রতিদিন সকালে এবং সন্ধ্যায় ১০০ বার এই তাসবিহ পড়ুন।',
    'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    'সুবহানাল্লাহি ওয়া বিহামদিহি',
    'আল্লাহ পবিত্র এবং সকল প্রশংসা তাঁর জন্য',
    100,
    7,
    'morning',
    null,
    'বুখারী ও মুসলিম',
    'যে ব্যক্তি দিনে ১০০ বার এই তাসবিহ পড়ে, তার গুনাহসমূহ মাফ করে দেয়া হয়, যদিও তা সমুদ্রের ফেনার সমান হয়।',
    'easy',
    true
  ),
  (
    'ইস্তিগফার চ্যালেঞ্জ',
    'تحدي الاستغفار',
    'Istighfar Challenge',
    'প্রতিদিন ১০০ বার ইস্তিগফার করুন এবং আল্লাহর ক্ষমা প্রার্থনা করুন।',
    'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
    'আস্তাগফিরুল্লাহা ওয়া আতুবু ইলাইহি',
    'আমি আল্লাহর কাছে ক্ষমা চাই এবং তাঁর কাছে তওবা করি',
    100,
    30,
    'anytime',
    null,
    'বুখারী',
    'নবী ﷺ দিনে ১০০ বারের বেশি ইস্তিগফার করতেন।',
    'medium',
    true
  )
) AS v(title_bn, title_ar, title_en, description_bn, arabic_text, transliteration_bn, translation_bn, daily_target_count, total_days, recommended_time, recommended_prayer, reference, fazilat_bn, difficulty_level, is_featured)
WHERE NOT EXISTS (
  SELECT 1 FROM challenge_templates WHERE title_en = v.title_en
);

-- Insert achievements
INSERT INTO challenge_achievements (code, title_bn, title_ar, title_en, description_bn, description_ar, description_en, icon, badge_color, requirement_type, requirement_value, display_order)
SELECT * FROM (VALUES
  ('first_challenge', 'প্রথম চ্যালেঞ্জ', null, 'First Challenge', 'প্রথম চ্যালেঞ্জ সম্পূর্ণ করেছেন', null, null, '🎯', '#10b981', 'challenges_completed', 1, 1),
  ('streak_7', '৭ দিনের স্ট্রীক', null, '7-Day Streak', 'টানা ৭ দিন চ্যালেঞ্জ চালিয়ে গেছেন', null, null, '🔥', '#f59e0b', 'streak', 7, 2),
  ('streak_21', '২১ দিনের স্ট্রীক', null, '21-Day Streak', 'টানা ২১ দিন চ্যালেঞ্জ চালিয়ে গেছেন', null, null, '⚡', '#ef4444', 'streak', 21, 3),
  ('complete_3', '৩টি চ্যালেঞ্জ', null, '3 Challenges', '৩টি চ্যালেঞ্জ সম্পূর্ণ করেছেন', null, null, '🏆', '#8b5cf6', 'challenges_completed', 3, 4),
  ('complete_10', '১০টি চ্যালেঞ্জ', null, '10 Challenges', '১০টি চ্যালেঞ্জ সম্পূর্ণ করেছেন', null, null, '👑', '#ec4899', 'challenges_completed', 10, 5)
) AS v(code, title_bn, title_ar, title_en, description_bn, description_ar, description_en, icon, badge_color, requirement_type, requirement_value, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM challenge_achievements WHERE code = v.code
);

-- Insert basic permissions
INSERT INTO permissions (name, description) VALUES
('challenges.create', 'Create new challenges'),
('challenges.read', 'View challenges'),
('challenges.update', 'Edit challenges'),
('challenges.delete', 'Delete challenges'),
('challenges.manage', 'Full challenge management'),
('duas.create', 'Create new duas'),
('duas.read', 'View duas'),
('duas.update', 'Edit duas'),
('duas.delete', 'Delete duas'),
('duas.manage', 'Full duas management'),
('users.read', 'View users'),
('users.update', 'Edit users'),
('users.delete', 'Delete users'),
('users.manage', 'Full user management'),
('admin_users.create', 'Create admin users'),
('admin_users.read', 'View admin users'),
('admin_users.update', 'Update admin users'),
('admin_users.delete', 'Delete admin users'),
('admin_users.manage', 'Full admin users management'),
('settings.read', 'View settings'),
('settings.update', 'Edit settings'),
('settings.manage', 'Full settings management'),
('logs.read', 'View logs'),
('logs.delete', 'Delete logs'),
('logs.manage', 'Full logs management'),
('activities.read', 'View activities'),
('activities.manage', 'Manage activities'),
('dashboard.read', 'View dashboard'),
('dashboard.manage', 'Full dashboard access')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SETUP ACTIVITY STATS FOR EXISTING CHALLENGES
-- ============================================

-- Create activity stats for existing challenges
DO $$
DECLARE
  v_challenge RECORD;
  v_activity_stat_id UUID;
  v_slug TEXT;
  v_activity_type TEXT;
BEGIN
  -- Loop through all active challenges
  FOR v_challenge IN 
    SELECT * FROM challenge_templates 
    WHERE is_active = true
  LOOP
    -- Generate slug
    v_slug := LOWER(REGEXP_REPLACE(
      COALESCE(v_challenge.title_en, v_challenge.title_bn), 
      '[^a-zA-Z0-9]+', 
      '-', 
      'g'
    ));
    
    -- Determine activity type
    IF v_challenge.title_en ILIKE '%prayer%' OR v_challenge.title_bn LIKE '%নামাজ%' THEN
      v_activity_type := 'prayer';
    ELSIF v_challenge.title_en ILIKE '%dua%' OR v_challenge.title_bn LIKE '%দোয়া%' THEN
      v_activity_type := 'dua';
    ELSE
      v_activity_type := 'dhikr';
    END IF;
    
    -- Check if activity stat exists
    SELECT id INTO v_activity_stat_id
    FROM activity_stats
    WHERE unique_slug = v_slug;
    
    IF v_activity_stat_id IS NULL THEN
      -- Create it
      INSERT INTO activity_stats (
        name_bn,
        name_ar,
        name_en,
        unique_slug,
        arabic_text,
        activity_type,
        icon,
        color
      )
      VALUES (
        v_challenge.title_bn,
        v_challenge.title_ar,
        v_challenge.title_en,
        v_slug,
        v_challenge.arabic_text,
        v_activity_type,
        v_challenge.icon,
        v_challenge.color
      )
      RETURNING id INTO v_activity_stat_id;
    END IF;
    
    -- Create mapping
    INSERT INTO challenge_activity_mapping (challenge_id, activity_stat_id)
    VALUES (v_challenge.id, v_activity_stat_id)
    ON CONFLICT (challenge_id, activity_stat_id) DO NOTHING;
    
  END LOOP;
END $$;

-- ============================================
-- CREATE ADMIN USER
-- ============================================

-- Promote specific user by email to super admin
INSERT INTO admin_users (user_id, email, role, is_active)
SELECT 
  id,
  email,
  'super_admin',
  true
FROM auth.users
WHERE email = 'mahedianwar@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'super_admin',
  is_active = true,
  updated_at = now();

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'ISLAMIC DUA APP DATABASE SETUP COMPLETE!';
  RAISE NOTICE '============================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ All tables created successfully';
  RAISE NOTICE '✅ Indexes and triggers configured';
  RAISE NOTICE '✅ Row Level Security policies applied';
  RAISE NOTICE '✅ Sample data inserted';
  RAISE NOTICE '✅ Activity stats system configured';
  RAISE NOTICE '✅ Admin user created (if exists)';
  RAISE NOTICE '';
  RAISE NOTICE 'Your Islamic Dua App database is ready to use!';
  RAISE NOTICE '';
END $$;