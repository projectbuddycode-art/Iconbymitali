-- Insert test products for payment testing
INSERT INTO products (name, description, price, category, stock, created_at, updated_at) 
VALUES
  ('Luxury Knitwear Set', 'Premium wool blend knitwear set with modern design', 5000, 'knitwear', 10, NOW(), NOW()),
  ('Cashmere Sweater', 'Pure cashmere luxury sweater for elegant winters', 12000, 'knitwear', 8, NOW(), NOW()),
  ('Winter Coat', 'Elegant winter outerwear with premium finish', 18000, 'outerwear', 6, NOW(), NOW())
ON CONFLICT DO NOTHING;
