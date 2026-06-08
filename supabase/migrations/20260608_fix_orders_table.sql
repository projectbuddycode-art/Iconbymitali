-- Migration 001: Create complete orders table
-- This migration fixes the orders table schema

-- Drop existing orders table if it has issues
DROP TABLE IF EXISTS orders CASCADE;

-- Create new orders table with all required fields
CREATE TABLE public.orders (
  id BIGSERIAL PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
  amount DECIMAL(10, 2) NOT NULL,
  razorpay_order_id VARCHAR(50) UNIQUE,
  razorpay_payment_id VARCHAR(50) UNIQUE,
  razorpay_signature VARCHAR(128),
  payment_status VARCHAR(50) DEFAULT 'pending' NOT NULL,
  order_status VARCHAR(50) DEFAULT 'confirmed' NOT NULL,
  products JSONB NOT NULL DEFAULT '[]'::jsonb,
  shiprocket_order_id VARCHAR(50),
  shiprocket_awb_code VARCHAR(50),
  shiprocket_status VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- Create indexes
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX idx_orders_razorpay_order_id ON public.orders(razorpay_order_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.orders;
DROP POLICY IF EXISTS "Enable update for all users" ON public.orders;
DROP POLICY IF EXISTS "Edge functions can insert" ON public.orders;
DROP POLICY IF EXISTS "Edge functions can read" ON public.orders;
DROP POLICY IF EXISTS "Edge functions can update" ON public.orders;

-- Create permissive policies for all operations (service_role will bypass RLS)
CREATE POLICY "anyone_can_insert" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "anyone_can_read" 
ON public.orders 
FOR SELECT 
USING (true);

CREATE POLICY "anyone_can_update" 
ON public.orders 
FOR UPDATE 
USING (true);
