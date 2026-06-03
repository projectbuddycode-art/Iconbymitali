import { createClient } from "https://esm.sh/@supabase/supabase-js@2.101.1";
import * as crypto from "https://deno.land/std@0.198.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
};

async function verifyWebhookSignature(
  signature: string,
  body: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(body));

  const hexSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hexSignature === signature;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("x-razorpay-signature") || "";
    const body = await req.text();
    const secret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET");

    if (!secret) {
      console.error("Webhook secret not configured");
      return new Response(JSON.stringify({ error: "Not configured" }), {
        status: 500,
        headers: corsHeaders,
      });
    }

    const isValid = await verifyWebhookSignature(signature, body, secret);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const event = JSON.parse(body);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle different webhook events
    switch (event.event) {
      case "payment.authorized":
        // Update order status
        if (event.payload?.payment?.entity?.notes?.order_id) {
          await supabase
            .from("orders")
            .update({ status: "payment_confirmed" })
            .eq("razorpay_order_id", event.payload.payment.entity.order_id);
        }
        break;

      case "payment.failed":
        if (event.payload?.payment?.entity?.notes?.order_id) {
          await supabase
            .from("orders")
            .update({ status: "payment_failed" })
            .eq("razorpay_order_id", event.payload.payment.entity.order_id);
        }
        break;

      case "refund.created":
        if (event.payload?.refund?.entity?.payment_id) {
          await supabase
            .from("orders")
            .update({
              status: "refund_initiated",
              refund_id: event.payload.refund.entity.id,
            })
            .eq("razorpay_payment_id", event.payload.refund.entity.payment_id);
        }
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
