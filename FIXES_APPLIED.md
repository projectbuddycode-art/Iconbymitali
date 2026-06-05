# Production Issues - Fixes Summary

## Issues Fixed in Code

### 1. ✅ Razorpay Payment Gateway - FIXED
**Problem**: Cart.jsx was importing deprecated `base44Client` which doesn't have `functions.invoke()` support.
- Function calls: `base44.functions.invoke("razorpayCreateOrder")` and `base44.functions.invoke("razorpayVerifyPayment")` failed with "Cannot read properties of undefined"

**Solution Applied**:
- Updated Cart.jsx imports: Changed from `import { base44 } from "@/api/base44Client"` to `import { supabase } from "@/api/supabaseClient"`
- Updated function invocation to use proper Supabase functions:
  - `supabase.functions.invoke("razorpay-create-order", { body: { amount: total } })`
  - `supabase.functions.invoke("razorpay-verify-payment", { body: { ...paymentData } })`
- Status: ✅ CODE FIXED - Ready for testing

---

## Issues Requiring Database Migrations

### 2. ⏳ Missing 'notes' Column in Orders Table
**Problem**: Cart.jsx sends a `notes` field with every order, but the database column doesn't exist
- Error: "Could not find the 'notes' column of 'orders' in the schema cache"

**Solution**: Execute in Supabase SQL Editor:
```sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT;
COMMENT ON COLUMN orders.notes IS 'Optional customer notes or payment information';
```

---

### 3. ⏳ Product CRUD Not Working (Delete/Edit Failing)
**Problem**: RLS (Row Level Security) policies are missing from the `products` table
- Delete button: Returns error (likely permission denied)
- Edit button: Returns "Cannot coerce the result to a single JSON object"

**Solution**: Execute all policies in Supabase SQL Editor
See: `PRODUCTION_MIGRATIONS.sql` or `FIX_PRODUCTS_RLS.sql`

The policies allow admins (identified by `user_profiles.is_admin = true` or `user_profiles.role = 'admin'`) to:
- CREATE new products
- READ all products
- UPDATE existing products
- DELETE products

---

## How to Apply Migrations

### Option A: Using Supabase Dashboard (Recommended)
1. Go to: https://app.supabase.com/project/apmiabucenklyfaewoun
2. Click "SQL Editor" in the left sidebar
3. Click "+ New Query" to create a new SQL query
4. Copy and paste the SQL from `PRODUCTION_MIGRATIONS.sql`
5. Click "Run" button
6. Verify success in output panel

### Option B: Using Supabase CLI
```bash
# Install Supabase CLI (if not already installed)
npm install -g supabase

# Authenticate
supabase login

# Push migrations
supabase db push
```

---

## Files Changed

### `/src/pages/Cart.jsx`
- **Line 11**: Changed import from `base44Client` to `supabaseClient`
- **Lines 135-144**: Updated `supabase.functions.invoke("razorpay-create-order")` call
- **Lines 181-191**: Updated `supabase.functions.invoke("razorpay-verify-payment")` call

### New Files Created
- `/ADD_NOTES_TO_ORDERS.sql` - Simple migration to add notes column
- `/PRODUCTION_MIGRATIONS.sql` - Complete migration guide with RLS policies

---

## Testing Checklist

After applying migrations:

### Test 1: Admin Dashboard - Product Operations
- [ ] Login as admin@iconbymitali.com
- [ ] Navigate to /admin/products
- [ ] **Create Product**: Fill form and click Save - should succeed
- [ ] **Edit Product**: Click Edit on existing product - should load without "Cannot coerce" error
- [ ] **Delete Product**: Click Delete - should succeed

### Test 2: Admin Dashboard - Form Persistence
- [ ] Add product (partial form)
- [ ] Switch to another admin tab (Collections, Orders, etc.)
- [ ] Switch back to Products tab
- [ ] Verify form data is still there (localStorage persistence working)

### Test 3: Checkout Flow (After Edge Functions are deployed)
- [ ] Add products to cart
- [ ] Click "Proceed to Checkout"
- [ ] Select Razorpay payment
- [ ] Click "Pay Now"
- [ ] Verify Razorpay payment modal loads
- [ ] Complete payment flow

---

## Known Limitations

1. **Razorpay Edge Functions**: The code is fixed but the actual Edge Functions (`razorpay-create-order` and `razorpay-verify-payment`) must be deployed in Supabase
   - Without them, checkout will fail with "Failed to invoke function"

2. **Product Edit Error**: May still occur if data structure doesn't match schema
   - Check: Does `related_products` array match database expectations?

3. **RLS Policies**: Only work for authenticated users with `is_admin = true` or `role = 'admin'`
   - Make sure admin user profile is properly configured

---

## Next Steps if Issues Persist

1. **Razorpay still failing**: Check browser console (F12) for actual error message
2. **Products still won't delete**: Verify RLS policies were applied (SELECT from `information_schema.table_constraints`)
3. **Orders still have schema error**: Check if `notes` column was actually created (SELECT column_name FROM information_schema.columns WHERE table_name='orders')
4. **Admin session timeout**: Already fixed in AuthContext - session should persist indefinitely with autoRefreshToken

---

## Environment Info

- **Frontend**: http://localhost:5173
- **Supabase Project**: https://apmiabucenklyfaewoun.supabase.co
- **Admin User**: admin@iconbymitali.com / Admin123456!
- **Auth Method**: Email/Password with Supabase Auth (PKCE flow)
- **Session Storage**: localStorage key: `icon_by_mitali_auth`
