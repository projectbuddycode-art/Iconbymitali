#!/usr/bin/env node

/**
 * ICON by Mitali - Deployment Test Script
 * 
 * This script tests if your Supabase edge functions are properly deployed
 * and configured with the required environment variables.
 * 
 * Usage:
 *   node test-deployment.mjs
 */

const supabaseUrl = "https://apmiabucenklyfaewoun.supabase.co";
const supabaseKey = "sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu";

console.log("🔍 Testing ICON by Mitali Deployment...\n");

// Test 1: Check if create-payment-link function is accessible
console.log("Test 1: Testing create-payment-link function...");
try {
  const paymentResponse = await fetch(
    `${supabaseUrl}/functions/v1/create-payment-link`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: 100,
        customerName: "Test Customer",
        email: "test@example.com",
        phone: "9876543210",
      }),
    }
  );

  if (paymentResponse.ok) {
    const data = await paymentResponse.json();
    console.log("✅ Payment link created successfully!");
    console.log(`   Payment URL: ${data.payment_url}\n`);
    console.log("✅ DEPLOYMENT SUCCESSFUL - You can now make payments!\n");
  } else {
    const errorData = await paymentResponse.json();
    console.log(`❌ Payment link creation failed (${paymentResponse.status})`);
    console.log(`   Error details: ${JSON.stringify(errorData, null, 2)}\n`);

    if (paymentResponse.status === 500) {
      console.log("⚠️  ISSUE IDENTIFIED: The function is returning a 500 error.");
      console.log("    This usually means the Razorpay credentials are not configured.\n");
      console.log("    📋 FIX: Set these secrets in Supabase Dashboard:\n");
      console.log("    1. Go to: Supabase Dashboard → Project Settings → Secrets");
      console.log("    2. Click 'Add Secret' and add:\n");
      console.log("       Name: RAZORPAY_KEY_ID");
      console.log("       Value: rzp_live_St8qPORB5NlnAZ\n");
      console.log("       Name: RAZORPAY_KEY_SECRET");
      console.log("       Value: [Get from Razorpay → Settings → API Keys → Key Secret]\n");
      console.log("    3. After adding secrets, redeploy the function:\n");
      console.log("       supabase functions deploy create-payment-link --project-id apmiabucenklyfaewoun\n");
    }
  }
} catch (err) {
  console.log(`❌ Error testing payment link: ${err.message}\n`);
}

console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📋 Deployment Checklist:\n");
console.log("[ ] RAZORPAY_KEY_ID set in Supabase secrets");
console.log("[ ] RAZORPAY_KEY_SECRET set in Supabase secrets");
console.log("[ ] create-payment-link function deployed");
console.log("[ ] create-order function deployed");
console.log("[ ] razorpay-webhook function deployed");
console.log("[ ] Payment link test passes");
console.log("[ ] Razorpay webhook configured in Razorpay Dashboard\n");
