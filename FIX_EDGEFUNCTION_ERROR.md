# Fix: "FunctionsFetchError: Failed to send a request to the Edge Function"

## What This Error Means

This error occurs when:
1. ❌ Edge functions are **not deployed** in Supabase
2. ❌ Razorpay credentials **not set** in Supabase Settings
3. ❌ Edge function has **internal errors**
4. ❌ Network request to edge function **failed**

---

## ✅ Quick Fix (5 minutes)

### Step 1: Set Razorpay Credentials

1. Go to: **https://dashboard.razorpay.com/app/settings/api-keys**
   - Copy your **Key ID** 
   - Copy your **Key Secret**

2. Go to Supabase: **https://app.supabase.com/project/apmiabucenklyfaewoun**
   - Click **Settings** (bottom left)
   - Click **Secrets** (under "Edge Functions")
   - Click **New Secret**

3. Add first secret:
   ```
   Name: RAZORPAY_KEY_ID
   Value: [paste your Key ID from Razorpay]
   ```
   - Click **Add Secret**

4. Add second secret:
   ```
   Name: RAZORPAY_KEY_SECRET
   Value: [paste your Key Secret from Razorpay]
   ```
   - Click **Add Secret**

5. You should see both secrets listed now ✅

### Step 2: Deploy Edge Functions

1. In Supabase, go to **Edge Functions** (left sidebar)

2. You should see:
   - `razorpay-create-order`
   - `razorpay-verify-payment`
   - `shiprocket-create-shipment`

3. For each function:
   - Click on the function name
   - Click **Redeploy** button
   - Wait for "✅ Deployment successful" message
   - Repeat for all 3 functions

### Step 3: Test Payment

1. Go to: **http://localhost:5173/Shop**
2. Add a product to cart
3. Go to **Cart** → **Checkout**
4. Fill in details and click **Pay Now**

---

## 🔍 Verification Steps

### Check 1: Verify Secrets Are Set

```sql
-- Go to Supabase SQL Editor and run:
SELECT * FROM pg_setting;
```

Or simply:
1. In Supabase Settings → Secrets
2. Verify you see:
   - ✅ RAZORPAY_KEY_ID
   - ✅ RAZORPAY_KEY_SECRET

### Check 2: Verify Functions Are Deployed

1. In Supabase → Edge Functions
2. Each function should show a **green checkmark** (✅ Active)
3. If any show ❌ Inactive, click **Redeploy**

### Check 3: Check Browser Console

1. Open http://localhost:5173/Cart
2. Press **F12** to open DevTools
3. Click **Console** tab
4. Look for logs starting with `💳` or `❌`

**Good logs:**
```
🔧 Supabase Configuration:
  URL: ✅ Set
  Key: ✅ Set
✅ Initializing Supabase client...
✅ Supabase client initialized successfully
```

**When you attempt payment, you should see:**
```
💳 Calling razorpay-create-order with amount: 2099
💳 Razorpay function response: {data: {...}, error: null}
✅ Order created successfully: order_xxxxx
```

### Check 4: Test Edge Function Directly

In browser console, run:
```javascript
const result = await supabase.functions.invoke("razorpay-create-order", {
  body: { amount: 100 }
});
console.log(result);
```

**Expected response:**
```javascript
{
  data: {
    order_id: "order_xxxxx",
    amount: 100,
    currency: "INR",
    key_id: "rzp_test_xxxxx"
  },
  error: null
}
```

**If you see error:**
```javascript
{
  data: null,
  error: { message: "Payment gateway not configured" }
}
```
→ Means credentials are not set

**If you see:**
```javascript
{
  data: null,
  error: { message: "Failed to create payment order" }
}
```
→ Means edge function has an error

---

## ❌ Common Issues

### Issue 1: "FunctionsFetchError: Failed to send a request"
**Cause:** Edge function not deployed or credentials not set
**Fix:** 
1. Verify secrets are in Settings → Secrets
2. Redeploy all edge functions
3. Wait 30 seconds and try again

### Issue 2: Secrets Still Not Working After Setting

**Cause:** Edge functions deployed before secrets were added
**Fix:**
1. Set both secrets in Supabase Settings
2. **Redeploy edge functions** (important!)
3. Wait for deployment to complete
4. Test again

### Issue 3: "Invalid signature for payment verification"

