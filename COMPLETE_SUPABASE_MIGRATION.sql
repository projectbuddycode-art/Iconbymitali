-- ============================================================================
-- ICON by Mitali - Complete Supabase Migration Script
-- ============================================================================
-- Run this entire script in Supabase SQL Editor to fix all production issues
-- ============================================================================

-- ============================================================================
-- 1. ADD 'notes' COLUMN TO ORDERS TABLE
-- ============================================================================

ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
COMMENT ON COLUMN orders.notes IS 'Customer notes or payment information (e.g., UPI ID, special requests)';

-- Verify notes column exists
SELECT 'Step 1: Check orders table structure' as step;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'notes';

-- ============================================================================
-- 2. ENABLE RLS AND APPLY POLICIES TO PRODUCTS TABLE
-- ============================================================================

-- Enable RLS if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "admin_select_products" ON products;
DROP POLICY IF EXISTS "admin_insert_products" ON products;
DROP POLICY IF EXISTS "admin_update_products" ON products;
DROP POLICY IF EXISTS "admin_delete_products" ON products;

-- SELECT policy - Allow admins to read products
CREATE POLICY "admin_select_products" ON products
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE is_admin = true OR role = 'admin'
    )
  );

-- INSERT policy - Allow admins to create products
CREATE POLICY "admin_insert_products" ON products
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE is_admin = true OR role = 'admin'
    )
  );

-- UPDATE policy - Allow admins to edit products
CREATE POLICY "admin_update_products" ON products
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE is_admin = true OR role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE is_admin = true OR role = 'admin'
    )
  );

-- DELETE policy - Allow admins to delete products
CREATE POLICY "admin_delete_products" ON products
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE is_admin = true OR role = 'admin'
    )
  );

-- Verify RLS is enabled
SELECT 'Step 2: Check RLS on products table' as step;
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'products';

-- Verify policies exist
SELECT 'Step 2b: Check policies on products table' as step;
SELECT 
  policyname,
  tablename,
  CASE WHEN qual IS NULL THEN 'WITHOUT CHECK' ELSE 'WITH CHECK' END as policy_type
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;

-- ============================================================================
-- 3. ENABLE RLS ON ORDERS TABLE
-- ============================================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_view_own_orders" ON orders;
DROP POLICY IF EXISTS "users_insert_orders" ON orders;

-- Allow users to view their own orders
CREATE POLICY "users_view_own_orders" ON orders
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM user_profiles WHERE email = orders.customer_email));

-- Allow authenticated users to insert orders
CREATE POLICY "users_insert_orders" ON orders
  FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 4. ENABLE RLS ON COLLECTIONS TABLE
-- ============================================================================

ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "public_read_collections" ON collections;
DROP POLICY IF EXISTS "admin_manage_collections" ON collections;

-- Allow public read of collections
CREATE POLICY "public_read_collections" ON collections
  FOR SELECT
  USING (true);

-- Allow admins to manage collections
CREATE POLICY "admin_manage_collections" ON collections
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE is_admin = true OR role = 'admin'
    )
  );

-- ============================================================================
-- 5. VERIFY ALL TABLES HAVE CORRECT STRUCTURE
-- ============================================================================

SELECT 'Step 3: Final verification' as step;

-- Check orders table
SELECT 'orders table columns:' as check_type;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Check products table RLS
SELECT 'products table RLS policies:' as check_type;
SELECT 
  policyname,
  permissive,
  roles,
  qual
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;

-- Check collections table exists
SELECT 'collections table columns:' as check_type;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'collections'
ORDER BY ordinal_position;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
-- If all queries above executed without errors, the database is properly configured!
-- Next steps:
-- 1. Deploy razorpay-create-order edge function
-- 2. Deploy razorpay-verify-payment edge function
-- 3. Set RAZORPAY_KEY_ID secret in Supabase
-- 4. Set RAZORPAY_KEY_SECRET secret in Supabase
-- 5. Redeploy both edge functions
-- 6. Test checkout flow
