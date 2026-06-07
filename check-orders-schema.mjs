import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://apmiabucenklyfaewoun.supabase.co',
  'sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu'
);

console.log('🔍 Checking Orders Table Schema...\n');

// Try to insert a minimal order to see what fields are required
const testOrder = {
  order_number: `ICON-TEST-${Date.now()}`,
  customer_name: 'Test',
  customer_email: 'test@example.com',
  customer_phone: '9876543210',
  items: [],
  total_amount: 100,
  status: 'pending',
};

console.log('Attempting to create order with fields:', Object.keys(testOrder));
const { data, error } = await supabase
  .from('orders')
  .insert([testOrder])
  .select();

if (error) {
  console.log('❌ Error:', error.message);
  console.log('\nThis indicates missing/invalid columns. Trying without payment_status...');
  
  // The error should tell us what's wrong
  if (error.message.includes('payment_status')) {
    console.log('\n✅ Found the issue: payment_status column does NOT exist in orders table');
    console.log('   Need to remove payment_status from Cart.jsx');
  }
} else {
  console.log('✅ Order created successfully!');
  console.log('   Order ID:', data[0]?.id);
  console.log('   Order Number:', data[0]?.order_number);
  
  // Delete the test order
  await supabase
    .from('orders')
    .delete()
    .eq('id', data[0]?.id);
}
