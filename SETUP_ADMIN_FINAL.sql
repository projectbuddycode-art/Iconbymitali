-- Admin Profile Setup SQL
-- Run this in Supabase SQL Editor at: https://apmiabucenklyfaewoun.supabase.co/project/default/sql

-- The admin user ID is: 9246f817-f333-4530-97c4-3492469daa48
-- Email: admin@iconbymitali.com

-- Insert or update user_profiles to mark as admin
INSERT INTO user_profiles (id, email, is_admin, role, created_at, updated_at)
VALUES (
  '9246f817-f333-4530-97c4-3492469daa48',
  'admin@iconbymitali.com',
  true,
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  role = 'admin',
  email = 'admin@iconbymitali.com',
  updated_at = NOW();

-- Verify the admin user was created/updated
SELECT id, email, is_admin, role, created_at, updated_at 
FROM user_profiles 
WHERE email = 'admin@iconbymitali.com';
