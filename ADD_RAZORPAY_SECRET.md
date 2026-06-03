# Add Razorpay Live Credentials to Supabase

## ⚠️ IMPORTANT - DO THIS IMMEDIATELY

Your Razorpay live credentials need to be added to Supabase for the Edge Functions to work.

### Step 1: Go to Supabase Secrets
1. Open: https://supabase.com/dashboard/project/apmiabucenklyfaewoun/settings/functions
2. Scroll down to **Secrets** section
3. Click **New Secret**

### Step 2: Add RAZORPAY_KEY_SECRET

Add this secret:
- **Name**: `RAZORPAY_KEY_SECRET`
- **Value**: `G9NVKE7ZruJwXt5owpQ9qrPX`

Click **Save**

### Step 3: Redeploy Edge Functions (Important!)

After adding the secret, redeploy the Razorpay functions so they pick up the new secret:

```powershell
cd "c:\Users\dubey\OneDrive\Desktop\iconbymitalidhumal (1)"

# Add other secrets first
supabase functions deploy razorpay-create-order --project-id apmiabucenklyfaewoun
supabase functions deploy razorpay-verify-payment --project-id apmiabucenklyfaewoun
supabase functions deploy razorpay-webhook --project-id apmiabucenklyfaewoun
```

### Step 4: Update .env.local (Already Done ✅)
- `VITE_RAZORPAY_KEY_ID=rzp_live_St8qPORB5NlnAZ` ✅ DONE

---

## Testing Payments

After adding secrets to Supabase:

1. Start dev server: `npm run dev`
2. Go to: http://localhost:5173/Shop
3. Add product to cart
4. Go to Checkout
5. Use your Razorpay account's test/live cards
6. Verify payment in Razorpay Dashboard

---

**Status**: Frontend ready ✅ | Backend secrets needed ⏳
