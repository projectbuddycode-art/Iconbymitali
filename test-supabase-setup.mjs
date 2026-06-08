import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apmiabucenklyfaewoun.supabase.co';
const supabaseAnonKey = 'sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSetup() {
  console.log('🧪 Testing Supabase Setup...\n');

  // Test 1: Check if orders table exists
  console.log('1️⃣  Checking if orders table exists...');
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('count()', { count: 'exact' })
      .limit(1);

    if (error) {
      console.error('❌ Table not found or inaccessible:', error.message);
      console.error('   CODE:', error.code);
      console.error('   DETAILS:', error.details);
    } else {
      console.log('✅ Orders table exists and is accessible');
    }
  } catch (err) {
    console.error('❌ Error checking table:', err.message);
  }

  // Test 2: Try to insert a test order
  console.log('\n2️⃣  Attempting to insert test order...');
  try {
    const testOrder = {
      order_number: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '9876543210',
      shipping_address: { street: 'Test St', city: 'Test City', state: 'Test State', pincode: '123456', country: 'India' },
      amount: 100,
      razorpay_order_id: `order_TEST${Date.now()}`,
      razorpay_payment_id: `pay_TEST${Date.now()}`,
      razorpay_signature: 'test_signature',
      payment_status: 'paid',
      order_status: 'confirmed',
      products: [{ name: 'Test Product', quantity: 1, price: 100 }],
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([testOrder])
      .select();

    if (error) {
      console.error('❌ Failed to insert test order:', error.message);
      console.error('   CODE:', error.code);
      console.error('   DETAILS:', error.details);
      console.error('\n   Common causes:');
      console.error('   1. RLS policies blocking INSERT');
      console.error('   2. Table column names mismatch');
      console.error('   3. Database constraints violated');
    } else {
      console.log('✅ Test order inserted successfully');
      const insertedId = data[0]?.id;
      
      // Clean up: Delete the test order
      if (insertedId) {
        await supabase.from('orders').delete().eq('id', insertedId);
        console.log('   ✓ Test order cleaned up');
      }
    }
  } catch (err) {
    console.error('❌ Error during insert test:', err.message);
  }

  // Test 3: Check table schema
  console.log('\n3️⃣  Checking table schema...');
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .limit(1);

    if (error && error.message.includes('column')) {
      console.error('❌ Column mismatch:', error.message);
    } else if (error) {
      console.error('❌ Cannot read table:', error.message);
    } else {
      console.log('✅ Table schema appears valid');
    }
  } catch (err) {
    console.error('❌ Error checking schema:', err.message);
  }

  console.log('\n📋 Summary:');
  console.log('If tests fail, run this SQL in Supabase Dashboard > SQL Editor:');
  console.log('');
  console.log('ALTER TABLE orders ENABLE ROW LEVEL SECURITY;');
  console.log('DROP POLICY IF EXISTS "Users can read their own orders" ON orders;');
  console.log('DROP POLICY IF EXISTS "Service role has full access" ON orders;');
  console.log('CREATE POLICY "Allow service role to insert orders" ON orders FOR INSERT WITH CHECK (true);');
  console.log('CREATE POLICY "Allow service role to read orders" ON orders FOR SELECT USING (true);');
}

testSetup();
