# Migration Guide: Base44 to Supabase

## Overview

This document outlines all changes made to migrate from Base44 to Supabase backend architecture.

## What Changed

### Removed
- ❌ `base44/` folder - Legacy Base44 functions
- ❌ `@base44/sdk` dependency
- ❌ `@base44/vite-plugin` dependency
- ❌ `src/api/base44Client.js` - No longer used

### Added
- ✅ `supabase/` folder - New Supabase Edge Functions
- ✅ `src/api/supabaseClient.js` - Supabase client initialization
- ✅ `SUPABASE_SETUP.md` - Database and function setup guide
- ✅ `VERCEL_DEPLOYMENT.md` - Deployment instructions
- ✅ `MIGRATION_GUIDE.md` - This file

### Updated
- 📝 `src/api/apiClient.js` - Now uses Supabase instead of base44
- 📝 `package.json` - Removed base44 dependencies
- 📝 `vite.config.js` - Removed base44 plugin configuration

## API Changes

### Products
```javascript
// Before (Base44)
const products = await base44.entities.Product.list();

// After (Supabase)
const products = await getProducts();
```

### Orders
```javascript
// Before (Base44)
const order = await base44.entities.Order.create(orderData);

// After (Supabase)
const order = await createOrder(orderData);

// Razorpay payment flow
const orderResponse = await createRazorpayOrder(amount);
const verified = await verifyRazorpayPayment(paymentData);
```

### Blog Posts
```javascript
// Before (Base44)
const posts = await base44.entities.BlogPost.filter({ published: true });

// After (Supabase)
const posts = await getBlogPosts();
```

### Tracking Orders
```javascript
// New functions for order tracking
const order = await getOrderDetails(orderId);
const tracking = await trackShipment(shipmentId);
```

## Environment Variables

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

## Database Entities

### Orders
- Stores customer orders
- Tracks payment status and shipment details
- Fields: customer info, items, total amount, Razorpay details, shipment tracking

### Products
- Product catalog
- Images, pricing, stock
- Show in lookbook flag

### Blog Posts
- Blog content
- Published/draft status
- Featured images

### Page Settings
- Page-specific configurations
- Dynamic content storage

## Edge Functions Deployed

| Function | Purpose | Endpoint |
|----------|---------|----------|
| razorpay-create-order | Create payment order | `/razorpay-create-order` |
| razorpay-verify-payment | Verify payment and create order | `/razorpay-verify-payment` |
| razorpay-webhook | Handle Razorpay webhooks | `/razorpay-webhook` |
| shiprocket-create-order | Create shipment | `/shiprocket-create-order` |
| shiprocket-track | Track shipment | `/shiprocket-track` |
| get-shipment-details | Get order/shipment details | `/get-shipment-details` |

## Security Changes

### Row Level Security (RLS)
- Products are readable by everyone
- Published blog posts are readable by everyone
- Users can only read their own orders (if authenticated)
- Service role used for admin operations

### API Key Management
- Anon key for client-side operations
- Service role key for Edge Functions only
- Keys are stored in Vercel environment variables

## Testing Checklist

- [ ] Run `npm install` to update dependencies
- [ ] Start dev server: `npm run dev`
- [ ] Test product listing page
- [ ] Test add to cart and wishlist
- [ ] Test checkout flow (use Razorpay test mode)
- [ ] Test order tracking
- [ ] Test blog page
- [ ] Verify no console errors

## Common Issues & Solutions

### Issue: "VITE_SUPABASE_URL is not defined"
**Solution**: Add environment variables to `.env.local`

### Issue: "Failed to fetch products"
**Solution**: Check Supabase RLS policies and ensure products table exists

### Issue: "Razorpay order creation failed"
**Solution**: Verify Razorpay credentials in Supabase secrets

### Issue: "Shipment not created"
**Solution**: Ensure Shiprocket token is set in Supabase secrets

## Next Steps After Migration

1. **Data Migration** (if needed)
   - Export data from base44
   - Import into Supabase tables

2. **Testing**
   - Full end-to-end testing on staging
   - Test with real payment flow

3. **Monitoring**
   - Set up error tracking
   - Monitor Edge Function performance
   - Set up database backups

4. **Deployment**
   - Deploy to Vercel
   - Configure custom domain
   - Set up CI/CD

## Rollback Plan

If issues occur:

1. Keep base44 folder as backup (can be deleted after verification)
2. Maintain git history for easy reversion
3. Have database backups in Supabase

## Support References

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Vercel Deployment](https://vercel.com/docs)
- [Razorpay Integration](https://razorpay.com/docs/)
- [Shiprocket API](https://apidocs.shiprocket.in/)
