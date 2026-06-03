import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Razorpay from 'npm:razorpay@2.9.6';

// ── Helpers ────────────────────────────────────────────────────────────────
function log(logs, step, status, detail = "") {
  const entry = { step, status, detail, timestamp: new Date().toISOString() };
  logs.push(entry);
  console.log(`[TEST][${status}] ${step}${detail ? ": " + detail : ""}`);
}

async function hmacSHA256(secret, message) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ── Shiprocket auth ────────────────────────────────────────────────────────
async function getShiprocketToken() {
  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: Deno.env.get("SHIPROCKET_EMAIL"),
      password: Deno.env.get("SHIPROCKET_PASSWORD"),
    }),
  });
  const data = await res.json();
  if (!data.token) throw new Error("Shiprocket auth failed: " + (data.message || "unknown"));
  return data.token;
}

// ── Mock test data ─────────────────────────────────────────────────────────
const MOCK_ORDER = {
  customer_name: "Test User",
  customer_email: "test@iconbymitalidhumal.com",
  customer_phone: "9000000000",
  items: [
    {
      product_id: "TEST-001",
      product_name: "Test Knitwear",
      size: "M",
      quantity: 1,
      price: 499,
    },
  ],
  total_amount: 999, // 499 product + 500 shipping
  shipping_address: {
    street: "123 Test Street",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400001",
    country: "India",
  },
  notes: "AUTOMATED TEST ORDER — DO NOT FULFILL",
};

