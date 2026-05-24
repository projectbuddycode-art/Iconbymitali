import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";
import * as crypto from "https://deno.land/std@0.198.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
};

async function verifyRazorpaySignature(
  keySecret: string,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): Promise<boolean> {
  const sigBody = `${razorpay_order_id}|${razorpay_payment_id}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(sigBody)
  );

  const hexSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hexSignature === razorpay_signature;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const result = {
    payment_verified: false,
    order_saved: false,
    order_number: null,
    order_db_id: null,
    error: null,
  };

  try {
    const body = await req.json();

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      result.error = "Missing payment fields";
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (
      !orderData?.customer_name ||
      !orderData?.customer_email ||
      !orderData?.items ||
      !orderData?.total_amount
    ) {
      result.error = "Missing order data fields";
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Verify Razorpay signature
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!keySecret) {
      result.error = "Razorpay secret not configured";
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const isSignatureValid = await verifyRazorpaySignature(
      keySecret,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      result.error = "Invalid payment signature";
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: corsHeaders,
      });
    }

    result.payment_verified = true;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate order number
    const orderNumber = `ORDER-${Date.now()}`;

    // Create order in database
    const { data: createdOrder, error: dbError } = await supabase
      .from("orders")
      .insert([
        {
          order_number: orderNumber,
          customer_name: orderData.customer_name,
          customer_email: orderData.customer_email,
          customer_phone: orderData.customer_phone,
          shipping_address: orderData.shipping_address,
          items: orderData.items,
          total_amount: orderData.total_amount,
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: razorpay_payment_id,
          status: "payment_confirmed",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (dbError) {
      console.error("Database error:", dbError);
      result.error = "Failed to save order";
      return new Response(JSON.stringify(result), {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (createdOrder && createdOrder.length > 0) {
      result.order_saved = true;
      result.order_number = orderNumber;
      result.order_db_id = createdOrder[0].id;

      // Create shipment asynchronously
      createShipment(supabase, createdOrder[0].id, orderData);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error.message);
    result.error = error.message;
    return new Response(JSON.stringify(result), {
      status: 500,
      headers: corsHeaders,
    });
  }
});

async function createShipment(
  supabase: any,
  orderId: string,
  orderData: any
) {
  try {
    const shiprocketToken = Deno.env.get("SHIPROCKET_TOKEN");
    if (!shiprocketToken) {
      console.error("Shiprocket token not configured");
      return;
    }

    const shiprocketPayload = {
      order_id: orderId,
      order_date: new Date().toISOString(),
      pickup_location: "Primary",
      channel_id: "",
      comment: "Order from website",
      billing_customer_name: orderData.customer_name,
      billing_email: orderData.customer_email,
      billing_phone: orderData.customer_phone,
      shipping_is_billing: true,
      order_items: orderData.items.map((item: any) => ({
        name: item.name,
        sku: item.sku || item.id,
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: "Prepaid",
      shipping_charges: orderData.shipping_charges || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: orderData.discount || 0,
      sub_total: orderData.sub_total || orderData.total_amount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    const response = await fetch(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${shiprocketToken}`,
        },
        body: JSON.stringify(shiprocketPayload),
      }
    );

    const data = await response.json();
    if (response.ok && data.success) {
      // Update order with shipment details
      await supabase
        .from("orders")
        .update({
          shipment_id: data.shipment_id,
          status: "shipment_created",
        })
        .eq("id", orderId);
    } else {
      console.error("Shiprocket error:", data);
    }
  } catch (error) {
    console.error("Error creating shipment:", error.message);
  }
}
