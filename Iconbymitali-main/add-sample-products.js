#!/usr/bin/env node

/**
 * Add Sample Products & Designs to Icon by Mitali
 * This script populates the database with beautiful sample knitwear designs
 * Run with: node add-sample-products.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env.local manually
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parse .env.local
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample products organized by collection
const sampleProducts = {
  'Second Skin': [
    {
      name: 'Luxe Cotton Blend Sweater',
      price: 2500,
      description: 'Premium cotton blend sweater with a soft, breathable feel. Perfect for layering or wearing solo. Features a comfortable fit with attention to detail.',
      featured: true,
      show_in_lookbook: true,
      stock: 50,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
      name: 'Silk Touch Cardigan',
      price: 3500,
      description: 'Elegant cardigan with a silk-like finish. Beautifully draped with pearl buttons. A timeless piece for any wardrobe.',
      featured: true,
      show_in_lookbook: true,
      stock: 35,
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
      name: 'Fine Merino Turtleneck',
      price: 4200,
      description: 'Premium merino wool turtleneck offering warmth without bulk. Naturally temperature-regulating and incredibly soft.',
      featured: false,
      show_in_lookbook: false,
      stock: 45,
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    }
  ],
  'Urban Elegance': [
    {
      name: 'Modern Minimalist Knit',
      price: 3200,
      description: 'Sleek and sophisticated sweater in neutral tones. Features clean lines and a tailored fit. Perfect for professional settings.',
      featured: true,
      show_in_lookbook: true,
      stock: 40,
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
      name: 'Oversized Cable Knit',
      price: 2800,
      description: 'Comfortable oversized sweater with beautiful cable knit detailing. A contemporary take on a classic style.',
      featured: true,
      show_in_lookbook: true,
      stock: 55,
      sizes: ['S', 'M', 'L', 'XL']
    }
  ],
  'Seasonal Essentials': [
    {
      name: 'Lightweight Summer Tank',
      price: 1800,
      description: 'Breathable summer knit tank perfect for warm weather. Pairs beautifully with any outfit. Available in multiple colors.',
      featured: true,
      show_in_lookbook: true,
      stock: 60,
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    },
    {
      name: 'Cozy Winter Sweater',
      price: 3800,
      description: 'Soft and warm winter sweater crafted from premium wool blend. Features reinforced stitching and long-lasting quality.',
      featured: true,
      show_in_lookbook: true,
      stock: 30,
      sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    }
  ],
  'Limited Edition': [
    {
      name: 'Artisan Hand-Dyed Sweater',
      price: 5200,
      description: 'Exclusive hand-dyed sweater with unique color variations. Each piece is one-of-a-kind with intricate details.',
      featured: true,
      show_in_lookbook: true,
      stock: 15,
      sizes: ['XS', 'S', 'M', 'L']
    },
    {
      name: 'Bespoke Designer Cardigan',
      price: 7500,
      description: 'Limited edition designer cardigan with premium materials and impeccable craftsmanship. A true collectors piece.',
      featured: true,
      show_in_lookbook: true,
      stock: 8,
      sizes: ['XS', 'S', 'M', 'L', 'XL']
    }
  ]
};

// Updated collection descriptions
const collectionUpdates = {
  'Second Skin': 'Our signature collection featuring premium knitwear designed for ultimate comfort and elegance. Perfect for everyday wear with a luxurious feel.',
  'Urban Elegance': 'Contemporary and modern knitwear designs for the fashion-forward. These pieces blend style with sophistication for urban professionals.',
  'Seasonal Essentials': 'Versatile knitwear perfect for every season. From lightweight summer knits to cozy winter sweaters, explore our full range.',
  'Limited Edition': 'Exclusive limited edition pieces crafted with meticulous attention to detail. Each item is a unique statement piece.'
};

async function addSampleProducts() {
  console.log('🎨 Adding sample products and designs to Icon by Mitali...\n');

  try {
    // Step 1: Fetch all collections
    console.log('📦 Step 1: Fetching collections...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*');

    if (collectionsError) {
      console.error('❌ Error fetching collections:', collectionsError);
      return;
    }

    if (!collections || collections.length === 0) {
      console.error('❌ No collections found. Please run the migration first.');
      return;
    }

    console.log(`✅ Found ${collections.length} collections\n`);

    // Step 2: Update collection descriptions
    console.log('📝 Step 2: Updating collection descriptions...');
    for (const collection of collections) {
      const description = collectionUpdates[collection.name];
      if (description) {
        const { error } = await supabase
          .from('collections')
          .update({ description })
          .eq('id', collection.id);

        if (error) {
          console.error(`❌ Error updating ${collection.name}:`, error);
        } else {
          console.log(`✅ Updated: ${collection.name}`);
        }
      }
    }
    console.log();

    // Step 3: Add sample products
    console.log('👕 Step 3: Adding sample products...');
    let totalProductsAdded = 0;

    for (const collection of collections) {
      const products = sampleProducts[collection.name] || [];
      
      for (const product of products) {
        const { error } = await supabase
          .from('products')
          .insert([
            {
              ...product,
              collection_id: collection.id,
              sizes: JSON.stringify(product.sizes)
            }
          ]);

        if (error && !error.message.includes('duplicate')) {
          console.error(`❌ Error adding product "${product.name}":`, error);
        } else {
          console.log(`  ✅ ${product.name} (₹${product.price}) - ${product.stock} in stock`);
          totalProductsAdded++;
        }
      }
    }

    console.log(`\n🎉 Successfully added ${totalProductsAdded} sample products!\n`);

    // Step 4: Verify
    console.log('🔍 Step 4: Verification...');
    const { data: allProducts } = await supabase
      .from('products')
      .select('id, name, price, collection_id')
      .order('created_at', { ascending: false });

    if (allProducts) {
      console.log(`✅ Total products in database: ${allProducts.length}`);
      console.log('\n📊 Sample of added products:');
      allProducts.slice(0, 5).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - ₹${p.price}`);
      });
    }

    console.log('\n✨ All done! Customers can now shop from your beautiful designs!\n');
    console.log('🛍️  Visit: http://localhost:5173 to see products');
    console.log('📊 Admin Dashboard: http://localhost:5173/admin\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
addSampleProducts().then(() => {
  process.exit(0);
}).catch(error => {
  console.error(error);
  process.exit(1);
});
