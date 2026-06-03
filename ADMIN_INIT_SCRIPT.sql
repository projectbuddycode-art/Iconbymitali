-- ICON by Mitali - Admin User Initialization Script
-- This script sets up the database and creates an admin user
-- Run this script in Supabase SQL Editor after creating auth user: https://supabase.com/dashboard/project/apmiabucenklyfaewoun/sql

-- ============================================================================
-- STEP 1: Ensure user_profiles table exists with proper columns
-- ============================================================================
-- (This table is already created by DATABASE_SETUP.sql)
-- But let's add the trigger to auto-create profiles for new users if not exists

CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role, is_admin, full_name)
  VALUES (
    new.id,
    new.email,
    'user',
    false,
    COALESCE(new.user_metadata->>'full_name', new.email)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if not exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- STEP 2: Make admin user for Mitali Dhumal (ddubey7112@gmail.com)
-- ============================================================================
-- This assumes the user is already created in Supabase Auth
-- If not, create the user first in Supabase Dashboard > Authentication > Users > Add User

-- Update or insert admin user profile
-- Replace the email with your admin email if needed
INSERT INTO user_profiles (id, email, full_name, role, is_admin)
SELECT 
  id,
  email,
  'Mitali Dhumal',
  'admin',
  true
FROM auth.users
WHERE email = 'ddubey7112@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', is_admin = true, full_name = 'Mitali Dhumal', updated_at = NOW();

-- ============================================================================
-- STEP 3: Verify setup
-- ============================================================================
-- Run this query to verify the admin user was created:
-- SELECT id, email, full_name, role, is_admin, created_at FROM user_profiles WHERE email = 'ddubey7112@gmail.com';

-- ============================================================================
-- STEP 4: Enable Row Level Security (RLS) for user_profiles
-- ============================================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile (but not role/admin status)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Service role can do anything (for admin operations)
CREATE POLICY "Service role has full access"
  ON user_profiles
  USING (auth.role() = 'service_role');

-- ============================================================================
-- Additional helpful queries
-- ============================================================================

-- To add another admin user:
-- INSERT INTO user_profiles (id, email, full_name, role, is_admin)
-- SELECT 
--   id,
--   email,
--   'Admin Name',
--   'admin',
--   true
-- FROM auth.users
-- WHERE email = 'newemail@example.com'
-- ON CONFLICT (id) DO UPDATE
-- SET role = 'admin', is_admin = true;

-- To view all admin users:
-- SELECT id, email, full_name, role, is_admin, created_at FROM user_profiles WHERE is_admin = true;

-- To remove admin privileges:
-- UPDATE user_profiles SET role = 'user', is_admin = false WHERE email = 'email@example.com';
