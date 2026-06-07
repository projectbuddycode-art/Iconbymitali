# Production Cleanup Checklist

## Duplicate Functions to Remove

The following functions are UNUSED duplicates and should be deleted from the repository to avoid confusion during deployment:

### 1. supabase/functions/razorpay-create-order/
- **Status**: UNUSED - The payment flow now uses create-payment-link directly
- **Action**: DELETE this entire directory
- **Reason**: Frontend no longer calls this; Razorpay link is generated server-side

### 2. supabase/functions/razorpay-verify-payment/
- **Status**: UNUSED - Old implementation for popup flow
- **Action**: DELETE this entire directory  
- **Reason**: Payment verification now happens in the webhook (base44/functions/razorpayWebhook/)

### 3. supabase/functions/razorpay-webhook/
- **Status**: UNUSED - Old stub implementation
- **Action**: DELETE this entire directory
- **Reason**: Active implementation is now at base44/functions/razorpayWebhook/entry.ts

## Active Functions (KEEP THESE)

✅ **supabase/functions/create-payment-link/** - ACTIVE (generates Razorpay payment links)
✅ **supabase/functions/create-order/** - ACTIVE (backend order creation via service role)
✅ **base44/functions/razorpayWebhook/** - ACTIVE (webhook signature verification + order creation)
✅ **base44/functions/razorpayVerifyPayment/** - For backward compatibility if needed
✅ **base44/functions/createShipment/** - ACTIVE (shipment creation + email)

## Removal Commands

To remove unused functions:

```bash
# From workspace root
rm -r supabase/functions/razorpay-create-order
rm -r supabase/functions/razorpay-verify-payment
rm -r supabase/functions/razorpay-webhook
git add .
git commit -m "Remove duplicate/unused Razorpay edge functions"
git push origin master
```

## Files to Update Before Deployment

After cleanup, verify these configuration files are up to date:

- [ ] `.env.production` - All required secrets listed
- [ ] `package.json` - All dependencies installed
- [ ] `vite.config.js` - Production build configured
- [ ] `supabase/config.toml` - Functions properly configured
- [ ] Edge Functions deployed to Supabase

## Supabase Console Configuration

Before deployment, set these secrets in Supabase Dashboard:

1. Go to: Project Settings → Secrets
2. Add each secret:

```
RAZORPAY_KEY_SECRET = [from Razorpay API Keys]
RAZORPAY_WEBHOOK_SECRET = [from Razorpay Webhooks]
SHIPROCKET_EMAIL = [your Shiprocket account email]
SHIPROCKET_PASSWORD = [your Shiprocket account password]
SUPABASE_SERVICE_ROLE_KEY = [from Project Settings → API Keys → Service Role]
```

## Payment Webhook Configuration

In Razorpay Dashboard:

1. Go to: Settings → Webhooks
2. Add new webhook:
   - URL: `https://yourdomain.com/functions/v1/razorpay-webhook`
   - Events: `payment.authorized`
   - Secret: Set a random string (this is RAZORPAY_WEBHOOK_SECRET)

3. Copy the secret and add to Supabase secrets

## Production Readiness Checklist

- [ ] All duplicate functions deleted
- [ ] All environment secrets configured in Supabase
- [ ] Razorpay webhook configured
- [ ] Webhook secret added to Supabase secrets
- [ ] Test payment flow completed successfully
- [ ] Order created with status "confirmed" after payment
- [ ] Shipment created automatically
- [ ] Confirmation email sent
- [ ] Build passes: `npm run build`
- [ ] All commits pushed to master branch
