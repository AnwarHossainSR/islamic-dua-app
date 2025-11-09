-- Check data in potentially unused tables
SELECT 'challenge_achievements' as table_name, COUNT(*) as row_count FROM challenge_achievements
UNION ALL
SELECT 'user_achievements' as table_name, COUNT(*) as row_count FROM user_achievements  
UNION ALL
SELECT 'user_challenge_bookmarks' as table_name, COUNT(*) as row_count FROM user_challenge_bookmarks
UNION ALL
SELECT 'user_preferences' as table_name, COUNT(*) as row_count FROM user_preferences
ORDER BY table_name;

-- Drop unused tables (uncomment after confirming they're empty and unused)

-- Drop user achievements and challenge achievements (not implemented in app)
-- DROP TABLE IF EXISTS user_achievements CASCADE;
-- DROP TABLE IF EXISTS challenge_achievements CASCADE;

-- Drop user challenge bookmarks (not implemented in app)  
-- DROP TABLE IF EXISTS user_challenge_bookmarks CASCADE;

-- Drop user preferences (using user_settings instead)
-- DROP TABLE IF EXISTS user_preferences CASCADE;

-- Clean up schema.ts relations for dropped tables
-- Remove these relations after dropping tables:
-- - challengeTemplatesRelations bookmarks reference
-- - Any other references to dropped tables