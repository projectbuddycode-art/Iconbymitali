import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ── In-memory token cache ──────────────────────────────────────────────────
let cachedToken = null;
let tokenExpiresAt = 0;

// ── In-memory rate limiter (per IP) ───────────────────────────────────────
const rateLimitMap = new Map();
const RATE_LIMIT = 20;       // max requests
const RATE_WINDOW = 60_000;  // per 60 seconds

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

// ── Input sanitizer ────────────────────────────────────────────────────────
function sanitizeString(val) {
  if (typeof val !== "string") return val;
  return val.replace(/[<>"'`;]/g, "").trim().slice(0, 500);
}

function sanitizeObject(obj) {
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = sanitizeObject(v);
    }
    return out;
  }
  return typeof obj === "string" ? sanitizeString(obj) : obj;
}

// ── Standardized response helpers ─────────────────────────────────────────
const ok = (data, status = 200) =>
  Response.json({ success: true, message: "OK", data }, { status });

const fail = (message, status = 400) =>
  Response.json({ success: false, message }, { status });

// ── Required fields validation ─────────────────────────────────────────────
const REQUIRED = [
  "order_id", "order_date", "pickup_location",
  "billing_customer_name", "billing_address", "billing_city",
  "billing_pincode", "billing_state", "billing_country",
  "billing_email", "billing_phone",
  "order_items", "payment_method", "sub_total",
  "length", "breadth", "height", "weight"
];

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
    // Do NOT log credentials or the response body
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

    // Auth
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return fail("Unauthorized", 401);

    // Parse body
    let body;
    try {
      body = await req.json();
    } catch {
      return fail("Invalid JSON body");
    }

    // Validate required fields
    const missing = REQUIRED.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
    if (missing.length > 0) {
      return fail(`Missing required fields: ${missing.join(", ")}`);
    }

    // Validate types
    if (!Array.isArray(body.order_items) || body.order_items.length === 0) {
      return fail("order_items must be a non-empty array");
    }
    if (typeof body.sub_total !== "number" || body.sub_total <= 0) {
      return fail("sub_total must be a positive number");
    }

    // Sanitize
    const sanitized = sanitizeObject(body);
    console.log("[Shiprocket] Creating order:", sanitized.order_id);

    const token = await getToken();

    const srRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(sanitized),
    });

    const srData = await srRes.json();
    console.log("[Shiprocket] Create order response status:", srRes.status);

    if (!srRes.ok) {
      console.error("[Shiprocket] Create order failed, status:", srRes.status, "message:", srData.message);
      return fail(srData.message || "Failed to create Shiprocket order", srRes.status);
    }

    console.log("[Shiprocket] Order created — shipment_id:", srData.shipment_id, "awb:", srData.awb_code);

    return ok({
      shipment_id: srData.shipment_id,
      awb_code: srData.awb_code,
      order_id: srData.order_id,
      status: srData.status,
    });

  } catch (error) {
    console.error("[Shiprocket] Unexpected error:", error.message);
    return fail("An unexpected error occurred. Please try again.", 500);
  }
});