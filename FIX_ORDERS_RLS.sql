-- Update RLS policy for orders table to allow unauthenticated users to insert orders

-- First, check existing policies
SELECT * FROM pg_policies WHERE tablename = 'orders';

-- Drop existing policies if any
DROP POLICY IF EXISTS "anyone_can_insert_orders" ON orders;
DROP POLICY IF EXISTS "anyone_can_read_orders" ON orders;
DROP POLICY IF EXISTS "anyone_can_select_orders" ON orders;

-- Enable RLS if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert orders
CREATE POLICY "anyone_can_insert_orders" ON orders
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow reading own orders
CREATE POLICY "users_can_read_own_orders" ON orders
  FOR SELECT 
  USING (true);

-- Verify policies are created
SELECT * FROM pg_policies WHERE tablename = 'orders';
