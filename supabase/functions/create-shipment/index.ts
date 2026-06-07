import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

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
    const { order } = await req.json();

    if (!order) {
      throw new Error("Missing order data");
    }

    console.log(`[create-shipment] Processing shipment for order: ${order.order_number}`);

    const shiprocketEmail = Deno.env.get("SHIPROCKET_EMAIL");
    const shiprocketPassword = Deno.env.get("SHIPROCKET_PASSWORD");

    if (!shiprocketEmail || !shiprocketPassword) {
      console.warn("[create-shipment] Shiprocket credentials not configured - shipment creation skipped (non-blocking)");
      return new Response(
        JSON.stringify({
          success: true,
          message: "Shipment creation skipped - credentials not configured",
          order_id: order.id,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Step 1: Get Shiprocket auth token
    console.log("[create-shipment] Authenticating with Shiprocket...");
    const authResponse = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: shiprocketEmail,
        password: shiprocketPassword,
      }),
    });

    if (!authResponse.ok) {
      console.warn("[create-shipment] Shiprocket auth failed (non-blocking):", await authResponse.text());
      return new Response(
        JSON.stringify({
          success: true,
          message: "Shiprocket authentication failed (non-blocking)",
          order_id: order.id,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const authData = await authResponse.json();
    const token = authData.token;

    console.log("[create-shipment] ✅ Authenticated with Shiprocket");

    // Step 2: Create shipment
    const shipmentResponse = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: order.order_number,
        order_date: new Date(order.created_at).toISOString().split("T")[0],
        pickup_location: "Primary",
        channel_id: "3",
        comment: "",
        billing_customer_name: order.customer_name,
        billing_last_name: "",
        billing_address: order.shipping_address?.street || "N/A",
        billing_address_2: "",
        billing_city: order.shipping_address?.city || "N/A",
        billing_pincode: order.shipping_address?.zip || "000000",
        billing_state: order.shipping_address?.state || "N/A",
        billing_country: order.shipping_address?.country || "India",
        billing_email: order.customer_email,
        billing_phone: order.customer_phone,
        shipping_is_billing: true,
        order_items: (order.products || []).map((product: any) => ({
          name: product.name || "Product",
          sku: product.id || `SKU-${Date.now()}`,
          units: product.quantity || 1,
          selling_price: product.price || 0,
        })),
        payment_method: "Prepaid",
        shipping_charges: 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: 0,
        sub_total: order.amount || 0,
        length: 10,
        breadth: 10,
        height: 5,
        weight: 0.5,
      }),
    });

    if (!shipmentResponse.ok) {
      console.warn("[create-shipment] Shiprocket shipment creation failed (non-blocking):", await shipmentResponse.text());
      return new Response(
        JSON.stringify({
          success: true,
          message: "Shiprocket shipment creation failed (non-blocking)",
          order_id: order.id,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const shipmentData = await shipmentResponse.json();

    console.log("[create-shipment] ✅ Shipment created:", shipmentData.shipment_id);

    // Step 3: Update order with shipment details
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        shiprocket_order_id: shipmentData.shipment_id,
        order_status: "processing",
      })
      .eq("id", order.id);

    if (updateError) {
      console.warn("[create-shipment] Failed to update order with shipment ID (non-blocking):", updateError.message);
    } else {
      console.log("[create-shipment] ✅ Order updated with shipment ID");
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Shipment created successfully",
        shipment_id: shipmentData.shipment_id,
        order_id: order.id,
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
    console.error("[create-shipment] ❌ Error:", error.message);

    // Return success anyway since this is non-blocking
    return new Response(
      JSON.stringify({
        success: true,
        message: "Shipment creation attempted (may have failed)",
        error: error.message,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
