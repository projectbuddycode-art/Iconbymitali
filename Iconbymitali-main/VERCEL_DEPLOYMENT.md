# Vercel Deployment Guide for Icon by Mitali

## Prerequisites

- Supabase project set up and configured
- Supabase Edge Functions deployed
- GitHub repository created
- Vercel account created

## Step-by-Step Deployment

### 1. Prepare the Repository

```bash
# Remove base44 folder (no longer needed)
rm -rf base44/

# Ensure supabase folder is included
# Commit all changes
git add .
git commit -m "Migrate from base44 to Supabase"
git push origin main
```

### 2. Connect Repository to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository with Icon by Mitali

### 3. Configure Environment Variables in Vercel

In Vercel project settings, add these environment variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_API_BASE_URL=https://your-project.supabase.co/functions/v1
```

### 4. Build Settings

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Deploy

Click "Deploy" button. Vercel will:
1. Install dependencies
2. Run build command
3. Deploy to Vercel CDN

### 6. Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration steps

## Post-Deployment Configuration

### Configure Razorpay Webhook

In Razorpay Dashboard:

1. Go to Settings → Webhooks
2. Add new webhook with URL:
   ```
   https://your-project.supabase.co/functions/v1/razorpay-webhook
   ```
3. Select events:
   - payment.authorized
   - payment.failed
   - refund.created

### Verify Deployment

1. Visit your Vercel deployment URL
2. Test product listing
3. Test add to cart
4. Test checkout flow (use test Razorpay credentials)
5. Verify order is created in Supabase

## Troubleshooting

### Build Fails
- Check Node version (should be 18+)
- Verify all dependencies in package.json
- Check console for specific errors

### Environment Variables Not Working
- Verify variables are in correct Vercel environment
- Check variable names match exactly
- Restart deployment after updating variables

### Edge Functions Not Working
- Verify Supabase Edge Functions are deployed
- Check function URLs in API client
- Verify CORS headers in functions

## CI/CD Pipeline

Vercel automatically deploys on:
- Push to main branch → Production
- Push to other branches → Preview deployments
- Pull requests → Preview deployments

## Monitoring

Use Vercel Analytics and Supabase:
- **Vercel**: Monitor build times, performance, errors
- **Supabase**: Monitor database, Edge Functions, storage usage

## Cost Optimization

- **Supabase**: Free tier includes 500MB database, 1GB bandwidth
- **Vercel**: Free tier includes 100GB bandwidth/month
- Monitor usage and upgrade as needed

## Next Steps

After successful deployment:

1. Set up error monitoring (Sentry, LogRocket)
2. Configure analytics (Vercel Analytics, Mixpanel)
3. Set up backups for Supabase
4. Monitor performance metrics
5. Plan scaling strategy
