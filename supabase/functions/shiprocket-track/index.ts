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
    const { shipmentId } = await req.json();

    if (!shipmentId) {
      return new Response(
        JSON.stringify({ error: "Shipment ID is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const shiprocketToken = Deno.env.get("SHIPROCKET_TOKEN");
    if (!shiprocketToken) {
      return new Response(
        JSON.stringify({ error: "Shiprocket not configured" }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Get tracking details from Shiprocket
    const response = await fetch(
      `https://apiv2.shiprocket.in/v1/external/shipments/track?shipment_id=${shipmentId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${shiprocketToken}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Shiprocket tracking error:", data);
      return new Response(
        JSON.stringify({ error: data.message || "Failed to fetch tracking" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Update order status in database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (data.tracking_data) {
      const status = data.tracking_data.status || "in_transit";
      await supabase
        .from("orders")
        .update({
          status: status,
          tracking_details: data.tracking_data,
        })
        .eq("shipment_id", shipmentId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        tracking: data.tracking_data,
        shipment_status: data.tracking_data?.status,
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
