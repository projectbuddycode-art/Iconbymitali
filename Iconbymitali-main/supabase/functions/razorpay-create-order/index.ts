import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { amount } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Razorpay minimum is 100 paise (₹1)
    const amountInPaise = Math.round(amount * 100);
    if (amountInPaise < 100) {
      return new Response(
        JSON.stringify({
          error: "Order amount too low. Minimum is ₹1.",
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      console.error("Razorpay credentials missing");
      return new Response(
        JSON.stringify({
          error: "Payment gateway not configured",
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Create Razorpay order
    const razorpayResponse = await fetch(
      "https://api.razorpay.com/v1/orders",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            btoa(keyId + ":" + keySecret),
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      }
    );

    if (!razorpayResponse.ok) {
      const error = await razorpayResponse.text();
      console.error("Razorpay error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create payment order" }),
        { status: 500, headers: corsHeaders }
      );
    }

    const order = await razorpayResponse.json();

    console.log(
      "Razorpay order created:",
      order.id,
      "amount:",
      order.amount
    );

    return new Response(
      JSON.stringify({
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
