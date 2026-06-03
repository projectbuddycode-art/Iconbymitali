# Razorpay Setup Guide

## Getting Your Razorpay Credentials

### 1. Create/Access Your Razorpay Account
- Go to: https://razorpay.com/
- Sign up or log in
- Verify your email and mobile

### 2. Get Your API Keys

**For Test Mode (Development):**

1. Go to Dashboard: https://dashboard.razorpay.com/
2. In the top right, select your account mode: **Test** (if not already selected)
3. Navigate to: **Settings** → **API Keys**
4. You'll see two keys:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (keep this secret!)

**For Live Mode (Production):**
1. Switch to **Live** mode
2. Same steps as test mode
3. Keys will start with `rzp_live_`

### 3. Create a Webhook (for payment notifications)

1. In Razorpay Dashboard, go to: **Settings** → **Webhooks**
2. Click **Create Webhook**
3. Fill in:
   - **Webhook URL**: `https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-webhook`
   - **Events to Listen**: Select these events:
     - `payment.authorized`
     - `payment.failed`
     - `refund.created`
4. Copy the **Webhook Secret** that's generated

### 4. Add Credentials to Your Project

**Step 4a: Update .env.local (for frontend development)**

```bash
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
```

Replace `XXXXXXXXXXXX` with your actual test Key ID.

**Step 4b: Add to Supabase Secrets (for Edge Functions)**

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/apmiabucenklyfaewoun
2. Go to: **Edge Functions** → **Secrets** (or **Settings** → **Secrets**)
3. Add these secrets:

| Secret Name | Value | Where to Get |
|---|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_XXXXXXXXXXXX` | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | (your secret key) | Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | (from webhook creation) | Razorpay Dashboard → Settings → Webhooks |

### 5. Test Payment Cards

Use these test cards in Razorpay's test mode:

| Card Type | Card Number | Expiry | CVV |
|---|---|---|---|
| Visa | 4111 1111 1111 1111 | 12/25 | 123 |
| Mastercard | 5555 5555 5555 4444 | 12/25 | 123 |
| Amex | 3782 822463 10005 | 12/25 | 1234 |

### 6. Testing Payment Flow

1. Go to your website: http://localhost:5173/Shop
2. Add product to cart
3. Click checkout
4. Enter test card details
5. Complete the payment
6. Check your Razorpay Dashboard for the payment status

### 7. Switching to Live Mode

When ready for production:

1. Go to Razorpay Live Keys page
2. Get your Live Key ID and Secret
3. Update `.env.local`:
   ```
   VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX
   ```
4. Update Supabase Secrets with Live keys
5. Redeploy Edge Functions
6. Deploy to Vercel with Live keys

## Troubleshooting

### Payment Creation Fails
- Check Edge Function logs in Supabase Dashboard
- Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set correctly
- Ensure Edge Functions are deployed

### Webhook Not Working
- Verify webhook URL in Razorpay Dashboard
- Check Supabase logs for webhook Edge Function
- Confirm webhook secret is correct

### Payment Verification Fails
- Check if signatures match (compare logs)
- Ensure `RAZORPAY_KEY_SECRET` is correctly set
- Verify order data in Supabase database

## Documentation

- Razorpay Dashboard: https://dashboard.razorpay.com/
- API Documentation: https://razorpay.com/docs/
- Webhook Events: https://razorpay.com/docs/webhooks/
- Test Cards: https://razorpay.com/docs/payments/payments/test-cards/
