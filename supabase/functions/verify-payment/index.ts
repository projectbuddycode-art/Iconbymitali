import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      products,
    } = await req.json();

    // Validate inputs
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment verification details");
    }

    if (!razorpayKeySecret) {
      console.error("[verify-payment] RAZORPAY_KEY_SECRET not configured");
      throw new Error("Server configuration error");
    }

    // Verify Razorpay signature using HMAC-SHA256
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await generateHmacSignature(message, razorpayKeySecret);

    if (expectedSignature !== razorpay_signature) {
      console.error("[verify-payment] ❌ Signature verification failed");
      throw new Error("Payment verification failed - invalid signature");
    }

    console.log("[verify-payment] ✅ Signature verified");

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Save order to database
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          shipping_address: shippingAddress || {},
          amount: amount || 0,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          payment_status: "paid",
          order_status: "confirmed",
          products: products || [],
        },
      ])
      .select();

    if (orderError) {
      console.error("[verify-payment] Database error:", orderError);
      throw new Error(`Failed to save order: ${orderError.message}`);
    }

    const savedOrder = orderData[0];
    console.log(`[verify-payment] ✅ Order saved: ${savedOrder.order_number}`);

    // Trigger email and shipment (fire and forget)
    triggerAsync([
      sendConfirmationEmail(savedOrder),
      createShipment(savedOrder),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: savedOrder.id,
        order_number: savedOrder.order_number,
        message: "Payment verified and order confirmed",
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
    console.error("[verify-payment] ❌ Error:", error.message);

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

// Helper: Generate HMAC-SHA256 signature
async function generateHmacSignature(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);

  const signature = await crypto.subtle.sign("HMAC", key, messageData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Helper: Async trigger without blocking response
function triggerAsync(promises: Promise<any>[]): void {
  Promise.all(promises)
    .then(() => console.log("[verify-payment] Async tasks completed"))
    .catch((error) => console.error("[verify-payment] Async task error:", error));
}

// Async: Send confirmation email
async function sendConfirmationEmail(order: any): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order }),
    });

    if (!response.ok) {
      console.warn("[verify-payment] Email send failed (non-blocking):", await response.text());
      return;
    }

    console.log("[verify-payment] ✅ Confirmation email triggered for", order.customer_email);
  } catch (error) {
    console.warn("[verify-payment] Email trigger error (non-blocking):", error.message);
  }
}

// Async: Create shipment
async function createShipment(order: any): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const response = await fetch(`${supabaseUrl}/functions/v1/create-shipment`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order }),
    });

    if (!response.ok) {
      console.warn("[verify-payment] Shipment creation failed (non-blocking):", await response.text());
      return;
    }

    console.log("[verify-payment] ✅ Shipment creation triggered for", order.order_number);
  } catch (error) {
    console.warn("[verify-payment] Shipment trigger error (non-blocking):", error.message);
  }
}
