import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const { order } = await req.json();

    if (!order || !order.customer_email) {
      throw new Error("Missing order or customer email");
    }

    console.log(`[send-order-email] Sending confirmation email to ${order.customer_email}`);

    // Generate HTML email
    const emailHtml = generateOrderEmailHtml(order);

    // For production, integrate with:
    // - SendGrid: https://sendgrid.com
    // - Mailgun: https://mailgun.com
    // - AWS SES: https://aws.amazon.com/ses
    // - Resend: https://resend.com

    // Placeholder: Log the email that would be sent
    console.log("[send-order-email] Email ready for:", order.customer_email);
    console.log("[send-order-email] Subject: ICON by Mitali - Order Confirmation");

    // TODO: Integrate actual email service
    // Example with Resend:
    // const response = await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     from: 'orders@iconbymitalidhumal.com',
    //     to: order.customer_email,
    //     subject: 'Your ICON by Mitali Order Confirmation',
    //     html: emailHtml,
    //   }),
    // });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email queued for sending",
        email: order.customer_email,
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
    console.error("[send-order-email] ❌ Error:", error.message);

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

// Generate beautiful HTML email
function generateOrderEmailHtml(order: any): string {
  const productsHtml = (order.products || [])
    .map(
      (product: any) =>
        `<tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${product.name}</strong><br/>
            Size: ${product.size || "N/A"}<br/>
            Quantity: ${product.quantity || 1}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            ₹${(product.price || 0).toFixed(2)}
          </td>
        </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #414A37; color: white; padding: 20px; text-align: center; }
    .order-number { font-size: 24px; font-weight: bold; }
    .content { background: #f9f9f9; padding: 20px; margin: 20px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #414A37; color: white; padding: 10px; text-align: left; }
    .total-row { font-weight: bold; font-size: 16px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ICON by Mitali</h1>
      <div class="order-number">Order #${order.order_number}</div>
    </div>

    <div style="padding: 20px;">
      <h2>Thank you for your order, ${order.customer_name}!</h2>
      <p>We're excited to prepare your luxury knitwear for shipment.</p>

      <h3>Order Details</h3>
      <p>
        <strong>Order ID:</strong> ${order.order_number}<br/>
        <strong>Payment Status:</strong> ${order.payment_status || "Paid"}<br/>
        <strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}<br/>
      </p>

      <h3>Items Ordered</h3>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th style="text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
      </table>

      <h3 style="text-align: right; margin-top: 20px;">
        <span class="total-row">Total: ₹${order.amount ? order.amount.toFixed(2) : "0.00"}</span>
      </h3>

      <h3>Shipping Address</h3>
      <p>
        ${order.shipping_address?.street || ""}<br/>
        ${order.shipping_address?.city || ""}, ${order.shipping_address?.state || ""} ${order.shipping_address?.zip || ""}<br/>
        ${order.shipping_address?.country || "India"}
      </p>

      <h3>Contact Information</h3>
      <p>
        <strong>Phone:</strong> ${order.customer_phone}<br/>
        <strong>Email:</strong> ${order.customer_email}
      </p>

      <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4>📦 What's Next?</h4>
        <p>Your order will be processed and shipped within 2-3 business days. You'll receive a tracking number via email once it ships.</p>
      </div>
    </div>

    <div class="footer">
      <p>© 2026 ICON by Mitali Dhumal. All rights reserved.</p>
      <p>For support, contact: info@iconbymitalidhumal.com | +91 9021126552</p>
    </div>
  </div>
</body>
</html>
  `;
}
