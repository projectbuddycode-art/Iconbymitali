# Razorpay Payment Gateway - Troubleshooting Guide

## Error: "Could not initiate payment: Invalid order response from payment gateway"

This error occurs when the `razorpay-create-order` edge function is not returning the expected response. Here's how to diagnose and fix it.

---

## Root Cause Analysis

The error happens when:
1. **Edge function is not deployed** - The function doesn't exist in Supabase
2. **Environment variables missing** - `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are not set
3. **Invalid response format** - The function returns an error instead of the expected order data
4. **Network/CORS issues** - The function call is blocked or fails to complete

---

## Debugging Steps

### Step 1: Check Browser Console (F12)

Open Developer Tools (F12) and check the Console tab when you get the error. Look for logs starting with:
- `💳 Calling razorpay-create-order with amount: XXXX`
- `💳 Razorpay function response: {...}`
- `💳 Extracted order data: {...}`

**What to look for:**
```javascript
// SUCCESS looks like:
{ order_id: "order_2IHjWuZr...", amount: 50000, currency: "INR", key_id: "rzp_live_..." }

// ERROR looks like:
{ error: "Payment gateway not configured" }
// OR
{ error: "Failed to create payment order" }
// OR
{ error: "Invalid amount" }
```

---

### Step 2: Verify Edge Functions are Deployed

1. Go to **Supabase Dashboard** → https://app.supabase.com/project/apmiabucenklyfaewoun
2. Click **Edge Functions** in left sidebar
3. Check if these functions exist:
   - ✅ `razorpay-create-order`
   - ✅ `razorpay-verify-payment`

**If they don't exist:**

Deploy them using Supabase CLI:
```bash
# Install Supabase CLI (if not already done)
npm install -g supabase

# Authenticate
supabase login

# Deploy functions
supabase functions deploy razorpay-create-order
supabase functions deploy razorpay-verify-payment
```

Or deploy via Supabase Dashboard:
1. Click "Create Function" button
2. Name: `razorpay-create-order`
3. Copy contents from: `supabase/functions/razorpay-create-order/index.ts`
4. Deploy and repeat for `razorpay-verify-payment`

---

### Step 3: Check Environment Variables

1. Go to **Supabase Dashboard** → **Settings** → **Edge Functions**
2. Scroll to **Secrets** section
3. Verify these secrets are set:
   - ✅ `RAZORPAY_KEY_ID` = Your Razorpay Key ID
   - ✅ `RAZORPAY_KEY_SECRET` = Your Razorpay Key Secret

**If they're missing:**

1. Get your Razorpay credentials from: https://dashboard.razorpay.com/app/settings/api-keys
2. In Supabase Dashboard, go to Settings → Edge Functions
3. Add these secrets:
   ```
   RAZORPAY_KEY_ID = rzp_live_xxxxxxxxxx (or rzp_test_xxxxx for testing)
   RAZORPAY_KEY_SECRET = xxxxxxxxxxxxxx
   ```

---

### Step 4: Test the Function Directly

Use Supabase CLI to test the function:

```bash
# Test with amount 500 (₹5)
curl -X POST https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-create-order \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}'
```

Replace `YOUR_ANON_KEY` with your Supabase anonymous key (from Settings → API).

**Expected response:**
```json
{
  "order_id": "order_2IHjWuZr...",
  "amount": 50000,
  "currency": "INR",
  "key_id": "rzp_live_..."
}
```

**If you get an error:**
```json
{ "error": "Payment gateway not configured" }
```
→ Environment variables are not set

```json
{ "error": "Invalid amount" }
```
→ Amount is too small (minimum ₹1) or not a number

---

### Step 5: Check Razorpay Account

1. Verify your Razorpay account is **Live** (not Test mode)
   - Go to https://dashboard.razorpay.com
   - Check top-left corner for "Live" or "Test" mode
2. Verify your API keys are correct:
   - Key ID should start with `rzp_live_` (Live) or `rzp_test_` (Test)
   - Key Secret is available in Settings → API Keys

3. For **Live mode**, verify:
   - Account is activated and documents approved
   - No payment restrictions
   - At least ₹1 payment limit is set

---

## Common Error Messages & Fixes

### "Invalid order response from payment gateway"
**Problem:** Edge function returned `{ error: "..." }` instead of `{ order_id: "...", ... }`

**Solution:**
1. Check browser console for actual error message
2. Verify environment variables are set
3. Verify Razorpay account is active

### "Could not initiate payment: Failed to create payment order"
**Problem:** Razorpay API returned an error

**Possible causes:**
- Razorpay credentials are wrong
- Razorpay account is inactive
- Network issue with Razorpay API

**Solution:**
1. Go to Razorpay Dashboard and verify credentials
2. Try creating an order manually in Razorpay Dashboard
3. Check Razorpay API documentation: https://razorpay.com/docs/api/orders/create/

### "Could not initiate payment: Order amount too low"
**Problem:** Total amount is less than ₹1

**Solution:** Only pay for items with minimum ₹1 total

---

## Testing with Test Credentials

If you want to test with Razorpay Test mode:

1. Go to https://dashboard.razorpay.com/app/settings/api-keys
2. Click "Switch to Test Mode" (if available)
3. Copy Test Key ID and Test Key Secret
4. Update Supabase Edge Function secrets:
   ```
   RAZORPAY_KEY_ID = rzp_test_xxxxx
   RAZORPAY_KEY_SECRET = xxxxx
   ```
5. Use test card: `4111111111111111` (any future date, any CVV)

---

## Production Checklist

Before going live:

- [ ] Edge functions are deployed (`razorpay-create-order` and `razorpay-verify-payment`)
- [ ] Environment variables are set with **LIVE** credentials (not test)
- [ ] Razorpay account is in Live mode
- [ ] Razorpay API keys are correct
- [ ] Console logs show `✅ Order created successfully`
- [ ] Test payment flow works end-to-end
- [ ] Cart uses valid amounts (minimum ₹1)

---

## Monitoring

After deployment, check:

1. **Supabase Logs:**
   - Go to Supabase Dashboard → Edge Functions → Logs
   - Look for `razorpay-create-order` calls
   - Check if environment variables are accessible

2. **Razorpay Dashboard:**
   - Go to Razorpay Dashboard → Orders
   - Verify orders are being created
   - Check for any failed payment attempts

3. **Browser Console:**
   - Look for `💳` and `✅` logs
   - Should show successful order creation

---

## Contact Support

If issues persist:

1. **Supabase Support:** https://supabase.com/contact
2. **Razorpay Support:** https://support.razorpay.com
3. Check logs with full error message from browser console
