# Supabase Edge Functions Deployment Guide

## Overview

You have 6 Edge Functions that need to be deployed to Supabase:
1. **razorpay-create-order** - Create payment orders
2. **razorpay-verify-payment** - Verify payment signatures
3. **razorpay-webhook** - Handle Razorpay webhook events
4. **shiprocket-create-order** - Create shipments
5. **shiprocket-track** - Track shipments
6. **get-shipment-details** - Retrieve shipment/order details

## Prerequisites

### 1. Install Supabase CLI

Open terminal (PowerShell) and run:

```powershell
npm install -g supabase
```

Verify installation:
```powershell
supabase --version
```

### 2. Get Your Supabase Credentials

- **Project ID**: `apmiabucenklyfaewoun`
- **Project URL**: `https://apmiabucenklyfaewoun.supabase.co`
- Go to: https://supabase.com/dashboard/project/apmiabucenklyfaewoun/settings/general

### 3. Authenticate with Supabase

```powershell
supabase login
```

This will:
1. Open a browser window asking for Supabase credentials
2. Log you in and generate an access token
3. Save the token locally

## Step 1: Set Up Secrets in Supabase

Before deploying, configure the environment variables (secrets) that Edge Functions need:

### 1.1 Go to Supabase Secrets

1. Open: https://supabase.com/dashboard/project/apmiabucenklyfaewoun/settings/functions
2. Scroll down to **Secrets**
3. Click **+ Add Secret**

### 1.2 Add Razorpay Secrets

| Secret Name | Value | Notes |
|---|---|---|
| `RAZORPAY_KEY_ID` | `rzp_test_XXXX...` or `rzp_live_XXXX...` | From Razorpay Dashboard → Settings → API Keys |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret key | **KEEP THIS SECRET!** |
| `RAZORPAY_WEBHOOK_SECRET` | Your webhook secret | From Razorpay → Settings → Webhooks |

### 1.3 Add Shiprocket Secrets

| Secret Name | Value | Notes |
|---|---|---|
| `SHIPROCKET_TOKEN` | Your Shiprocket API token | Get from Shiprocket account settings |

**To get these values:**
- **Razorpay**: Go to https://dashboard.razorpay.com/ → Settings → API Keys
- **Shiprocket**: Go to https://app.shiprocket.in/ → Settings → API Keys (if available) or contact support

## Step 2: Deploy Edge Functions

Navigate to your project directory in terminal:

```powershell
cd "c:\Users\dubey\OneDrive\Desktop\iconbymitalidhumal (1)"
```

### Deploy individual functions:

**Deploy Razorpay Functions:**
```powershell
supabase functions deploy razorpay-create-order --project-id apmiabucenklyfaewoun
supabase functions deploy razorpay-verify-payment --project-id apmiabucenklyfaewoun
supabase functions deploy razorpay-webhook --project-id apmiabucenklyfaewoun
```

**Deploy Shiprocket Functions:**
```powershell
supabase functions deploy shiprocket-create-order --project-id apmiabucenklyfaewoun
supabase functions deploy shiprocket-track --project-id apmiabucenklyfaewoun
supabase functions deploy get-shipment-details --project-id apmiabucenklyfaewoun
```

Each deployment should output:
```
✓ Function deployed successfully: razorpay-create-order
  Endpoint: https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-create-order
```

### Or deploy all at once:

```powershell
$functions = @(
  "razorpay-create-order",
  "razorpay-verify-payment", 
  "razorpay-webhook",
  "shiprocket-create-order",
  "shiprocket-track",
  "get-shipment-details"
)

foreach ($func in $functions) {
  supabase functions deploy $func --project-id apmiabucenklyfaewoun
}
```

## Step 3: Verify Deployment

### Check Deployed Functions in Dashboard

1. Go to: https://supabase.com/dashboard/project/apmiabucenklyfaewoun/functions
2. You should see all 6 functions listed
3. Each should show "Active" status

### Test a Function

