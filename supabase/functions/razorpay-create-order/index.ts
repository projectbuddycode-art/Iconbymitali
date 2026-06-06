import Razorpay from 'npm:razorpay@2.9.6';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      console.error(
        `Razorpay credentials missing: KEY_ID=${!!keyId}, KEY_SECRET=${!!keySecret}`
      );

      return Response.json(
        { error: "Payment gateway not configured" },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }

    let amount;

    try {
      const body = await req.json();
      amount = body?.amount;
    } catch (e) {
      console.error("Invalid JSON body:", e);

      return Response.json(
        { error: "Invalid request body" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return Response.json(
        { error: "Invalid amount" },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const amountInPaise = Math.round(amount * 100);

    if (amountInPaise < 100) {
      return Response.json(
        { error: "Order amount too low. Minimum is ₹1." },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    console.log(
      "Razorpay order created:",
      order.id,
      "amount:",
      order.amount
    );

    return Response.json(
      {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: keyId,
      },
      {
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Razorpay order creation failed:", error);

    return Response.json(
      {
        error: error?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});