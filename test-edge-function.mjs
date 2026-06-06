import fetch from 'node-fetch';

const url = 'https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-create-order';
const anonKey = 'sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu';

console.log('🧪 Testing Edge Function: razorpay-create-order');
console.log('URL:', url);
console.log('');

try {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount: 500 })
  });

  const data = await response.json();
  const status = response.status;

  console.log('Status:', status);
  console.log('Response:', JSON.stringify(data, null, 2));
  
  if (status === 200 && data.order_id) {
    console.log('✅ SUCCESS: Function returned order_id:', data.order_id);
  } else if (data.error) {
    console.log('❌ ERROR:', data.error);
  } else {
    console.log('⚠️ UNEXPECTED:', data);
  }
} catch (error) {
  console.error('❌ FETCH ERROR:', error.message);
}
