import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: "Order ID is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get order details
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return new Response(
        JSON.stringify({ error: "Order not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

    const shiprocketToken = Deno.env.get("SHIPROCKET_TOKEN");
    if (!shiprocketToken) {
      return new Response(
        JSON.stringify({ error: "Shiprocket not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Prepare Shiprocket payload
    const shiprocketPayload = {
      order_id: orderId,
      order_date: order.created_at,
      pickup_location: "Primary",
      channel_id: "",
      comment: "Order from website",
      billing_customer_name: order.customer_name,
      billing_email: order.customer_email,
      billing_phone: order.customer_phone,
      billing_address: order.billing_address || order.shipping_address,
      billing_city: order.shipping_address?.city || "",
      billing_state: order.shipping_address?.state || "",
      billing_country: order.shipping_address?.country || "India",
      billing_pincode: order.shipping_address?.pincode || "",
      shipping_is_billing: true,
      order_items: order.items.map((item: any) => ({
        name: item.name,
        sku: item.sku || item.id,
        units: item.quantity,
        selling_price: item.price,
      })),
      payment_method: "Prepaid",
      shipping_charges: order.shipping_charges || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: order.discount || 0,
      sub_total: order.sub_total || order.total_amount,
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    // Create shipment in Shiprocket
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

    if (!response.ok || !data.success) {
      console.error("Shiprocket error:", data);
      return new Response(JSON.stringify({ error: data.message || "Failed to create shipment" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Update order with shipment details
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        shipment_id: data.shipment_id,
        status: "shipment_created",
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        shipment_id: data.shipment_id,
        tracking_number: data.shipment_id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
