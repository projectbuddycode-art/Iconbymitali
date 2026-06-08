-- This script fixes the orders table schema in Supabase
-- Run this in the Supabase Dashboard SQL Editor

-- First, check what columns exist
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders';

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anyone to insert orders" ON orders;
DROP POLICY IF EXISTS "Users can read their own orders" ON orders;
DROP POLICY IF EXISTS "Service role has full access" ON orders;
DROP POLICY IF EXISTS "anyone_can_insert_orders" ON orders;

-- Add missing columns if they don't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS razorpay_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_payment_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS razorpay_signature VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'confirmed',
ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS shiprocket_order_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS shiprocket_awb_code VARCHAR(255),
ADD COLUMN IF NOT EXISTS shiprocket_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Ensure timestamps exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add check constraint if not exists
ALTER TABLE orders
ADD CONSTRAINT IF NOT EXISTS amount_positive CHECK (amount > 0);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies for edge functions (service_role)
CREATE POLICY "Service role can insert orders" 
ON orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Service role can select orders" 
ON orders 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can update orders" 
ON orders 
FOR UPDATE 
USING (true);

-- Optional: Create policy for authenticated users to read their own orders
-- (requires auth_user_id column)
-- CREATE POLICY "Users can read their own orders"
-- ON orders
-- FOR SELECT
-- USING (auth.uid()::text = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Verify the schema
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