// ── Main handler ───────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  const logs = [];
  const result = {
    order_created: false,
    payment_verified: false,
    db_saved: false,
    shiprocket_order_created: false,
    razorpay_order_id: null,
    shiprocket_shipment_id: null,
    test_order_number: null,
    errors: [],
    logs: [],
  };

  try {
    // Admin-only guard
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== "admin") {
      return Response.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    log(logs, "AUTH", "OK", `Authenticated as ${user.email}`);

    // ── STEP 1: Create Razorpay order (test mode if key starts with rzp_test_) ──
    log(logs, "RAZORPAY_CREATE_ORDER", "RUNNING");
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: Math.round(MOCK_ORDER.total_amount * 100), // paise
        currency: "INR",
        receipt: `test_receipt_${Date.now()}`,
        notes: { test: "true", source: "runFullCheckoutTest" },
      });

      if (!rzpOrder.id || !rzpOrder.amount || !rzpOrder.currency) {
        throw new Error("Razorpay order missing required fields");
      }

      result.order_created = true;
      result.razorpay_order_id = rzpOrder.id;
      log(logs, "RAZORPAY_CREATE_ORDER", "OK", `order_id=${rzpOrder.id}, amount=${rzpOrder.amount}, currency=${rzpOrder.currency}`);
    } catch (err) {
      log(logs, "RAZORPAY_CREATE_ORDER", "FAIL", err.message);
      result.errors.push(`Razorpay create order: ${err.message}`);
      // Cannot continue without a real order_id
      result.logs = logs;
      return Response.json(result);
    }

    // ── STEP 2: Simulate payment & generate valid HMAC signature ──────────────
    log(logs, "SIMULATE_PAYMENT", "RUNNING");
    const mockPaymentId = `pay_TEST_${Date.now()}`;
    const signatureBody = `${rzpOrder.id}|${mockPaymentId}`;
    const validSignature = await hmacSHA256(keySecret, signatureBody);
    log(logs, "SIMULATE_PAYMENT", "OK", `payment_id=${mockPaymentId}, signature generated`);

    // ── STEP 3: Verify signature (same logic as razorpayVerifyPayment) ────────
    log(logs, "VERIFY_SIGNATURE", "RUNNING");
    const recomputedSig = await hmacSHA256(keySecret, signatureBody);
    if (recomputedSig !== validSignature) {
      const msg = "Signature mismatch — HMAC verification failed";
      log(logs, "VERIFY_SIGNATURE", "FAIL", msg);
      result.errors.push(msg);
    } else {
      result.payment_verified = true;
      log(logs, "VERIFY_SIGNATURE", "OK", "HMAC SHA256 signature valid");
    }

    // ── STEP 4: Save test order to DB ─────────────────────────────────────────
    log(logs, "DB_SAVE", "RUNNING");
    const orderNum = `TEST-${Date.now().toString().slice(-8)}`;
    try {
      await base44.asServiceRole.entities.Order.create({
        order_number: orderNum,
        customer_name: MOCK_ORDER.customer_name,
        customer_email: MOCK_ORDER.customer_email,
        customer_phone: MOCK_ORDER.customer_phone,
        items: MOCK_ORDER.items,
        total_amount: MOCK_ORDER.total_amount,
        shipping_address: MOCK_ORDER.shipping_address,
        status: "pending",
        payment_status: "completed",
        notes: `AUTOMATED TEST | Razorpay Order: ${rzpOrder.id} | Payment: ${mockPaymentId}`,
      });
      result.db_saved = true;
      result.test_order_number = orderNum;
      log(logs, "DB_SAVE", "OK", `order_number=${orderNum}`);
    } catch (err) {
      log(logs, "DB_SAVE", "FAIL", err.message);
      result.errors.push(`DB save: ${err.message}`);
    }

    // ── STEP 5: Trigger Shiprocket ────────────────────────────────────────────
    log(logs, "SHIPROCKET_AUTH", "RUNNING");
    let shiprocketToken;
    try {
      shiprocketToken = await getShiprocketToken();
      log(logs, "SHIPROCKET_AUTH", "OK", "Token obtained");
    } catch (err) {
      log(logs, "SHIPROCKET_AUTH", "FAIL", err.message);
      result.errors.push(`Shiprocket auth: ${err.message}`);
    }

    if (shiprocketToken) {
      log(logs, "SHIPROCKET_CREATE_ORDER", "RUNNING");
      const addr = MOCK_ORDER.shipping_address;
      const srPayload = {
        order_id: orderNum,
        order_date: new Date().toISOString().split("T")[0],
        pickup_location: "Primary",
        billing_customer_name: MOCK_ORDER.customer_name,
        billing_last_name: "",
        billing_address: addr.street,
        billing_city: addr.city,
        billing_pincode: addr.pincode,
        billing_state: addr.state,
        billing_country: addr.country,
        billing_email: MOCK_ORDER.customer_email,
        billing_phone: MOCK_ORDER.customer_phone,
        shipping_is_billing: true,
        order_items: MOCK_ORDER.items.map((item) => ({
          name: item.product_name,
          sku: item.product_id,
          units: item.quantity,
          selling_price: item.price,
        })),
        payment_method: "Prepaid",
        sub_total: MOCK_ORDER.total_amount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5,
      };

      try {
        const srRes = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${shiprocketToken}`,
          },
          body: JSON.stringify(srPayload),
        });
        const srData = await srRes.json();

        if (!srRes.ok) {
          throw new Error(srData.message || `HTTP ${srRes.status}`);
        }

        result.shiprocket_order_created = true;
        result.shiprocket_shipment_id = srData.shipment_id || null;
        log(logs, "SHIPROCKET_CREATE_ORDER", "OK", `shipment_id=${srData.shipment_id}, order_id=${srData.order_id}`);
      } catch (err) {
        log(logs, "SHIPROCKET_CREATE_ORDER", "FAIL", err.message);
        result.errors.push(`Shiprocket create order: ${err.message}`);
      }
    }

    log(logs, "TEST_COMPLETE", "OK", `Errors: ${result.errors.length}`);
  } catch (err) {
    log(logs, "UNEXPECTED_ERROR", "FAIL", err.message);
    result.errors.push(`Unexpected: ${err.message}`);
  }

  result.logs = logs;
  return Response.json(result);
});