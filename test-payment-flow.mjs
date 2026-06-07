import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apmiabucenklyfaewoun.supabase.co';
const supabaseKey = 'sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 Testing Payment Flow\n');
console.log('=' .repeat(60));

// Test 1: Call create-payment-link Edge Function
console.log('\n1️⃣  Testing create-payment-link Edge Function...');
try {
  const { data, error } = await supabase.functions.invoke('create-payment-link', {
    body: {
      amount: 2099,
      customerName: 'Test Customer',
      email: 'test@example.com',
      phone: '9876543210',
    },
  });

  if (error) {
    console.error('❌ Edge Function Error:', error);
  } else {
    console.log('✅ Edge Function Response:', {
      payment_url: data?.payment_url ? '✅ Present' : '❌ Missing',
      order_id: data?.order_id,
      amount: data?.amount,
      status: 'Success'
    });
  }
} catch (err) {
  console.error('❌ Error calling create-payment-link:', err.message);
}

// Test 2: Try to create an order using Edge Function
console.log('\n2️⃣  Testing Order Creation (via Edge Function)...');
try {
  const orderData = {
    order_number: `ICON-${Date.now().toString().slice(-8)}`,
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_phone: '9876543210',
    items: [{
      product_id: 14,
      product_name: 'Seaside Long- Halter Neck Knit Dress',
      size: 'M',
      quantity: 1,
      price: 2099,
    }],
    total_amount: 2099,
    shipping_address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      country: 'India',
    },
    notes: 'Test order for payment flow',
    status: 'pending',
  };

  const { data, error } = await supabase.functions.invoke('create-order', {
    body: { orderData },
  });

  if (error) {
    console.error('❌ Edge Function Error:', error);
  } else {
    console.log('✅ Order Created Successfully:', {
      order_id: data?.order?.id,
      order_number: data?.order?.order_number,
      total_amount: data?.order?.total_amount,
      status: data?.order?.status,
    });
  }
} catch (err) {
  console.error('❌ Error creating order:', err.message);
}

// Test 3: Query recent orders
console.log('\n3️⃣  Checking Recent Orders in Database...');
try {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('❌ Error fetching orders:', error.message);
  } else {
    console.log(`✅ Found ${data?.length || 0} recent orders:`);
    data?.slice(0, 3).forEach((order, idx) => {
      console.log(`   ${idx + 1}. ${order.order_number} - ₹${order.total_amount} (${order.status})`);
    });
  }
} catch (err) {
  console.error('❌ Error querying orders:', err.message);
}

console.log('\n' + '='.repeat(60));
console.log('🏁 Payment Flow Test Complete\n');
