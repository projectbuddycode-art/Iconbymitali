# ICON by Mitali - Supabase Issues Analysis & Fix

## Problems Identified

### 1. ❌ Razorpay Edge Function Issue
**File:** `supabase/functions/razorpay-verify-payment/index.ts`

The function creates orders but **doesn't include the 'notes' field** that the frontend is sending.

**Current Code (Line 106-122):**
```typescript
.insert([
  {
    order_number: orderNumber,
    customer_name: orderData.customer_name,
    customer_email: orderData.customer_email,
    customer_phone: orderData.customer_phone,
    shipping_address: orderData.shipping_address,
    items: orderData.items,
    total_amount: orderData.total_amount,
    razorpay_order_id: razorpay_order_id,
    razorpay_payment_id: razorpay_payment_id,
    status: "payment_confirmed",
    created_at: new Date().toISOString(),
    // ❌ MISSING: notes: orderData.notes,
  },
])
```

---

### 2. ❌ Orders Table Schema Issue
The `orders` table is **missing the 'notes' column**.

---

### 3. ❌ RLS Policies Not Applied
Product CRUD operations fail because RLS policies are not applied to the `products` table.

---

## Step-by-Step Fix

### Step 1: Add 'notes' Column to Orders Table

**Run this SQL in Supabase (SQL Editor):**

```sql
-- Add notes column if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add comments
COMMENT ON COLUMN orders.notes IS 'Customer notes or payment information';

-- Verify the column was added
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
```

**Expected Output:** You should see a `notes` column with `data_type: text`

---

### Step 2: Apply RLS Policies for Products Table

**Run this SQL in Supabase (SQL Editor):**

```sql
-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

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
```

---

### Step 3: Update Razorpay Verify Payment Edge Function

Fix the edge function to include the `notes` field:

**File:** `supabase/functions/razorpay-verify-payment/index.ts`

**Change at Lines 106-122:**

Replace:
```typescript
    // Create order in database
    const { data: createdOrder, error: dbError } = await supabase
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          shipping_address: orderData.shipping_address,
          items: orderData.items,
          total_amount: orderData.total_amount,
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          status: "payment_confirmed",
          created_at: new Date().toISOString(),
        },
      ])
      .select();
```

With:
```typescript
    // Create order in database
    const { data: createdOrder, error: dbError } = await supabase
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          shipping_address: orderData.shipping_address,
          items: orderData.items,
          total_amount: orderData.total_amount,
          notes: orderData.notes || null,
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          status: "payment_confirmed",
          created_at: new Date().toISOString(),
        },
      ])
      .select();
```

---

### Step 4: Set Razorpay Credentials in Supabase

1. Go to: https://app.supabase.com/project/apmiabucenklyfaewoun
2. Click **Settings** (gear icon) in left sidebar
3. Find **Secrets** section (under Edge Functions)
4. Add these secrets:

| Secret Name | Value |
|---|---|
| `RAZORPAY_KEY_ID` | From https://dashboard.razorpay.com/app/settings/api-keys |
| `RAZORPAY_KEY_SECRET` | From https://dashboard.razorpay.com/app/settings/api-keys |

5. **Redeploy** both edge functions after adding secrets:
   - Go to **Edge Functions**
   - Click `razorpay-create-order` → Click **Redeploy**
   - Click `razorpay-verify-payment` → Click **Redeploy**

---

### Step 5: Verify Everything is Working

**Test Checklist:**

- [ ] orders table has 'notes' column (run SQL check from Step 1)
- [ ] RLS policies exist for products table (run SQL check)
- [ ] Razorpay secrets are set (check in Supabase Settings)
- [ ] Edge functions are redeployed
- [ ] Admin can create products (test in /admin/products)
- [ ] Admin can edit products (test in /admin/products)
- [ ] Admin can delete products (test in /admin/products)
- [ ] Checkout works (test full payment flow)

---

## Testing Commands

### Check Orders Table Structure:
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
```

### Check RLS Policies on Products:
```sql
SELECT 
  policyname,
  tablename,
  CASE WHEN qual IS NULL THEN 'WITHOUT CHECK' ELSE 'WITH CHECK' END
FROM pg_policies
WHERE tablename = 'products'
ORDER BY policyname;
```

### Check if RLS is enabled on Products:
```sql
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'products';
```

---

## Files That Need Updates

1. **Database Migrations:** (Run in Supabase SQL Editor)
   - Add 'notes' column to orders table
   - Apply RLS policies to products table

2. **Edge Function:** `supabase/functions/razorpay-verify-payment/index.ts`
   - Add `notes: orderData.notes || null,` to the order insert

3. **Supabase Secrets:** (Configure in Supabase Settings)
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`

---

## Summary

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| "Invalid order response" | Razorpay secrets not set | Set secrets in Supabase Settings |
| Checkout fails | orders table missing 'notes' column | Run ALTER TABLE migration |
| Product delete fails | RLS policies not applied | Run CREATE POLICY migrations |
| Product edit fails | RLS policies not applied | Run CREATE POLICY migrations |

---

## Next Action Items

1. **Immediately:** Run the SQL migrations in Supabase (Steps 1 & 2)
2. **Update Edge Function:** Add notes field to order insert (Step 3)
3. **Configure Secrets:** Set Razorpay credentials (Step 4)
4. **Redeploy Functions:** Redeploy edge functions after changes
5. **Verify:** Run all test SQL queries to confirm everything is set up

Once these are done, the payment flow will work end-to-end! ✅
