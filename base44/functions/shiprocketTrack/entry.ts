import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ── In-memory token cache ──────────────────────────────────────────────────
let cachedToken = null;
let tokenExpiresAt = 0;

// ── In-memory rate limiter (per IP) ───────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT = 30;
const RATE_WINDOW = 60_000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, windowStart: now };
  if (now - entry.windowStart > RATE_WINDOW) {
    entry.count = 1;
    entry.windowStart = now;
  } else {
    entry.count += 1;
  }
  rateLimitMap.set(ip, entry);
  return entry.count > RATE_LIMIT;
}

// ── Standardized response helpers ─────────────────────────────────────────
const ok = (data) => Response.json({ success: true, message: "OK", data });
const fail = (message, status = 400) =>
  Response.json({ success: false, message }, { status });

// ── Token management ───────────────────────────────────────────────────────
async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) return cachedToken;

  console.log("[Shiprocket] Fetching new auth token");
  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: Deno.env.get("SHIPROCKET_EMAIL"),
      password: Deno.env.get("SHIPROCKET_PASSWORD"),
    }),
  });

  const data = await res.json();
  if (!data.token) {
    throw new Error("Shiprocket authentication failed: " + (data.message || "unknown error"));
  }

  cachedToken = data.token;
  tokenExpiresAt = now + 23 * 60 * 60 * 1000;
  console.log("[Shiprocket] Token refreshed, valid for 23h");
  return cachedToken;
}

// ── Handler ────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return fail("Too many requests. Please try again later.", 429);
    }

    // Parse body
    let body;
    try {
      body = await req.json();
    } catch {
      return fail("Invalid JSON body");
    }

    // Validate AWB
    const awb = typeof body.awb === "string" ? body.awb.replace(/[^a-zA-Z0-9\-]/g, "").trim() : "";
    if (!awb || awb.length < 5 || awb.length > 50) {
      return fail("A valid AWB number is required (5–50 alphanumeric characters)");
    }

    console.log("[Shiprocket] Tracking AWB:", awb);
    const token = await getToken();

    const trackRes = await fetch(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${encodeURIComponent(awb)}`,
      { headers: { "Authorization": `Bearer ${token}` } }
    );

    const trackData = await trackRes.json();
    console.log("[Shiprocket] Track response status:", trackRes.status);

    if (!trackRes.ok) {
      console.error("[Shiprocket] Track failed, status:", trackRes.status, "message:", trackData.message);
      return fail(trackData.message || "Failed to fetch tracking data", trackRes.status);
    }

    const shipmentTrack = trackData?.tracking_data?.shipment_track?.[0] || {};
    const activities = trackData?.tracking_data?.shipment_track_activities || [];

    console.log("[Shiprocket] Current status:", shipmentTrack.current_status);

    return ok({
      current_status: shipmentTrack.current_status,
      courier_name: shipmentTrack.courier_name,
      awb_code: shipmentTrack.awb_code,
      origin: shipmentTrack.origin,
      destination: shipmentTrack.destination,
      edd: shipmentTrack.edd,
      delivered_date: shipmentTrack.delivered_date,
      activities: activities.map((a) => ({
        activity: a.activity,
        location: a.location,
        date: a.date,
      })),
    });

  } catch (error) {
    console.error("[Shiprocket] Unexpected error:", error.message);
    return fail("An unexpected error occurred. Please try again.", 500);
  }
});