-- Icon by Mitali - Sample Products & Designs
-- Add beautiful sample designs for customers to shop

-- ============================================================================
-- UPDATE COLLECTION DESCRIPTIONS WITH DESIGNS
-- ============================================================================
UPDATE collections SET 
  description = 'Our signature collection featuring premium knitwear designed for ultimate comfort and elegance. Perfect for everyday wear with a luxurious feel.',
  display_order = 1
WHERE name = 'Second Skin';

UPDATE collections SET 
  description = 'Contemporary and modern knitwear designs for the fashion-forward. These pieces blend style with sophistication for urban professionals.',
  display_order = 2
WHERE name = 'Urban Elegance';

UPDATE collections SET 
  description = 'Versatile knitwear perfect for every season. From lightweight summer knits to cozy winter sweaters, explore our full range.',
  display_order = 3
WHERE name = 'Seasonal Essentials';

UPDATE collections SET 
  description = 'Exclusive limited edition pieces crafted with meticulous attention to detail. Each item is a unique statement piece.',
  display_order = 4
WHERE name = 'Limited Edition';

-- ============================================================================
-- INSERT SAMPLE PRODUCTS (Second Skin Collection)
-- ============================================================================
INSERT INTO products (
  name, 
  price, 
  description, 
  collection_id,
  featured,
  show_in_lookbook,
  stock,
  sizes,
  created_at
) 
SELECT 
  'Luxe Cotton Blend Sweater',
  2500,
  'Premium cotton blend sweater with a soft, breathable feel. Perfect for layering or wearing solo. Features a comfortable fit with attention to detail.',
  c.id,
  TRUE,
  TRUE,
  50,
  '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
  NOW()
FROM collections c WHERE c.name = 'Second Skin'
ON CONFLICT DO NOTHING;

INSERT INTO products (
  name, 
  price, 
  description, 
  collection_id,
  featured,
  show_in_lookbook,
  stock,
  sizes,
  created_at
) 
SELECT 
  'Silk Touch Cardigan',
  3500,
  'Elegant cardigan with a silk-like finish. Beautifully draped with pearl buttons. A timeless piece for any wardrobe.',
  c.id,
  TRUE,
  TRUE,
  35,
  '["XS", "S", "M", "L", "XL"]'::jsonb,
  NOW()
FROM collections c WHERE c.name = 'Second Skin'
ON CONFLICT DO NOTHING;

INSERT INTO products (
  name, 
  price, 
  description, 
  collection_id,
  featured,
  stock,
  sizes,
  created_at
) 
SELECT 
  'Fine Merino Turtleneck',
  4200,
  'Premium merino wool turtleneck offering warmth without bulk. Naturally temperature-regulating and incredibly soft.',
  c.id,
  FALSE,
  45,
  '["XS", "S", "M", "L", "XL"]'::jsonb,
  NOW()
FROM collections c WHERE c.name = 'Second Skin'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT SAMPLE PRODUCTS (Urban Elegance Collection)
-- ============================================================================
INSERT INTO products (
  name, 
  price, 
  description, 
  collection_id,
  featured,
  show_in_lookbook,
  stock,
  sizes,
  created_at
) 
SELECT 
  'Modern Minimalist Knit',
  3200,
  'Sleek and sophisticated sweater in neutral tones. Features clean lines and a tailored fit. Perfect for professional settings.',
  c.id,
  TRUE,
  TRUE,
  40,
  '["XS", "S", "M", "L", "XL"]'::jsonb,
  NOW()
FROM collections c WHERE c.name = 'Urban Elegance'
ON CONFLICT DO NOTHING;

INSERT INTO products (
  name, 
  price, 
  description, 
  collection_id,
  featured,
  show_in_lookbook,
  stock,
  sizes,
  created_at
) 
SELECT 
  'Oversized Cable Knit',
  2800,
  'Comfortable oversized sweater with beautiful cable knit detailing. A contemporary take on a classic style.',
  c.id,
  TRUE,
  TRUE,
  55,
  '["S", "M", "L", "XL"]'::jsonb,
  NOW()
FROM collections c WHERE c.name = 'Urban Elegance'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT SAMPLE PRODUCTS (Seasonal Essentials Collection)
-- ============================================================================
INSERT INTO products (
  name, 
  price, 
  description, 
  collection_id,
  featured,
  show_in_lookbook,
  stock,
  sizes,
  created_at
) 
SELECT 
  'Lightweight Summer Tank',
  1800,
  'Breathable summer knit tank perfect for warm weather. Pairs beautifully with any outfit. Available in multiple colors.',
  c.id,
  TRUE,
  TRUE,
  60,
  '["XS", "S", "M", "L", "XL"]'::jsonb,
  NOW()
FROM collections c WHERE c.name = 'Seasonal Essentials'
ON CONFLICT DO NOTHING;

INSERT INTO products (
  name, 
  price, 
  description, 
  collection_id,
  featured,
  show_in_lookbook,
  stock,
  sizes,
  created_at
) 
SELECT 
  'Cozy Winter Sweater',
  3800,
  'Soft and warm winter sweater crafted from premium wool blend. Features reinforced stitching and long-lasting quality.',
  c.id,
  TRUE,
  TRUE,
  30,
  '["XS", "S", "M", "L", "XL", "XXL"]'::jsonb,
  NOW()
FROM collections c WHERE c.name = 'Seasonal Essentials'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- INSERT SAMPLE PRODUCTS (Limited Edition Collection)
-- ============================================================================
INSERT INTO products (
  name, 
  price, 
  description, 
  collection_id,
  featured,
  show_in_lookbook,
  stock,
  sizes,
  created_at
) 
SELECT 
  'Artisan Hand-Dyed Sweater',
  5200,
  'Exclusive hand-dyed sweater with unique color variations. Each piece is one-of-a-kind with intricate details.',
  c.id,
  TRUE,
  TRUE,
  15,
  '["XS", "S", "M", "L"]'::jsonb,
  NOW()
FROM collections c WHERE c.name = 'Limited Edition'
ON CONFLICT DO NOTHING;

INSERT INTO products (
  name, 
  price, 
  description, 
  collection_id,
  featured,
  show_in_lookbook,
  stock,
  sizes,
  created_at
) 
SELECT 
  'Bespoke Designer Cardigan',
  7500,
  'Limited edition designer cardigan with premium materials and impeccable craftsmanship. A true collectors piece.',
  c.id,
  TRUE,
  TRUE,
  8,
  '["XS", "S", "M", "L", "XL"]'::jsonb,
  NOW()
FROM collections c WHERE c.name = 'Limited Edition'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- Verify collections updated
SELECT 'Collections:' as info, COUNT(*) as total, SUM(CASE WHEN description IS NOT NULL THEN 1 ELSE 0 END) as with_descriptions
FROM collections;

-- Verify products inserted
SELECT 'Products:' as info, COUNT(*) as total FROM products;

-- Show products by collection
SELECT c.name as collection, COUNT(p.id) as product_count, SUM(p.stock) as total_stock
FROM products p
RIGHT JOIN collections c ON p.collection_id = c.id
GROUP BY c.name
ORDER BY c.display_order;
