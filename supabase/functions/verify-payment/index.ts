import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Debug GET endpoint to check table
  if (req.method === "GET") {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/orders?select=count()&limit=1`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${supabaseServiceRoleKey}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.text();
      console.log("[verify-payment] DEBUG GET - Status:", response.status, "Data:", data);

      return new Response(
        JSON.stringify({ debug: true, status: response.status, data }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (e) {
      console.error("[verify-payment] DEBUG error:", e);
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
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

    console.log("[verify-payment] ✅ Received payment verification request", { razorpay_order_id });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new Error("Missing payment verification details");
    }

    if (!razorpayKeySecret) {
      throw new Error("Razorpay secret not configured");
    }

    // Parse amount
    const parsedAmount = typeof amount === "string" ? parseFloat(amount) : Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      throw new Error("Invalid amount");
    }

    // Verify signature
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await generateHmacSignature(message, razorpayKeySecret);

    if (expectedSignature !== razorpay_signature) {
      throw new Error("Signature verification failed");
    }

    console.log("[verify-payment] ✅ Signature verified successfully");

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Insert order using Supabase REST API
    console.log("[verify-payment] 📝 Inserting order into database...");

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceRoleKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        order_number: orderNumber,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        shipping_address: shippingAddress || {},
        amount: parsedAmount,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_status: "paid",
        order_status: "confirmed",
        products: products || [],
      }),
    });

    const responseText = await insertResponse.text();
    console.log("[verify-payment] Insert response - Status:", insertResponse.status, "Body:", responseText);

    if (!insertResponse.ok) {
      throw new Error(`Database insert failed: HTTP ${insertResponse.status}. ${responseText}`);
    }

    const insertedData = JSON.parse(responseText);
    const savedOrder = Array.isArray(insertedData) ? insertedData[0] : insertedData;

    console.log(`[verify-payment] ✅ Order saved successfully: ${orderNumber} (ID: ${savedOrder?.id})`);

    // Async tasks (non-blocking)
    Promise.all([
      sendConfirmationEmail(orderNumber, customerEmail),
      triggerShipment(orderNumber),
    ]).catch((err) => console.warn("[verify-payment] Async error (non-blocking):", err));

    return new Response(
      JSON.stringify({
        success: true,
        order_id: savedOrder?.id,
        order_number: orderNumber,
        message: "Order confirmed successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[verify-payment] ❌ Error:", errorMessage);

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Generate HMAC-SHA256 signature
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

// Send confirmation email
async function sendConfirmationEmail(orderNumber: string, email: string): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const response = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderNumber, email }),
    });

    console.log("[verify-payment] Email trigger response:", response.status);
  } catch (error) {
    console.warn("[verify-payment] Email error:", error instanceof Error ? error.message : String(error));
  }
}

// Trigger shipment creation
async function triggerShipment(orderNumber: string): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const response = await fetch(`${supabaseUrl}/functions/v1/create-shipment`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ orderNumber }),
    });

    console.log("[verify-payment] Shipment trigger response:", response.status);
  } catch (error) {
    console.warn("[verify-payment] Shipment error:", error instanceof Error ? error.message : String(error));
  }
}
