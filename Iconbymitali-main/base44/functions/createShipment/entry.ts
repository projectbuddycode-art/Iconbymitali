import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  let body;
  try {
    body = await req.json();
  } catch (e) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { order_id } = body;
  if (!order_id) {
    return Response.json({ error: "order_id is required" }, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  // --- Step 1: Fetch Order from DB ---
  let order;
  try {
    order = await base44.asServiceRole.entities.Order.get(order_id);
  } catch (e) {
    console.error("[createShipment] Failed to fetch order:", e.message);
    return Response.json({ error: "Order not found: " + e.message }, { status: 404 });
  }

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  console.log("[createShipment] Processing order:", order.order_number, "id:", order.id);

  // --- Idempotency: skip if shipment already created ---
  const existingShipments = await base44.asServiceRole.entities.Shipment.filter({ order_id: order.id }).catch(() => []);
  if (existingShipments && existingShipments.length > 0) {
    console.log("[createShipment] Shipment already exists for order:", order.id, "— skipping.");
    return Response.json({
      success: true,
      message: "Shipment already created",
      shipment_id: existingShipments[0].id,
      awb_code: existingShipments[0].awb_code,
      courier_name: existingShipments[0].courier_name,
      tracking_url: existingShipments[0].tracking_url,
      invoice_url: existingShipments[0].invoice_url,
    });
  }

  // --- Step 2: Shiprocket Authentication ---
  const shiprocketEmail = Deno.env.get("SHIPROCKET_EMAIL");
  const shiprocketPassword = Deno.env.get("SHIPROCKET_PASSWORD");

  if (!shiprocketEmail || !shiprocketPassword) {
    return Response.json({ error: "Shiprocket credentials not configured" }, { status: 500 });
  }

  let shiprocketToken;
  try {
    const authRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: shiprocketEmail, password: shiprocketPassword }),
    });
    const authData = await authRes.json();
    if (!authData.token) throw new Error("No token returned: " + JSON.stringify(authData));
    shiprocketToken = authData.token;
    console.log("[createShipment] Shiprocket auth successful");
  } catch (e) {
    console.error("[createShipment] Shiprocket auth failed:", e.message);
    return Response.json({ error: "Shiprocket auth failed: " + e.message }, { status: 500 });
  }

  // --- Step 3: Create Shiprocket Order ---
  const addr = order.shipping_address || {};
  const pincode = String(addr.pincode || "").replace(/\D/g, "").slice(0, 6);
  const phone = String(order.customer_phone || "").replace(/\D/g, "").slice(0, 10);

  const orderItems = (order.items || []).map((item) => ({
    name: item.product_name || "Product",
    sku: item.product_id || "SKU001",
    units: item.quantity || 1,
    selling_price: item.price || 0,
  }));

  let srOrderId, shipmentId;
  try {
    const srRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${shiprocketToken}`,
      },
      body: JSON.stringify({
        order_id: order.order_number,
        order_date: new Date().toISOString().split("T")[0],
        pickup_location: "Primary",
        billing_customer_name: order.customer_name,
        billing_last_name: "",
        billing_address: addr.street || "",
        billing_city: addr.city || "",
        billing_pincode: pincode,
        billing_state: addr.state || "",
        billing_country: "India",
        billing_email: order.customer_email,
        billing_phone: phone,
        shipping_is_billing: true,
        order_items: orderItems,
        payment_method: "Prepaid",
        sub_total: order.total_amount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5,
      }),
    });
    const srData = await srRes.json();
    console.log("[createShipment] Shiprocket create order response:", JSON.stringify(srData));
    if (!srRes.ok) throw new Error(`HTTP ${srRes.status}: ${JSON.stringify(srData)}`);
    srOrderId = srData.order_id ? String(srData.order_id) : null;
    shipmentId = srData.shipment_id ? String(srData.shipment_id) : null;
    console.log("[createShipment] SR Order ID:", srOrderId, "Shipment ID:", shipmentId);
  } catch (e) {
    console.error("[createShipment] Shiprocket order creation failed:", e.message);
    return Response.json({ error: "Shiprocket order creation failed: " + e.message }, { status: 500 });
  }

  // --- Step 4: Assign AWB ---
  let awbCode = null;
  let courierName = null;

  if (shipmentId) {
    try {
      const awbRes = await fetch("https://apiv2.shiprocket.in/v1/external/courier/assign/awb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
        body: JSON.stringify({ shipment_id: shipmentId }),
      });
      const awbData = await awbRes.json();
      console.log("[createShipment] AWB response:", JSON.stringify(awbData));
      awbCode = awbData?.response?.data?.awb_code || null;
      courierName = awbData?.response?.data?.courier_name || null;
      console.log("[createShipment] AWB:", awbCode, "Courier:", courierName);
    } catch (e) {
      console.error("[createShipment] AWB assignment failed:", e.message);
    }
  }

  const trackingUrl = awbCode ? `https://shiprocket.co/tracking/${awbCode}` : null;

  // --- Step 5: Generate Invoice PDF ---
  let invoiceUrl = null;
  try {
    const doc = new jsPDF();
    const formatINR = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;
    const orderDate = order.created_date
      ? new Date(order.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    // Header bar
    doc.setFillColor(26, 42, 32);
    doc.rect(0, 0, 210, 38, "F");
    doc.setTextColor(178, 152, 93);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ICON by Mitali Dhumal", 14, 18);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(212, 196, 168);
    doc.text("Luxury Knitwear  |  Nasik, Maharashtra, India", 14, 26);
    doc.text("info@iconbymitalidhumal.com  |  +91 9021126552", 14, 33);

    // Invoice title + meta
    doc.setTextColor(26, 42, 32);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 14, 52);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    doc.text(`Order Number: ${order.order_number || "-"}`, 14, 60);
    doc.text(`Order Date: ${orderDate}`, 14, 66);

    // Customer Info (left column)
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 42, 32);
    doc.text("Bill To:", 14, 78);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(String(order.customer_name || ""), 14, 85);
    doc.text(String(order.customer_email || ""), 14, 91);
    if (order.customer_phone) doc.text(String(order.customer_phone), 14, 97);
    const addrLine = [addr.street, addr.city, addr.state, addr.pincode, "India"].filter(Boolean).join(", ");
    const addrLines = doc.splitTextToSize(addrLine, 88);
    doc.text(addrLines, 14, order.customer_phone ? 103 : 97);

    // Shipment Info box (right column)
    doc.setFillColor(249, 247, 244);
    doc.setDrawColor(219, 194, 166);
    doc.roundedRect(110, 74, 86, 46, 3, 3, "FD");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 42, 32);
    doc.text("Shipment Details", 116, 83);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`AWB: ${awbCode || "Pending"}`, 116, 91);
    doc.text(`Courier: ${courierName || "Pending"}`, 116, 98);
    if (trackingUrl) {
      doc.setTextColor(26, 42, 32);
      doc.textWithLink("Track your order \u2192", 116, 105, { url: trackingUrl });
      doc.setTextColor(60, 60, 60);
    }
    doc.text("Helpline: +91 9021126552", 116, 113);

    // Items table
    let y = 134;
    doc.setFillColor(26, 42, 32);
    doc.rect(14, y - 6, 182, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Item", 16, y);
    doc.text("Size", 108, y);
    doc.text("Qty", 132, y);
    doc.text("Unit Price", 152, y);
    doc.text("Total", 185, y, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    y += 10;

    (order.items || []).forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(249, 247, 244);
        doc.rect(14, y - 5, 182, 8, "F");
      }
      const itemName = String(item.product_name || "Product").slice(0, 38);
      doc.text(itemName, 16, y);
      doc.text(String(item.size || "-"), 108, y);
      doc.text(String(item.quantity || 1), 132, y);
      doc.text(formatINR(item.price), 152, y);
      doc.text(formatINR((item.price || 0) * (item.quantity || 1)), 196, y, { align: "right" });
      y += 9;
    });

    // Total row
    doc.setDrawColor(219, 194, 166);
    doc.line(14, y + 2, 196, y + 2);
    y += 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(26, 42, 32);
    doc.text("Total Amount:", 138, y);
    doc.text(formatINR(order.total_amount), 196, y, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Payment Status: Paid (Prepaid)", 138, y + 7);

    // Footer
    const pageH = doc.internal.pageSize.height;
    doc.setFillColor(26, 42, 32);
    doc.rect(0, pageH - 18, 210, 18, "F");
    doc.setTextColor(178, 152, 93);
    doc.setFontSize(8);
    doc.text("Thank you for shopping with ICON by Mitali Dhumal", 105, pageH - 10, { align: "center" });
    doc.setTextColor(212, 196, 168);
    doc.text("For support: info@iconbymitalidhumal.com  |  +91 9021126552", 105, pageH - 4, { align: "center" });

    // Upload PDF — convert to Uint8Array for reliable Deno upload
    const pdfArrayBuffer = doc.output("arraybuffer");
    const pdfUint8 = new Uint8Array(pdfArrayBuffer);
    const pdfBlob = new Blob([pdfUint8], { type: "application/pdf" });

    const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: pdfBlob });
    invoiceUrl = uploadRes?.file_url || null;
    console.log("[createShipment] Invoice uploaded:", invoiceUrl);
  } catch (e) {
    console.error("[createShipment] Invoice generation failed:", e.message, e.stack);
    // Non-fatal — continue without invoice
  }

  // --- Step 6: Save Shipment record in DB ---
  let shipmentRecord;
  try {
    shipmentRecord = await base44.asServiceRole.entities.Shipment.create({
      order_id: order.id,
      order_number: order.order_number,
      shiprocket_order_id: srOrderId,
      awb_code: awbCode,
      courier_name: courierName,
      tracking_url: trackingUrl,
      invoice_url: invoiceUrl,
      shipment_status: "created",
    });
    console.log("[createShipment] Shipment record created:", shipmentRecord.id);
  } catch (e) {
    console.error("[createShipment] Failed to create Shipment record:", e.message);
    return Response.json({ error: "Shipment DB save failed: " + e.message }, { status: 500 });
  }

  // --- Step 7: Update Order with shipment info ---
  try {
    await base44.asServiceRole.entities.Order.update(order.id, {
      status: "shipped",
      shiprocket_awb: awbCode,
      shiprocket_order_id: srOrderId,
    });
    console.log("[createShipment] Order updated to status=shipped, AWB:", awbCode);
  } catch (e) {
    console.error("[createShipment] Failed to update order:", e.message);
  }

  // --- Step 8: Send confirmation email to customer ---
  if (order.customer_email) {
    try {
      const trackingSection = awbCode
        ? `<tr>
            <td style="padding:8px 0;color:#666;font-size:14px;width:40%;">AWB Number</td>
            <td style="padding:8px 0;font-size:14px;font-weight:600;color:#1a2a20;">${awbCode}</td>
           </tr>
           <tr>
            <td style="padding:8px 0;color:#666;font-size:14px;">Courier</td>
            <td style="padding:8px 0;font-size:14px;color:#1a2a20;">${courierName || "Assigned"}</td>
           </tr>
           <tr>
            <td style="padding:8px 0;color:#666;font-size:14px;">Track Order</td>
            <td style="padding:8px 0;"><a href="${trackingUrl}" style="color:#b2985d;font-weight:600;font-size:14px;">Click here to track \u2192</a></td>
           </tr>`
        : `<tr><td colspan="2" style="padding:8px 0;color:#666;font-size:14px;">Your shipment is being prepared. Tracking details will follow shortly.</td></tr>`;

      const itemsRows = (order.items || []).map((item) =>
        `<tr>
          <td style="padding:6px 0;font-size:13px;color:#333;">${String(item.product_name || "")}${item.size ? ` (${item.size})` : ""}</td>
          <td style="padding:6px 0;font-size:13px;color:#333;text-align:center;">\u00d7${item.quantity || 1}</td>
          <td style="padding:6px 0;font-size:13px;color:#1a2a20;text-align:right;">Rs.\u00a0${((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}</td>
        </tr>`
      ).join("");

      const invoiceBtn = invoiceUrl
        ? `<p style="text-align:center;margin:24px 0 0;">
            <a href="${invoiceUrl}" style="display:inline-block;background:#1a2a20;color:#b2985d;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:13px;letter-spacing:1px;font-family:Arial,sans-serif;">DOWNLOAD INVOICE</a>
           </p>`
        : "";

      const emailBody = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f1ec;font-family:Georgia,serif;">
  <div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

    <div style="background:#1a2a20;padding:32px;text-align:center;">
      <h1 style="color:#b2985d;font-size:24px;margin:0 0 4px;letter-spacing:2px;font-family:Georgia,serif;">ICON by Mitali Dhumal</h1>
      <p style="color:#d4c4a8;font-size:12px;margin:0;letter-spacing:2px;font-family:Arial,sans-serif;">LUXURY KNITWEAR</p>
    </div>

    <div style="padding:32px;">
      <h2 style="color:#1a2a20;font-size:20px;margin:0 0 8px;font-family:Georgia,serif;">Your order is on its way! &#127881;</h2>
      <p style="color:#555;font-size:14px;line-height:1.7;margin:0 0 24px;font-family:Arial,sans-serif;">
        Hi ${String(order.customer_name || "there")},<br/>
        Great news! Your order <strong>${order.order_number}</strong> has been confirmed and dispatched.
      </p>

      <div style="background:#f9f7f4;border-radius:8px;padding:20px;margin-bottom:24px;border:1px solid #e8ddd0;">
        <h3 style="color:#1a2a20;font-size:13px;margin:0 0 12px;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;">Shipment Details</h3>
        <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;">
          ${trackingSection}
        </table>
      </div>

      <div style="margin-bottom:24px;">
        <h3 style="color:#1a2a20;font-size:13px;margin:0 0 12px;letter-spacing:1px;text-transform:uppercase;font-family:Arial,sans-serif;">Order Summary</h3>
        <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;">
          <tr style="border-bottom:1px solid #e8ddd0;">
            <th style="text-align:left;padding:6px 0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Item</th>
            <th style="text-align:center;padding:6px 0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Qty</th>
            <th style="text-align:right;padding:6px 0;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:1px;">Amount</th>
          </tr>
          ${itemsRows}
          <tr style="border-top:2px solid #1a2a20;">
            <td colspan="2" style="padding:10px 0;font-size:14px;font-weight:bold;color:#1a2a20;">Total Paid</td>
            <td style="padding:10px 0;font-size:14px;font-weight:bold;color:#1a2a20;text-align:right;">Rs.\u00a0${Number(order.total_amount || 0).toLocaleString("en-IN")}</td>
          </tr>
        </table>
      </div>

      ${invoiceBtn}

      <div style="background:#f9f7f4;border-radius:8px;padding:16px;margin-top:24px;text-align:center;font-family:Arial,sans-serif;">
        <p style="color:#666;font-size:13px;margin:0 0 6px;">Need help? We're here for you.</p>
        <p style="margin:0;">
          <a href="mailto:info@iconbymitalidhumal.com" style="color:#b2985d;font-size:13px;text-decoration:none;">info@iconbymitalidhumal.com</a>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <a href="tel:+919021126552" style="color:#b2985d;font-size:13px;text-decoration:none;">+91 9021126552</a>
        </p>
      </div>
    </div>

    <div style="background:#1a2a20;padding:20px 32px;text-align:center;font-family:Arial,sans-serif;">
      <p style="color:#d4c4a8;font-size:11px;margin:0;">&copy; ${new Date().getFullYear()} ICON by Mitali Dhumal. All rights reserved.</p>
      <p style="color:#d4c4a8;font-size:11px;margin:4px 0 0;">Nasik, Maharashtra, India</p>
    </div>

  </div>
</body>
</html>`;

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.customer_email,
        subject: `Your ICON Order ${order.order_number} is Shipped! \uD83D\uDE9A`,
        body: emailBody,
      });
      console.log("[createShipment] Confirmation email sent to:", order.customer_email);
    } catch (e) {
      console.error("[createShipment] Email send failed:", e.message);
      // Non-fatal
    }
  }

  return Response.json({
    success: true,
    shipment_id: shipmentRecord.id,
    awb_code: awbCode,
    courier_name: courierName,
    tracking_url: trackingUrl,
    invoice_url: invoiceUrl,
  });
});