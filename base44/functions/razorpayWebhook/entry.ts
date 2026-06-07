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
  const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("[webhook] RAZORPAY_WEBHOOK_SECRET not configured");
    return Response.json({ status: "error", message: "Webhook secret not configured" }, { status: 500 });
  }

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

  // Only process payment.authorized events (payment link flow)
  if (event.event !== "payment.authorized") {
    console.log("[webhook] Ignoring event:", event.event);
    return Response.json({ status: "ok", message: "Event ignored" });
  }

  // --- Step 3: Extract payment details ---
  const payment = event?.payload?.payment?.entity;
  const razorpayPaymentId = payment?.id;
  const razorpayOrderId = payment?.order_id;
  const customerEmail = payment?.email;
  const amountINR = payment?.amount ? payment.amount / 100 : null;
  const notes = payment?.notes || {};

  if (!razorpayPaymentId || !razorpayOrderId) {
    console.error("[webhook] Missing payment IDs:", { razorpayPaymentId, razorpayOrderId });
    return Response.json({ status: "error", message: "Missing payment IDs" }, { status: 400 });
  }

  console.log("[webhook] payment.authorized - Payment ID:", razorpayPaymentId, "Order ID:", razorpayOrderId, "Amount:", amountINR);

  const base44 = createClientFromRequest(req);

  // --- Step 4: Check if order already exists ---
  let existingOrders;
  try {
    existingOrders = await base44.asServiceRole.entities.Order.filter({
      razorpay_payment_id: razorpayPaymentId,
    });
  } catch (e) {
    console.error("[webhook] DB lookup failed:", e.message);
  }

  // Idempotency: if order already exists, skip
  if (existingOrders && existingOrders.length > 0) {
    const existingOrder = existingOrders[0];
    console.log("[webhook] Order already exists:", existingOrder.order_number, "- skipping duplicate webhook");
    return Response.json({ status: "ok", message: "Already processed" });
  }

  // --- Step 5: Create new order from payment data ---
  const orderNum = `ICON-${Date.now().toString().slice(-8)}`;
  
  // Extract order data from Razorpay metadata (stored by frontend in notes)
  const orderData = {
    customer_name: notes.customer_name || customerEmail?.split('@')[0] || 'Customer',
    customer_email: customerEmail || notes.customer_email || '',
    customer_phone: notes.customer_phone || '',
    items: notes.items || [],
    total_amount: amountINR || 0,
    shipping_address: notes.shipping_address || {},
    notes: [
      notes.order_notes,
      `Razorpay Payment ID: ${razorpayPaymentId}`,
      `Razorpay Order ID: ${razorpayOrderId}`,
    ]
      .filter(Boolean)
      .join(' | '),
  };

  try {
    const createdOrder = await base44.asServiceRole.entities.Order.create({
      order_number: orderNum,
      ...orderData,
      status: "confirmed",
      payment_status: "paid",
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
    });

    console.log("[webhook] Order created:", orderNum, "DB ID:", createdOrder.id);

    // --- Step 6: Trigger shipment creation ---
    base44.asServiceRole.functions
      .invoke("createShipment", { order_id: createdOrder.id })
      .then(() => console.log("[webhook] createShipment triggered for order:", createdOrder.id))
      .catch((e) => console.error("[webhook] createShipment failed:", e.message));

    return Response.json({ status: "ok", message: "Order created and confirmed", order_id: createdOrder.id, order_number: orderNum });
  } catch (e) {
    console.error("[webhook] Order creation failed:", e.message);
    return Response.json({ status: "error", message: "Order creation failed: " + e.message }, { status: 500 });
  }
});