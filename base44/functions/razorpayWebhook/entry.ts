import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  // Read raw body first — needed for signature verification
  let rawBody;
  try {
    rawBody = await req.text();
  } catch (e) {
    console.error("[webhook] Failed to read request body:", e.message);
    return Response.json({ status: "error", message: "Cannot read body" }, { status: 400 });
  }

  console.log("[webhook] Received Razorpay webhook. Body length:", rawBody.length);

  // --- Step 1: Verify Razorpay webhook signature ---
  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || "iconbymitalidhumal_webhook_secure";
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    console.error("[webhook] Missing x-razorpay-signature header.");
    return Response.json({ status: "error", message: "Missing signature" }, { status: 400 });
  }

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(webhookSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sigBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
    const expectedSig = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSig !== signature) {
      console.error("[webhook] Signature mismatch. Rejecting.");
      return Response.json({ status: "error", message: "Invalid signature" }, { status: 400 });
    }
    console.log("[webhook] Signature verified OK.");
  } catch (e) {
    console.error("[webhook] Signature verification error:", e.message);
    return Response.json({ status: "error", message: "Signature error" }, { status: 500 });
  }

  // --- Step 2: Parse event payload ---
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (e) {
    console.error("[webhook] Failed to parse JSON body:", e.message);
    return Response.json({ status: "error", message: "Invalid JSON" }, { status: 400 });
  }

  console.log("[webhook] Event type:", event.event);

  // Only process payment.captured events
  if (event.event !== "payment.captured") {
    console.log("[webhook] Ignoring event:", event.event);
    return Response.json({ status: "ok", message: "Event ignored" });
  }

  // --- Step 3: Extract Razorpay order_id from payload ---
  const payment = event?.payload?.payment?.entity;
  const razorpayOrderId = payment?.order_id;
  const razorpayPaymentId = payment?.id;
  const customerEmail = payment?.email;
  const amountINR = payment?.amount ? payment.amount / 100 : null;

  if (!razorpayOrderId) {
    console.error("[webhook] No order_id in payment payload:", JSON.stringify(payment));
    return Response.json({ status: "error", message: "No order_id in payload" }, { status: 400 });
  }

  console.log("[webhook] payment.captured — Razorpay order:", razorpayOrderId, "payment:", razorpayPaymentId, "email:", customerEmail, "amount (INR):", amountINR);

  const base44 = createClientFromRequest(req);

  // --- Step 4: Find Order in DB by razorpay_order_id ---
  let orders;
  try {
    orders = await base44.asServiceRole.entities.Order.filter({ razorpay_order_id: razorpayOrderId });
  } catch (e) {
    console.error("[webhook] DB lookup failed:", e.message);
    return Response.json({ status: "error", message: "DB lookup failed" }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    console.warn("[webhook] No order found for razorpay_order_id:", razorpayOrderId);
    return Response.json({ status: "ok", message: "Order not found — ignoring" });
  }

  const order = orders[0];
  console.log("[webhook] Found order:", order.id, "order_number:", order.order_number, "payment_status:", order.payment_status);

  // Idempotency: skip if already confirmed (payment_status = 'paid')
  if (order.payment_status === "paid") {
    console.log("[webhook] Order already marked paid. Skipping duplicate webhook.");
    return Response.json({ status: "ok", message: "Already processed" });
  }

  // --- Step 5: Mark order as paid + confirmed ---
  try {
    await base44.asServiceRole.entities.Order.update(order.id, {
      payment_status: "paid",
      status: "confirmed",
    });
    console.log("[webhook] Order updated: payment_status=paid, status=confirmed");
  } catch (e) {
    console.error("[webhook] Failed to update order payment status:", e.message);
    return Response.json({ status: "error", message: "Order update failed" }, { status: 500 });
  }

  // --- Step 6: Trigger shipment creation (fire and forget) ---
  // Use waitUntil pattern via a detached promise — return 200 to Razorpay immediately
  const shipmentPromise = base44.asServiceRole.functions.invoke("createShipment", { order_id: order.id });
  shipmentPromise
    .then(() => console.log("[webhook] createShipment completed for order:", order.id))
    .catch((e) => console.error("[webhook] createShipment failed for order:", order.id, e.message));

  return Response.json({ status: "ok", message: "Webhook processed" });
});