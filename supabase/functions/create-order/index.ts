import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

serve(async (req) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { orderData } = await req.json();

    if (!orderData || !orderData.order_number) {
      return new Response(
        JSON.stringify({ error: "Missing required order data" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create order using service role (bypasses RLS)
    const { data, error } = await supabase
      .from("orders")
      .insert([orderData])
      .select();

    if (error) {
      console.error("Error creating order:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Order created:", data[0]?.id);

    return new Response(
      JSON.stringify({
        success: true,
        order: data[0],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
