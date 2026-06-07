-- ════════════════════════════════════════════════════════════════════════════
-- ICON by Mitali - Fresh Checkout System
-- Clean Orders Table with Complete Payment & Shipment Tracking
-- ════════════════════════════════════════════════════════════════════════════

-- Drop old table if exists (DESTRUCTIVE - backup first!)
-- DROP TABLE IF EXISTS orders CASCADE;

-- Create orders table
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  
  -- Order Identification
  order_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Customer Information
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  shipping_address JSONB NOT NULL,
  
  -- Payment Information
  amount DECIMAL(10, 2) NOT NULL,
  razorpay_order_id VARCHAR(50) UNIQUE,
  razorpay_payment_id VARCHAR(50) UNIQUE,
  razorpay_signature VARCHAR(128),
  payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- pending, paid, failed
  
  -- Order Status
  order_status VARCHAR(50) DEFAULT 'confirmed' NOT NULL, -- confirmed, processing, shipped, delivered, cancelled
  
  -- Products (stored as JSON)
  products JSONB NOT NULL, -- [{id, name, price, quantity, size}, ...]
  
  -- Shiprocket Integration
  shiprocket_order_id VARCHAR(50),
  shiprocket_awb_code VARCHAR(50),
  shiprocket_status VARCHAR(50), -- pending, processing, shipped, etc
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Metadata
  notes TEXT,
  
  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- Create indexes for faster queries
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_order_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read their own orders
CREATE POLICY "Users can read their own orders"
  ON orders
  FOR SELECT
  USING (customer_email = current_setting('request.jwt.claims', true)::jsonb->>'email'
    OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role');

-- Policy: Allow service role to do anything
CREATE POLICY "Service role has full access"
  ON orders
  USING (current_setting('request.jwt.claims', true)::jsonb->>'role' = 'service_role');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- ════════════════════════════════════════════════════════════════════════════
-- Deployment Instructions:
-- ════════════════════════════════════════════════════════════════════════════
-- 1. Go to Supabase Dashboard → SQL Editor
-- 2. Create new query
-- 3. Paste this entire script
-- 4. Click "Run"
-- 5. Verify table created: Go to "Database" → "Tables" → look for "orders"
-- ════════════════════════════════════════════════════════════════════════════
