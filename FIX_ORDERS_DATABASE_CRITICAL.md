# 🔧 Fix Supabase Database Schema - CRITICAL

## Problem Identified
❌ The `orders` table in Supabase is missing the `amount` column and other required fields.

This is why payment verification fails with: **"Could not find the 'amount' column"**

## Solution: Run SQL Migration

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/apmiabucenklyfaewoun
2. Click **SQL Editor** (left sidebar)
3. Click **New Query** button

### Step 2: Copy and Run the Migration
Copy all SQL from `FIX_ORDERS_TABLE_SCHEMA.sql` into the SQL Editor.

**Or use this quick fix:**

```sql
-- Add all missing columns
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'confirmed',
ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}';

-- Enable RLS and add policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_can_insert_orders" ON orders;
CREATE POLICY "Allow inserts for payment verification" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow reads for all" ON orders FOR SELECT USING (true);
```

### Step 3: Verify Success
Run this query to confirm all columns exist:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
```

Expected columns:
- ✅ order_number (VARCHAR)
- ✅ customer_name (VARCHAR)
- ✅ customer_email (VARCHAR)
- ✅ customer_phone (VARCHAR)
- ✅ **amount (DECIMAL)** ← This is the missing one!
- ✅ shipping_address (JSONB)
- ✅ products (JSONB)
- ✅ razorpay_order_id (VARCHAR)
- ✅ razorpay_payment_id (VARCHAR)
- ✅ razorpay_signature (VARCHAR)
- ✅ payment_status (VARCHAR)
- ✅ order_status (VARCHAR)
- ✅ created_at (TIMESTAMPTZ)

## After Migration

1. ✅ Database schema is fixed
2. ✅ Run the payment test again
3. ✅ Order should now be saved to database
4. ✅ Email should be triggered
5. ✅ Success page should display

## Troubleshooting

### If you get "permission denied" error:
- You might need to run this as admin
- Or the service_role policies might be blocking it
- Run this to fix RLS:

```sql
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Set permissive policies
CREATE POLICY "Allow all operations" ON orders USING (true);
```

### If columns don't show up:
- Refresh the dashboard page
- Check if the table name is exactly `orders` (case-sensitive in SQL)
- Try manually creating the table:

```sql
DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(255) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  razorpay_signature VARCHAR(255),
  payment_status VARCHAR(50) DEFAULT 'pending',
  order_status VARCHAR(50) DEFAULT 'confirmed',
  shipping_address JSONB NOT NULL,
  products JSONB NOT NULL,
  shiprocket_order_id VARCHAR(255),
  shiprocket_awb_code VARCHAR(255),
  shiprocket_status VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Allow inserts" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow reads" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow updates" ON orders FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
```

## Next Steps After Schema Fix

1. **Test Payment Flow**
   - Go to Shop page
   - Add product to cart
   - Checkout with test data
   - Complete payment with test card: 4111 1111 1111 1111

2. **Monitor Logs**
   - Check Supabase edge function logs
   - Check browser console for errors

3. **Verify Order**
   - Check Supabase Dashboard > orders table
   - Should see new order with payment_status = "paid"
   - Order confirmation email should be received

## Questions?
Check the verify-payment edge function logs in Supabase Dashboard > Edge Functions > verify-payment > Logs tab
