import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://apmiabucenklyfaewoun.supabase.co',
  'sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu'
);

async function checkSchema() {
  // Try to get one product to see the schema
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);
  
  if (error) {
    console.error('❌ Error:', error.message);
    
    // Try alternate table names
    console.log('\n📋 Trying alternate table names...');
    
    const tables = ['product', 'item', 'items', 'products_list', 'catalog'];
    for (const table of tables) {
      const { error: e } = await supabase.from(table).select('*').limit(1);
      if (!e) {
        console.log(`✅ Found table: ${table}`);
      }
    }
    return;
  }
  
  if (data && data.length > 0) {
    console.log('✅ Products found! Schema:');
    console.log(JSON.stringify(data[0], null, 2));
  } else {
    console.log('✅ Products table exists but is empty');
    console.log('First product would have this structure');
  }
}

checkSchema();
