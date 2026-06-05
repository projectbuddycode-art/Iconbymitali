# Razorpay Payment Error - Complete Fix Guide

## The Issue

**Error Message:** `"Could not initiate payment: Invalid order response from payment gateway"`

This happens when the `razorpay-create-order` edge function in Supabase is not properly configured or deployed.

---

## What Changed in the Code

### Enhanced Debugging (Cart.jsx)

Added comprehensive console logging to help identify exactly where the payment flow fails:

```javascript
// Before payment initiation
console.log('💳 Calling razorpay-create-order with amount:', total);

// After getting response
console.log('💳 Razorpay function response:', res);
console.log('💳 Extracted order data:', rzpOrder);

// On success
console.log('✅ Order created successfully:', rzpOrder.order_id);

// On error
console.error('❌ Missing order_id in response:', rzpOrder);
```

This allows you to see exactly what response the edge function is returning.

---

## How to Fix the Issue

### Step 1: Open Browser Developer Console

1. Go to http://localhost:5173
2. Add a product to cart
3. Click "Proceed to Checkout"
4. Select "Razorpay" payment method
5. **Press F12** to open Developer Tools
6. Click the **Console** tab
7. Click "Pay Now"

### Step 2: Check the Logs

Look for logs starting with `💳` and `❌`. The output will tell you exactly what's wrong:

**If you see:**
```
❌ Missing order_id in response: { error: "Payment gateway not configured" }
```
→ **Razorpay credentials are not set in Supabase** (see Step 3 below)

**If you see:**
```
❌ Missing order_id in response: { error: "Failed to create payment order" }
```
→ **Razorpay API credentials are wrong** (see Step 3 below)

**If you see:**
```
💳 Extracted order data: { order_id: "order_2IHjWu...", amount: 50000, ... }
✅ Order created successfully: order_2IHjWu...
```
→ **Edge function is working!** Proceed to verify payment settings (see Step 4 below)

---

### Step 3: Configure Razorpay Credentials in Supabase

1. **Go to Razorpay Dashboard:** https://dashboard.razorpay.com/app/settings/api-keys

2. **Copy your API Keys:**
   - Key ID (starts with `rzp_test_` or `rzp_live_`)
   - Key Secret (long string)

3. **Go to Supabase Console:** https://app.supabase.com/project/apmiabucenklyfaewoun

4. **Add Secrets to Edge Functions:**
   - Click **Settings** (gear icon) in sidebar
   - Click **Edge Functions** section
   - Scroll to **Secrets**
   - Click **Create New Secret**
   - Name: `RAZORPAY_KEY_ID`, Value: (your key ID)
   - Click **Create New Secret** again
   - Name: `RAZORPAY_KEY_SECRET`, Value: (your key secret)

5. **Redeploy Edge Functions:**
   - Go to **Edge Functions** (still in settings)
   - For each function:
     - `razorpay-create-order` - Click and hit "Redeploy"
     - `razorpay-verify-payment` - Click and hit "Redeploy"
   - Wait for deployment to complete (check status indicator)

6. **Test Again:**
   - Go back to http://localhost:5173
   - Add product to cart
   - Try checkout with Razorpay again
   - Check browser console for success logs

---

### Step 4: Verify Edge Functions are Deployed

1. Go to Supabase: https://app.supabase.com/project/apmiabucenklyfaewoun
2. Click **Edge Functions** in left sidebar
3. Check that these two functions exist:
   - ✅ `razorpay-create-order`
   - ✅ `razorpay-verify-payment`

If they don't exist, deploy them:

**Using Supabase Dashboard:**
1. Click **Create Function**
2. Name: `razorpay-create-order`
3. Copy the code from: `supabase/functions/razorpay-create-order/index.ts`
4. Deploy and repeat for `razorpay-verify-payment`

**Using CLI:**
```bash
supabase functions deploy razorpay-create-order
supabase functions deploy razorpay-verify-payment
```

---

## Testing Checklist

- [ ] Console shows `💳 Calling razorpay-create-order with amount: XXXX`
- [ ] Console shows `💳 Razorpay function response: {...}`
- [ ] Console shows `✅ Order created successfully: order_xxx`
- [ ] Razorpay payment modal opens
- [ ] Can enter payment details
- [ ] Payment processes successfully
- [ ] After payment, see "Order Success" page

---

## Quick Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Payment gateway not configured" | Secrets not set | Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Supabase |
| "Failed to create payment order" | Wrong API credentials | Verify credentials at https://dashboard.razorpay.com |
| No console logs appear | Edge function not deployed | Deploy functions via Supabase Dashboard or CLI |
| "Order amount too low" | Total is less than ₹1 | Add more expensive products to cart |
| Razorpay modal won't open | Script loading issue | Check if browser allows third-party scripts |

---

## Console Log Legend

- 💳 = Payment gateway action
- ✅ = Success
- ❌ = Error/Missing data
- 🔐 = Payment verification
- ⚠️ = Warning
- 🔄 = Retry or fallback

Look for these in the Console tab (F12) to understand what's happening.

---

## Files Modified

- `src/pages/Cart.jsx` - Added detailed logging and better error handling

## Files Created

- `RAZORPAY_TROUBLESHOOTING.md` - Comprehensive debugging guide
- `DIAGNOSTIC_QUERIES.sql` - SQL queries to verify Supabase setup

---

## Next Steps

1. **Immediately:** Open http://localhost:5173 and try checkout (F12 console open)
2. **Check Console Logs:** Look for `💳` and `✅` logs to see current status
3. **Set Up Credentials:** If you see "not configured" error, follow Step 3 above
4. **Redeploy:** After adding secrets, redeploy edge functions in Supabase
5. **Test Again:** Try checkout flow again and verify success logs
6. **For Production:** Switch to `rzp_live_` credentials before deploying to production

---

## Need Help?

Check the detailed troubleshooting guide:
→ See `RAZORPAY_TROUBLESHOOTING.md` in the project root
