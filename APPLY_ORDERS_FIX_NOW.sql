-- CRITICAL FIX: Drop and recreate orders table with correct schema
-- This completely replaces any broken orders table

-- Step 1: Drop existing table and all dependencies
DROP TABLE IF EXISTS orders CASCADE;

-- Step 2: Create proper orders table with all required columns
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  shipping_address JSONB NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  razorpay_order_id VARCHAR(50) UNIQUE,
  razorpay_payment_id VARCHAR(50) UNIQUE,
  razorpay_signature VARCHAR(128),
  payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  order_status VARCHAR(50) DEFAULT 'confirmed' NOT NULL,
  products JSONB NOT NULL,
  shiprocket_order_id VARCHAR(50),
  shiprocket_awb_code VARCHAR(50),
  shiprocket_status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- Step 3: Create indexes
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Step 4: Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Step 5: Create simple permissive policies for edge functions
CREATE POLICY "Edge functions can insert" 
  ON orders FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Edge functions can read" 
  ON orders FOR SELECT 
  USING (true);

CREATE POLICY "Edge functions can update" 
  ON orders FOR UPDATE 
  USING (true);

-- Verify result
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
