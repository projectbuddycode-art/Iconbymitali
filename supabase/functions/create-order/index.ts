import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { encodeBase64 } from "https://deno.land/std@0.208.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { amount, customerName, customerEmail, customerPhone, shippingAddress, products } = await req.json();

    console.log("[create-order] Request received with amount:", amount);

    // Validate inputs
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount. Must be greater than 0." }),
        { status: 400, headers: corsHeaders }
      );
    }
    if (!customerName || !customerEmail || !customerPhone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: customerName, customerEmail, customerPhone" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    console.log("[create-order] Checking environment variables:");
    console.log("[create-order] RAZORPAY_KEY_ID present:", !!razorpayKeyId);
    console.log("[create-order] RAZORPAY_KEY_SECRET present:", !!razorpayKeySecret);

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("[create-order] FAILED: Missing Razorpay credentials!");
      console.error("[create-order] Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Supabase project settings");
      return new Response(
        JSON.stringify({
          error: "Razorpay credentials not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Supabase environment variables.",
          details: "Check Supabase Dashboard > Project Settings > Edge Functions > Environment Variables"
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Encode credentials for Basic auth
    const credentials = `${razorpayKeyId}:${razorpayKeySecret}`;
    const encodedCredentials = encodeBase64(credentials);

    // Create Razorpay order
    console.log("[create-order] Calling Razorpay API with amount:", amount, "INR");
    
    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${encodedCredentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency: "INR",
        receipt: `order-${Date.now()}`,
        notes: {
          customerName,
          customerEmail,
          customerPhone,
        },
      }),
    });

    console.log("[create-order] Razorpay API response status:", razorpayResponse.status);

    if (!razorpayResponse.ok) {
      let errorMessage = "Unknown error";
      try {
        const errorData = await razorpayResponse.json();
        errorMessage = errorData.description || JSON.stringify(errorData);
      } catch (e) {
        const text = await razorpayResponse.text();
        errorMessage = text;
      }
      
      console.error("[create-order] Razorpay API error:", errorMessage);
      return new Response(
        JSON.stringify({
          error: `Razorpay order creation failed`,
          details: errorMessage,
          status: razorpayResponse.status
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const razorpayOrder = await razorpayResponse.json();

    console.log(`[create-order] ✅ Razorpay order created: ${razorpayOrder.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        razorpay_order_id: razorpayOrder.id,
        amount,
        key_id: razorpayKeyId,
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
    console.error("[create-order] ❌ Error:", error.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
