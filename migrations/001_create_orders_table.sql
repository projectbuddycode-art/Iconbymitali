-- Create orders table for new payment system
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(255) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  shipping_address JSONB NOT NULL,
  amount INTEGER NOT NULL, -- Amount in paise
  payment_id VARCHAR(255),
  razorpay_order_id VARCHAR(255) UNIQUE,
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, failed
  order_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  products JSONB NOT NULL, -- Array of product objects
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_orders_customer_email ON orders(customer_email);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to insert (for guest checkout)
CREATE POLICY "Allow insert for all" ON orders
  FOR INSERT
  WITH CHECK (true);

-- Policy: Allow anyone to read their own orders by email
CREATE POLICY "Allow read by email" ON orders
  FOR SELECT
  USING (true); -- In production, restrict to authenticated users

-- Policy: Allow update by service role only
CREATE POLICY "Allow update by service role" ON orders
  FOR UPDATE
  USING (false); -- Disable normal user updates
