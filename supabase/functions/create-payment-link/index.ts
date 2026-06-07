import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  console.log("═══════════════════════════════════════════════════════════");
  console.log("✅ [create-payment-link] Function started");
  console.log("═══════════════════════════════════════════════════════════");
  
  if (req.method === "OPTIONS") {
    console.log("📋 Handling CORS OPTIONS request");
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    // Step 1: Parse request body
    console.log("\n📝 [Step 1] Parsing request body...");
    const requestBody = await req.json();
    const { amount, customerName, email, phone } = requestBody;
    
    console.log("  ✓ Request body received:");
    console.log(`    - amount: ${amount}`);
    console.log(`    - customerName: ${customerName}`);
    console.log(`    - email: ${email}`);
    console.log(`    - phone: ${phone}`);

    // Step 2: Check for Razorpay credentials
    console.log("\n🔐 [Step 2] Checking Razorpay credentials...");
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    
    console.log(`  - RAZORPAY_KEY_ID: ${keyId ? "✅ EXISTS (length: " + keyId.length + ")" : "❌ MISSING"}`);
    console.log(`  - RAZORPAY_KEY_SECRET: ${keySecret ? "✅ EXISTS (length: " + keySecret.length + ")" : "❌ MISSING"}`);

    if (!keyId || !keySecret) {
      console.error("❌ [ERROR] Razorpay credentials are not configured!");
      throw new Error("Razorpay credentials not configured in environment");
    }

    // Step 3: Create payment link via Razorpay API
    console.log("\n🔗 [Step 3] Creating payment link via Razorpay API...");
    console.log(`  - Endpoint: https://api.razorpay.com/v1/payment_links`);
    console.log(`  - Amount (in paise): ${Math.round(amount * 100)}`);
    
    const response = await fetch(
      "https://api.razorpay.com/v1/payment_links",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(
            `${keyId}:${keySecret}`
          )}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100),
          currency: "INR",
          description: "ICON by Mitali Order",
          customer: {
            name: customerName,
            email,
            contact: phone,
          },
          notify: {
            sms: true,
            email: true,
          },
          callback_url: `${Deno.env.get("WEBSITE_URL") || "https://iconbymitali.com"}/payment-callback`,
          receipt: `ICON-${Date.now().toString().slice(-8)}`,
        }),
      }
    );

    // Step 4: Parse Razorpay response
    console.log("\n📊 [Step 4] Razorpay API response received");
    console.log(`  - HTTP Status: ${response.status} (${response.statusText})`);
    console.log(`  - Content-Type: ${response.headers.get("content-type")}`);
    
    const data = await response.json();
    
    console.log(`  - Response body: ${JSON.stringify(data).substring(0, 300)}...`);

    if (!response.ok) {
      console.error(`❌ [ERROR] Razorpay API rejected the request (HTTP ${response.status})`);
      console.error(`  - Error response: ${JSON.stringify(data)}`);
      return new Response(
        JSON.stringify(data),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Step 5: Success response
    console.log("\n✅ [Step 5] Payment link created successfully!");
    console.log(`  - Payment URL: ${data.short_url}`);
    console.log("═══════════════════════════════════════════════════════════\n");

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: data.short_url,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("\n❌ [EXCEPTION] Error in create-payment-link function:");
    console.error(`  - Error type: ${error.constructor.name}`);
    console.error(`  - Error message: ${error.message}`);
    console.error(`  - Error stack: ${error.stack}`);
    console.error("═══════════════════════════════════════════════════════════\n");
    
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});