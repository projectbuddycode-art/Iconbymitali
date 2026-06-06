import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// This function is called from the frontend after the Razorpay checkout popup completes.
// It verifies the payment signature, creates the Order record, and returns confirmation.
// Shiprocket shipment creation is now handled by the razorpayWebhook backend function.

Deno.serve(async (req) => {
  const result = {
    payment_verified: false,
    order_saved: false,
    order_number: null,
    order_db_id: null,
    error: null,
  };

  let body;
  try {
    body = await req.json();
  } catch (e) {
    result.error = "Invalid request body";
    return Response.json(result, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    result.error = "Missing payment fields";
    return Response.json(result, { status: 400 });
  }

  if (!orderData?.customer_name || !orderData?.customer_email || !orderData?.items || !orderData?.total_amount) {
    result.error = "Missing order data fields";
    return Response.json(result, { status: 400 });
  }

  // --- Verify Razorpay HMAC SHA-256 signature ---
  const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
  if (!keySecret) {
    result.error = "Razorpay secret not configured";
    return Response.json(result, { status: 500 });
  }

  try {
    const sigBody = `${razorpay_order_id}|${razorpay_payment_id}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw", encoder.encode(keySecret),
      { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(sigBody));
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      result.error = "Invalid payment signature";
      return Response.json(result, { status: 400 });
    }
    result.payment_verified = true;
    console.log("[verifyPayment] Signature verified for payment:", razorpay_payment_id);
  } catch (e) {
    result.error = "Signature verification failed: " + e.message;
    return Response.json(result, { status: 500 });
  }

  // --- Save Order to DB ---
  const orderNum = `ICON-${Date.now().toString().slice(-8)}`;
  const combinedNotes = [
    orderData.notes,
    `Razorpay Payment ID: ${razorpay_payment_id}`,
    `Razorpay Order ID: ${razorpay_order_id}`,
  ].filter(Boolean).join(" | ");

  const base44 = createClientFromRequest(req);

  try {
    const createdOrder = await base44.asServiceRole.entities.Order.create({
      order_number: orderNum,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone || "",
      items: orderData.items,
      total_amount: orderData.total_amount,
      shipping_address: orderData.shipping_address || {},
      status: "confirmed",
      payment_status: "paid",
      razorpay_order_id: razorpay_order_id,
      notes: combinedNotes,
    });
    result.order_saved = true;
    result.order_number = orderNum;
    result.order_db_id = createdOrder.id;
    console.log("[verifyPayment] Order saved:", orderNum, "DB ID:", createdOrder.id);
  } catch (e) {
    result.error = "Order save failed: " + e.message;
    return Response.json(result, { status: 500 });
  }

  // Trigger shipment creation immediately (webhook is backup — idempotency in createShipment prevents duplicates)
  base44.asServiceRole.functions.invoke("createShipment", { order_id: result.order_db_id })
    .then(() => console.log("[verifyPayment] createShipment triggered for order:", result.order_db_id))
    .catch((e) => console.error("[verifyPayment] createShipment trigger failed:", e.message));

  return Response.json({ success: true, ...result });
});