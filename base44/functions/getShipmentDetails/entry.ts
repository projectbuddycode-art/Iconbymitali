import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { order_number, email } = body;

  if (!order_number && !email) {
    return Response.json({ error: "Please provide an Order ID or Email" }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  // --- Find the Order ---
  let orders = [];
  try {
    if (order_number) {
      orders = await base44.asServiceRole.entities.Order.filter({ order_number: order_number.trim().toUpperCase() });
    }
    // If not found by order_number, try email
    if (orders.length === 0 && email) {
      orders = await base44.asServiceRole.entities.Order.filter({ customer_email: email.trim().toLowerCase() });
    }
  } catch (e) {
    console.error("[getShipmentDetails] DB lookup failed:", e.message);
    return Response.json({ error: "Failed to look up order" }, { status: 500 });
  }

  if (!orders || orders.length === 0) {
    return Response.json({ error: "No order found with the provided details. Please check your Order ID or email." }, { status: 404 });
  }

  // Use the most recent order if multiple found by email
  const order = orders.sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

  // --- Find associated Shipment ---
  let shipments = [];
  try {
    shipments = await base44.asServiceRole.entities.Shipment.filter({ order_id: order.id });
  } catch (e) {
    console.error("[getShipmentDetails] Shipment lookup failed:", e.message);
  }

  const shipment = shipments?.[0] || null;

  return Response.json({
    success: true,
    order: {
      order_number: order.order_number,
      status: order.status,
      payment_status: order.payment_status,
      total_amount: order.total_amount,
      created_date: order.created_date,
      items: order.items,
    },
    shipment: shipment ? {
      awb_code: shipment.awb_code,
      courier_name: shipment.courier_name,
      tracking_url: shipment.tracking_url,
      shipment_status: shipment.shipment_status,
    } : null,
    // Fallback: check Order entity directly if Shipment record not created yet
    awb_fallback: order.shiprocket_awb || null,
  });
});