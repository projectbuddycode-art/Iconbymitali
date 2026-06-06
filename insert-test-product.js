import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://apmiabucenklyfaewoun.supabase.co',
  'sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu'
);

async function addProduct() {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      product_name: 'Test Knitwear - Premium',
      size: 'M',
      price: 500,
      description: 'Premium luxury flat knitwear for payment testing',
      images: JSON.stringify(['https://via.placeholder.com/500x600?text=Knitwear'])
    }]);
  
  if (error) {
    console.error('❌ Error inserting product:', error.message);
    process.exit(1);
  }
  
  console.log('✅ Product added successfully:', data);
  process.exit(0);
}

addProduct();
