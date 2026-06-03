-- Set admin role for admin@iconbymitali.com user
-- This script assumes the user exists in auth.users table

-- First, get the user ID for admin@iconbymitali.com
-- Then insert/update user_profiles to set is_admin = true

INSERT INTO user_profiles (id, email, is_admin, role, created_at, updated_at)
SELECT 
  id,
  email,
  true,
  'admin',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@iconbymitali.com'
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  role = 'admin',
  updated_at = NOW();

-- Verify the admin user
SELECT id, email, is_admin, role FROM user_profiles WHERE email = 'admin@iconbymitali.com';
