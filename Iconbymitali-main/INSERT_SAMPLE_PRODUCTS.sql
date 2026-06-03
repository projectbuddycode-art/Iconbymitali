-- Icon by Mitali - Insert Sample Products
-- Execute this in Supabase SQL Editor to add beautiful designs

-- First, update collection descriptions
UPDATE collections SET 
  description = 'Our signature collection featuring premium knitwear designed for ultimate comfort and elegance. Perfect for everyday wear with a luxurious feel.'
WHERE name = 'Second Skin';

UPDATE collections SET 
  description = 'Contemporary and modern knitwear designs for the fashion-forward. These pieces blend style with sophistication for urban professionals.'
WHERE name = 'Urban Elegance';

UPDATE collections SET 
  description = 'Versatile knitwear perfect for every season. From lightweight summer knits to cozy winter sweaters, explore our full range.'
WHERE name = 'Seasonal Essentials';

UPDATE collections SET 
  description = 'Exclusive limited edition pieces crafted with meticulous attention to detail. Each item is a unique statement piece.'
WHERE name = 'Limited Edition';

-- ============================================================================
-- INSERT SECOND SKIN COLLECTION PRODUCTS
-- ============================================================================
INSERT INTO products (name, price, description, collection_id, featured, show_in_lookbook, stock, sizes) 
VALUES 
  ('Luxe Cotton Blend Sweater', 2500, 'Premium cotton blend sweater with a soft, breathable feel. Perfect for layering or wearing solo.', 
   (SELECT id FROM collections WHERE name = 'Second Skin'), true, true, 50, '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb),
  ('Silk Touch Cardigan', 3500, 'Elegant cardigan with a silk-like finish. Beautifully draped with pearl buttons. A timeless piece for any wardrobe.',
   (SELECT id FROM collections WHERE name = 'Second Skin'), true, true, 35, '["XS", "S", "M", "L", "XL"]'::jsonb),
  ('Fine Merino Turtleneck', 4200, 'Premium merino wool turtleneck offering warmth without bulk. Naturally temperature-regulating and incredibly soft.',
   (SELECT id FROM collections WHERE name = 'Second Skin'), false, false, 45, '["XS", "S", "M", "L", "XL"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT URBAN ELEGANCE COLLECTION PRODUCTS
-- ============================================================================
INSERT INTO products (name, price, description, collection_id, featured, show_in_lookbook, stock, sizes)
VALUES 
  ('Modern Minimalist Knit', 3200, 'Sleek and sophisticated sweater in neutral tones. Features clean lines and a tailored fit. Perfect for professional settings.',
   (SELECT id FROM collections WHERE name = 'Urban Elegance'), true, true, 40, '["XS", "S", "M", "L", "XL"]'::jsonb),
  ('Oversized Cable Knit', 2800, 'Comfortable oversized sweater with beautiful cable knit detailing. A contemporary take on a classic style.',
   (SELECT id FROM collections WHERE name = 'Urban Elegance'), true, true, 55, '["S", "M", "L", "XL"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT SEASONAL ESSENTIALS COLLECTION PRODUCTS
-- ============================================================================
INSERT INTO products (name, price, description, collection_id, featured, show_in_lookbook, stock, sizes)
VALUES 
  ('Lightweight Summer Tank', 1800, 'Breathable summer knit tank perfect for warm weather. Pairs beautifully with any outfit. Available in multiple colors.',
   (SELECT id FROM collections WHERE name = 'Seasonal Essentials'), true, true, 60, '["XS", "S", "M", "L", "XL"]'::jsonb),
  ('Cozy Winter Sweater', 3800, 'Soft and warm winter sweater crafted from premium wool blend. Features reinforced stitching and long-lasting quality.',
   (SELECT id FROM collections WHERE name = 'Seasonal Essentials'), true, true, 30, '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT LIMITED EDITION COLLECTION PRODUCTS
-- ============================================================================
INSERT INTO products (name, price, description, collection_id, featured, show_in_lookbook, stock, sizes)
VALUES 
  ('Artisan Hand-Dyed Sweater', 5200, 'Exclusive hand-dyed sweater with unique color variations. Each piece is one-of-a-kind with intricate details.',
   (SELECT id FROM collections WHERE name = 'Limited Edition'), true, true, 15, '["XS", "S", "M", "L"]'::jsonb),
  ('Bespoke Designer Cardigan', 7500, 'Limited edition designer cardigan with premium materials and impeccable craftsmanship. A true collectors piece.',
   (SELECT id FROM collections WHERE name = 'Limited Edition'), true, true, 8, '["XS", "S", "M", "L", "XL"]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFY RESULTS
-- ============================================================================
SELECT COUNT(*) as total_products FROM products;
SELECT c.name, COUNT(p.id) as products_in_collection 
FROM collections c 
LEFT JOIN products p ON c.id = p.collection_id 
GROUP BY c.name 
ORDER BY c.display_order;