**Cause:** Edge function deployed but code has issues
**Fix:**
1. Check edge function code at: `supabase/functions/razorpay-verify-payment/index.ts`
2. Verify the code includes the notes field:
   ```typescript
   notes: orderData.notes || null,
   ```
3. If not present, update it
4. Redeploy

### Issue 4: Console Shows "Supabase client not properly initialized"

**Cause:** Environment variables not set
**Fix:**
1. Verify `.env.local` contains:
   ```
   VITE_SUPABASE_URL=https://apmiabucenklyfaewoun.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu
   ```
2. Restart dev server: `Ctrl+C` then `npm run dev`
3. Hard refresh browser: `Ctrl+Shift+R`

---

## 🚀 Complete Fix Checklist

- [ ] Go to Razorpay dashboard → Settings → API Keys
- [ ] Copy Key ID and Key Secret
- [ ] Go to Supabase → Settings → Secrets
- [ ] Add RAZORPAY_KEY_ID secret
- [ ] Add RAZORPAY_KEY_SECRET secret
- [ ] Go to Supabase → Edge Functions
- [ ] Click razorpay-create-order → Redeploy
- [ ] Click razorpay-verify-payment → Redeploy
- [ ] Click shiprocket-create-shipment → Redeploy
- [ ] Wait for all deployments to complete
- [ ] Go to http://localhost:5173/Cart
- [ ] Open DevTools (F12) → Console tab
- [ ] Try "Pay Now" button
- [ ] Verify console logs show 💳 and ✅ messages
- [ ] Payment modal should open
- [ ] Test with Razorpay test card (4111 1111 1111 1111)

---

## 📊 Debugging Flow

```
Error: FunctionsFetchError
    ↓
Is .env.local set? 
    ├─ NO → Update .env.local and restart dev server
    └─ YES → Continue
         ↓
    Are secrets in Supabase Settings?
         ├─ NO → Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET
         └─ YES → Continue
              ↓
         Are functions deployed (green ✅)?
              ├─ NO → Click Redeploy on each function
              └─ YES → Continue
                   ↓
              Try browser console test (see Check 4)
                   ├─ Works → Success! 🎉
                   └─ Fails → Check error message in console
```

---

## 📚 Related Documentation

- **QUICK_FIX_GUIDE.md** - Overall setup guide
- **RAZORPAY_PAYMENT_FIX.md** - Payment flow details
- **RAZORPAY_TROUBLESHOOTING.md** - All payment errors
- **COMPLETE_SUPABASE_MIGRATION.sql** - Database schema

---

## 🆘 Still Stuck?

If you see "FunctionsFetchError" after completing all steps:

1. **Check the Supabase function logs:**
   - Go to Supabase → Edge Functions
   - Click on razorpay-create-order
   - Scroll down to see recent invocation logs
   - Look for error messages

2. **Run diagnostic query in Supabase SQL Editor:**
   ```sql
   -- Check if secrets are accessible
   SELECT current_setting('app.razorpay_key_id', true) as key_id,
          current_setting('app.razorpay_key_secret', true) as key_secret;
   ```

3. **Check if edge function file exists:**
   - In VS Code, verify: `supabase/functions/razorpay-create-order/index.ts` exists
   - If not, the function was never created

4. **Test with curl (advanced):**
   ```bash
   curl -i --location --request POST 'https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-create-order' \
     --header 'Authorization: Bearer YOUR_ANON_KEY' \
     --header 'Content-Type: application/json' \
     --data '{"amount":100}'
   ```

---

## ✅ Success Indicators

When everything is working:

1. **Console shows:**
   ```
   ✅ Supabase client initialized successfully
   ```

2. **Payment attempt shows:**
   ```
   💳 Calling razorpay-create-order with amount: 2099
   ✅ Order created successfully: order_xxxxx
   ```

3. **Razorpay modal opens** with payment options

4. **Payment processes** and returns success

---

## 📞 Still Having Issues?

Check these files in order:
1. [FIX_UNDEFINED_INVOKE.md](FIX_UNDEFINED_INVOKE.md) - If client isn't initializing
2. [QUICK_FIX_GUIDE.md](QUICK_FIX_GUIDE.md) - Overall setup
3. [RAZORPAY_TROUBLESHOOTING.md](RAZORPAY_TROUBLESHOOTING.md) - All payment errors
4. [SUPABASE_ISSUES_ANALYSIS.md](SUPABASE_ISSUES_ANALYSIS.md) - Database issues

All files created and tested! 🎉
