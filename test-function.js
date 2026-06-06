import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://apmiabucenklyfaewoun.supabase.co';
const supabaseKey = 'sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing Edge Function...');
console.log('Supabase URL:', supabaseUrl);
console.log('Client initialized:', !!supabase);

try {
  const res = await supabase.functions.invoke('razorpay-create-order', {
    body: { amount: 100 }
  });
  
  console.log('✅ Response:', res);
  console.log('Data:', res.data);
  console.log('Error:', res.error);
} catch (err) {
  console.error('❌ Error:', err);
  console.error('Message:', err.message);
  console.error('Stack:', err.stack);
}
