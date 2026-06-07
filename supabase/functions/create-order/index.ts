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

    // Validate inputs
    if (!amount || !customerName || !customerEmail || !customerPhone) {
      throw new Error("Missing required fields: amount, customerName, customerEmail, customerPhone");
    }

    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("[create-order] Missing Razorpay credentials");
      throw new Error("Razorpay configuration missing");
    }

    // Encode credentials for Basic auth
    const credentials = `${razorpayKeyId}:${razorpayKeySecret}`;
    const encodedCredentials = encodeBase64(credentials);

    // Create Razorpay order
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

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      console.error("[create-order] Razorpay API error:", errorData);
      throw new Error(`Razorpay order creation failed: ${errorData.description || "Unknown error"}`);
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
