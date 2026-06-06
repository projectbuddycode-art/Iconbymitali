import Razorpay from 'npm:razorpay@2.9.6';

const razorpay = new Razorpay({
  key_id: Deno.env.get("RAZORPAY_KEY_ID"),
  key_secret: Deno.env.get("RAZORPAY_KEY_SECRET"),
});

Deno.serve(async (req) => {
  try {
    const { amount } = await req.json();

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return Response.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Razorpay minimum is 100 paise (₹1)
    const amountInPaise = Math.round(amount * 100);
    if (amountInPaise < 100) {
      return Response.json({ error: "Order amount too low. Minimum is ₹1." }, { status: 400 });
    }

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      console.error("Razorpay credentials missing");
      return Response.json({ error: "Payment gateway not configured" }, { status: 500 });
    }

    // Razorpay amount is in paise (smallest currency unit)
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    console.log("Razorpay order created:", order.id, "amount:", order.amount);

    return Response.json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
    });
  } catch (error) {
    console.error("Razorpay order creation failed:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});