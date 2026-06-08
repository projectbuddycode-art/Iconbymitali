-- Insert test products for payment testing
INSERT INTO products (name, description, price, category, image_url, stock, created_at, updated_at) 
VALUES
  ('Luxury Knitwear Set', 'Premium wool blend knitwear set with modern design', 5000, 'knitwear', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c', 10, NOW(), NOW()),
  ('Cashmere Sweater', 'Pure cashmere luxury sweater for elegant winters', 12000, 'knitwear', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b', 8, NOW(), NOW()),
  ('Winter Coat', 'Elegant winter outerwear with premium finish', 18000, 'outerwear', 'https://images.unsplash.com/photo-1539533057440-7da7b3220b31', 6, NOW(), NOW())
ON CONFLICT DO NOTHING;