```powershell
# Test razorpay-create-order
curl -X POST https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-create-order `
  -H "Content-Type: application/json" `
  -d '{"amount":50000}' `
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Replace `YOUR_ANON_KEY` with your Supabase Anon Key from `.env.local`

Expected response (if secrets are configured):
```json
{
  "order_id": "order_XXXXX",
  "currency": "INR",
  "key_id": "rzp_test_XXXXX"
}
```

## Step 4: Configure Razorpay Webhook

Now that the webhook function is deployed, add it to Razorpay:

1. Go to: https://dashboard.razorpay.com/ → Settings → Webhooks
2. Click **Create Webhook** (or edit existing)
3. Fill in:
   - **Webhook URL**: `https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-webhook`
   - **Events to Subscribe**: Select these:
     - ✓ payment.authorized
     - ✓ payment.failed
     - ✓ refund.created
4. Click **Create Webhook**
5. Copy the **Webhook Secret** and add to Supabase Secrets as `RAZORPAY_WEBHOOK_SECRET`

## Step 5: Test the Full Payment Flow

1. Go to http://localhost:5173 (your dev server)
2. Add a product to cart
3. Click Checkout
4. Use test card: `4111 1111 1111 1111` (Razorpay test card)
5. Complete payment
6. Check:
   - Razorpay Dashboard for payment status
   - Supabase → Database → orders table for new order record
   - Browser console for any errors

## Troubleshooting

### Functions not deploying

**Error: "Authentication failed"**
- Run `supabase logout` then `supabase login` again

**Error: "Project not found"**
- Verify project ID is correct: `apmiabucenklyfaewoun`
- Check your Supabase account access

**Error: "Function already exists"**
- Normal if redeploying. It will update the existing function.

### Functions deployed but not working

**Check Function Logs:**
1. Go to Supabase Dashboard → Edge Functions
2. Click on a function name to see logs
3. Look for error messages

**Common issues:**
- Missing secrets (verify in Settings → Functions → Secrets)
- Razorpay credentials wrong/expired
- API endpoint URLs incorrect in function code

### Payment verification fails

1. Verify `RAZORPAY_KEY_SECRET` in secrets matches Razorpay
2. Check Razorpay webhook configuration
3. Review function logs for signature verification errors

## Useful Commands

```powershell
# View all deployed functions
supabase functions list --project-id apmiabucenklyfaewoun

# View function code
supabase functions download razorpay-create-order --project-id apmiabucenklyfaewoun

# View function logs
supabase functions logs razorpay-create-order --project-id apmiabucenklyfaewoun --tail

# Redeploy (updates if exists)
supabase functions deploy razorpay-create-order --project-id apmiabucenklyfaewoun

# Delete a function (careful!)
supabase functions delete razorpay-create-order --project-id apmiabucenklyfaewoun
```

## Next Steps

- [ ] Install Supabase CLI
- [ ] Authenticate with Supabase
- [ ] Configure secrets
- [ ] Deploy all 6 functions
- [ ] Verify functions in dashboard
- [ ] Configure Razorpay webhook
- [ ] Test payment flow
- [ ] Deploy to Vercel

## Function Endpoints (After Deployment)

All functions are accessible at:
```
https://apmiabucenklyfaewoun.supabase.co/functions/v1/{function-name}
```

| Function | Method | Endpoint |
|---|---|---|
| Create Order | POST | `/razorpay-create-order` |
| Verify Payment | POST | `/razorpay-verify-payment` |
| Webhook Handler | POST | `/razorpay-webhook` |
| Create Shipment | POST | `/shiprocket-create-order` |
| Track Shipment | POST | `/shiprocket-track` |
| Get Shipment Details | POST | `/get-shipment-details` |

## Resources

- Supabase Edge Functions: https://supabase.com/docs/guides/functions
- Supabase CLI Docs: https://supabase.com/docs/reference/cli
- Razorpay Webhooks: https://razorpay.com/docs/webhooks/
- Shiprocket API: https://apidocs.shiprocket.in/
