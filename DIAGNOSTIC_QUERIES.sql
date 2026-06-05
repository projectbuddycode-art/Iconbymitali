-- Icon by Mitali - Production Diagnostic Queries
-- Run these to verify your production setup is correct

-- ============================================================================
-- 1. VERIFY USER PROFILES AND ADMIN STATUS
-- ============================================================================

SELECT 
  id, 
  email, 
  is_admin, 
  role,
  created_at 
FROM user_profiles 
WHERE email LIKE '%admin%' OR email LIKE '%mitali%'
LIMIT 5;

-- Expected: Should show admin@iconbymitali.com with is_admin=true or role='admin'

---

-- ============================================================================
-- 2. VERIFY ORDERS TABLE STRUCTURE
-- ============================================================================

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;

-- Expected: Should include columns like:
-- - id, customer_name, customer_email, total_amount, status, payment_status
-- - shipping_address (JSONB), notes (TEXT), created_at, updated_at

---

-- ============================================================================
-- 3. VERIFY PRODUCTS TABLE STRUCTURE
-- ============================================================================

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products'
ORDER BY ordinal_position;

-- Expected: Should include:
-- - id, name, description, price, original_price, collection_id
-- - images (JSONB), videos (JSONB), related_products (JSONB)
-- - stock, featured, show_in_lookbook

---

-- ============================================================================
-- 4. VERIFY RLS POLICIES ARE ENABLED
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('products', 'orders', 'user_profiles')
ORDER BY tablename;

-- Expected: rowsecurity should be 't' (true) for all tables

---

-- ============================================================================
-- 5. VERIFY RLS POLICIES EXIST
-- ============================================================================

SELECT 
  policyname,
  tablename,
  CASE WHEN qual IS NULL THEN 'WITHOUT CHECK' ELSE 'WITH CHECK' END as policy_type
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;

-- Expected: Should show at least these policies:
-- - Admin can select products
-- - Admin can insert products
-- - Admin can update products
-- - Admin can delete products

---

-- ============================================================================
-- 6. VERIFY COLLECTIONS AND SAMPLE DATA
-- ============================================================================

SELECT id, name, COUNT(p.id) as product_count
FROM collections c
LEFT JOIN products p ON c.id = p.collection_id
GROUP BY c.id, c.name
ORDER BY c.created_at;

-- Expected: Should show collections with some products

---

-- ============================================================================
-- 7. TEST QUERY: Simulate what happens during product update
-- ============================================================================

-- This shows what permissions the auth user would have:
-- (Replace 'your-user-uuid' with actual admin UUID)

SELECT 
  'Admin Check' as test,
  COUNT(*) as admin_count
FROM user_profiles 
WHERE id = current_user_id() 
  AND (is_admin = true OR role = 'admin');

-- Expected: Should return 1 row with admin_count > 0

---

-- ============================================================================
-- TROUBLESHOOTING GUIDE
-- ============================================================================

-- If DELETE fails: Check policies in step 5. If none exist, policies weren't applied.
-- If UPDATE fails: Check RLS is enabled (step 4), policies exist (step 5), and user is admin (step 7).
-- If NOTES column missing: Run ADD_NOTES_TO_ORDERS.sql migration.
-- If products are empty: Check collections table (step 6), products may not be linked correctly.
