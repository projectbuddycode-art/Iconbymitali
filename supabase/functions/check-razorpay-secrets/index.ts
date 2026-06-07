import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");
    const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const diagnostics = {
      razorpay_key_id_set: !!keyId,
      razorpay_key_secret_set: !!keySecret,
      razorpay_webhook_secret_set: !!webhookSecret,
      supabase_service_role_set: !!serviceRole,
      timestamp: new Date().toISOString(),
      environment: Deno.env.get("DENO_ENV") || "production",
    };

    // Show partial values for debugging (first 10 chars + masked)
    if (keyId) diagnostics.razorpay_key_id_preview = keyId.substring(0, 10) + "...";
    if (keySecret) diagnostics.razorpay_key_secret_preview = keySecret.substring(0, 10) + "...";

    return new Response(JSON.stringify(diagnostics), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        type: "diagnostic_error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
