import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apmiabucenklyfaewoun.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbWlhYnVjZW5rbHlmYWV3b3VuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMzA2ODE0NywiZXhwIjoyMDE4NjQ0MTQ3fQ.GpGgzLx2OZ4O2wepkiUNJ3YxPXqT5eH0OQMP2v5vDnc';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabase() {
  console.log('🔧 Checking and fixing orders table schema...\n');

  try {
    // Test 1: Try to read from orders table
    console.log('1️⃣  Attempting to read from orders table...');
    const { data: readTest, error: readError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (readError) {
      console.error('❌ Cannot read from orders table:', readError.message);
      console.error('   Details:', readError.details);
      
      if (readError.message.includes('relation') || readError.message.includes('does not exist')) {
        console.log('\n   ➜ Table does not exist or is inaccessible');
      }
    } else {
      console.log('✅ Table is readable');
    }

    // Test 2: Try insert with all required fields
    console.log('\n2️⃣  Testing insert with all required fields...');
    const testOrder = {
      order_number: `TEST-${Date.now()}`,
      customer_name: 'Test User',
      customer_email: 'test@example.com',
      customer_phone: '9876543210',
      amount: 100,
      shipping_address: { street: 'Test St', city: 'Test City' },
      products: [{ name: 'Test Product' }],
      razorpay_order_id: 'test_order_id',
      razorpay_payment_id: 'test_payment_id',
      razorpay_signature: 'test_sig',
      payment_status: 'paid',
      order_status: 'confirmed'
    };

    const { data: insertData, error: insertError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select();

    if (insertError) {
      console.error('❌ Insert failed:', insertError.message);
      console.error('   CODE:', insertError.code);
      console.error('   Details:', insertError.details);
      
      if (insertError.code === 'PGRST204') {
        console.error('\n   ➜ Column not found in schema');
        console.log('\n   💡 Solution: Need to run migration to add missing columns');
      }
    } else {
      console.log('✅ Insert successful!');
      console.log('   Order ID:', insertData[0]?.id);
      
      // Clean up
      if (insertData[0]?.id) {
        await supabase.from('orders').delete().eq('id', insertData[0].id);
        console.log('   Test order cleaned up');
      }
    }

    // Test 3: Check current schema by trying different column names
    console.log('\n3️⃣  Checking which columns exist...');
    const testColumns = async (cols) => {
      const { error } = await supabase
        .from('orders')
        .select(cols.join(','))
        .limit(0);
      return !error;
    };

    const columnsToTest = [
      ['id'],
      ['order_number'],
      ['customer_name'],
      ['amount'],
      ['shipping_address'],
      ['products'],
      ['payment_status']
    ];

    for (const cols of columnsToTest) {
      const exists = await testColumns(cols);
      console.log(`   ${exists ? '✅' : '❌'} Column: ${cols[0]}`);
    }

  } catch (err) {
    console.error('🔴 Error:', err.message);
  }
}

fixDatabase();
