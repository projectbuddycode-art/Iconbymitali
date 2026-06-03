-- Fix Products RLS Policy for Admin Insert
-- This allows admin users to create products

-- First, let's check the current policies on products table
-- SELECT * FROM pg_policies WHERE tablename = 'products';

-- Create INSERT policy for admin users on products table
CREATE POLICY "Allow admin to insert products"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND (user_profiles.is_admin = true OR user_profiles.role = 'admin')
  )
);

-- Create UPDATE policy for admin users on products table  
CREATE POLICY "Allow admin to update products"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND (user_profiles.is_admin = true OR user_profiles.role = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND (user_profiles.is_admin = true OR user_profiles.role = 'admin')
  )
);

-- Create DELETE policy for admin users on products table
CREATE POLICY "Allow admin to delete products"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND (user_profiles.is_admin = true OR user_profiles.role = 'admin')
  )
);

-- Ensure SELECT policy exists for admin users (to see products)
CREATE POLICY "Allow admin to view all products"
ON public.products
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND (user_profiles.is_admin = true OR user_profiles.role = 'admin')
  )
  OR
  -- Allow public access (for non-authenticated users to browse)
  (SELECT COUNT(*) FROM public.user_profiles WHERE id = auth.uid()) = 0
  OR
  -- Allow regular users to see published products
  is_active = true
);
