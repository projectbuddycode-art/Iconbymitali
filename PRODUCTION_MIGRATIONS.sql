-- Icon by Mitali - Production SQL Migrations
-- Execute these in Supabase SQL Editor to fix production issues

-- ============================================================================
-- 1. ADD 'notes' COLUMN TO ORDERS TABLE
-- ============================================================================
-- The Cart checkout flow sends a 'notes' field with order data.
-- This column stores customer notes or payment information (e.g., "UPI ID: user@bank")

ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
COMMENT ON COLUMN orders.notes IS 'Optional customer notes or payment information';

-- ============================================================================
-- 2. APPLY RLS POLICIES FOR PRODUCT CRUD (Admin Only)
-- ============================================================================
-- These policies enable admins to Create, Read, Update, Delete products
-- Replace with policies from FIX_PRODUCTS_RLS.sql if needed

-- SELECT - Admin users can read all products
CREATE POLICY "Admin can select products" ON products
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE is_admin = true OR role = 'admin'
    )
  );

-- INSERT - Admin users can create new products
CREATE POLICY "Admin can insert products" ON products
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE is_admin = true OR role = 'admin'
    )
  );

-- UPDATE - Admin users can edit products
CREATE POLICY "Admin can update products" ON products
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE is_admin = true OR role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE is_admin = true OR role = 'admin'
    )
  );

-- DELETE - Admin users can delete products
CREATE POLICY "Admin can delete products" ON products
  FOR DELETE USING (
    auth.uid() IN (
      SELECT id FROM user_profiles WHERE is_admin = true OR role = 'admin'
    )
  );

-- ============================================================================
-- 3. VERIFY COLLECTIONS TABLE STRUCTURE
-- ============================================================================
-- Check that the collections table exists and products FK is correct
-- If the query below fails, run: MIGRATION_COLLECTION_FK.sql

-- Run this to verify (just a check, no modification):
-- SELECT COUNT(*) as collection_count FROM collections;
-- SELECT COUNT(*) as product_count FROM products;
