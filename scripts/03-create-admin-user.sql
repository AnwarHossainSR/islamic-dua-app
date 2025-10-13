-- =====================================================
-- Create Admin User
-- =====================================================
-- This script promotes a user to super admin status
-- 
-- IMPORTANT: The user must sign up through the app first!
-- Steps:
-- 1. Go to /signup and create an account with: mahedianwar@gmail.com
-- 2. Confirm your email (check inbox for confirmation link)
-- 3. Run this script to promote yourself to super admin
-- =====================================================

-- Option 1: Promote specific user by email
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

-- Verify the admin user was created
SELECT 
  au.id,
  au.email,
  au.role,
  au.is_active,
  au.created_at
FROM admin_users au
WHERE au.email = 'mahedianwar@gmail.com';

-- =====================================================
-- Alternative: Promote any user to admin by email
-- =====================================================
-- If you need to promote a different user, use this template:
-- 
-- INSERT INTO admin_users (user_id, email, role, is_active)
-- SELECT 
--   id,
--   email,
--   'super_admin',  -- or 'admin' for regular admin
--   true
-- FROM auth.users
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (user_id) 
-- DO UPDATE SET 
--   role = 'super_admin',
--   is_active = true,
--   updated_at = now();
