# Icon by Mitali - Complete Setup & Deployment Guide

## 🎯 Quick Overview

This guide covers all steps to get Icon by Mitali fully operational with:
- ✅ Supabase backend (database + auth + functions)
- ✅ Razorpay payment processing
- ✅ Admin dashboard with login
- ✅ Production-ready Vercel deployment

**Estimated Time:** 1-2 hours for complete setup

---

## 📋 Table of Contents

1. [Database Setup](#1-database-setup)
2. [Admin User Setup](#2-admin-user-setup)
3. [Edge Functions Deployment](#3-edge-functions-deployment)
4. [Razorpay Configuration](#4-razorpay-configuration)
5. [Testing](#5-testing)
6. [Vercel Deployment](#6-vercel-deployment)

---

## 1. Database Setup

### ✅ What This Does
Creates all required database tables, indexes, and security policies in Supabase.

### 📝 How to Do It

1. Open: https://supabase.com/dashboard/project/apmiabucenklyfaewoun
2. Go to: **SQL Editor** (left sidebar) → **New Query**
3. Open the file: `DATABASE_SETUP.sql` in your project root
4. Copy the entire content
5. Paste into Supabase SQL Editor
6. Click **Run** (Ctrl+Enter)
7. Wait for completion - should see "success" messages

### ✓ Verify Success
Run this query in SQL Editor:
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

You should see these tables:
- `blog_posts`
- `orders`
- `page_settings`
- `products`
- `user_profiles`

**Time to Complete:** 2-5 minutes

---

## 2. Admin User Setup

### ✅ What This Does
Creates login for `ddubey7112@gmail.com` with admin privileges.

### 📝 How to Do It

See detailed guide: `ADMIN_USER_SETUP.md`

**Quick Summary:**
1. In Supabase Dashboard → **Authentication** → **Users** → **Add User**
2. Email: `ddubey7112@gmail.com`
3. Generate password (will be emailed)
4. In SQL Editor, run:
```sql
INSERT INTO user_profiles (id, email, full_name, role, is_admin)
SELECT 
  id, 
  email,
  'Mitali Dhumal',
  'admin',
  true
FROM auth.users
WHERE email = 'ddubey7112@gmail.com'
ON CONFLICT (email) DO UPDATE
SET role = 'admin', is_admin = true;
```

### ✓ Test It
1. Go to http://localhost:5173
2. Click **LOGIN** button
3. Enter email and password
4. Should be redirected to admin dashboard

**Time to Complete:** 5-10 minutes

---

## 3. Edge Functions Deployment

### ✅ What This Does
Deploys 6 backend functions for payments and shipping to Supabase.

### 📝 How to Do It

See detailed guide: `EDGE_FUNCTIONS_DEPLOYMENT.md`

**Quick Steps:**

1. Install Supabase CLI:
```powershell
npm install -g supabase
```

2. Authenticate:
```powershell
supabase login
```

3. Add secrets in Supabase Dashboard → Settings → Functions → Secrets:
   - `RAZORPAY_KEY_ID` (get from Razorpay)
   - `RAZORPAY_KEY_SECRET` (get from Razorpay)
   - `RAZORPAY_WEBHOOK_SECRET` (get from Razorpay)
   - `SHIPROCKET_TOKEN` (get from Shiprocket)

4. Deploy functions:
```powershell
cd "c:\Users\dubey\OneDrive\Desktop\iconbymitalidhumal (1)"

supabase functions deploy razorpay-create-order --project-id apmiabucenklyfaewoun
supabase functions deploy razorpay-verify-payment --project-id apmiabucenklyfaewoun
supabase functions deploy razorpay-webhook --project-id apmiabucenklyfaewoun
supabase functions deploy shiprocket-create-order --project-id apmiabucenklyfaewoun
supabase functions deploy shiprocket-track --project-id apmiabucenklyfaewoun
supabase functions deploy get-shipment-details --project-id apmiabucenklyfaewoun
```

### ✓ Verify Success
Go to Supabase Dashboard → **Edge Functions**
All 6 functions should show as "Active"

**Time to Complete:** 15-20 minutes

---

## 4. Razorpay Configuration

### ✅ What This Does
Connects your Razorpay account for payment processing.

### 📝 How to Do It

See detailed guide: `RAZORPAY_SETUP.md`

**Quick Steps:**

1. Get Razorpay credentials:
   - Go to: https://dashboard.razorpay.com/
   - Settings → API Keys
   - Copy: **Key ID** and **Key Secret**

2. Update `.env.local`:
```
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
```

3. Add to Supabase Secrets:
   - `RAZORPAY_KEY_ID`: Your Key ID
   - `RAZORPAY_KEY_SECRET`: Your Key Secret

4. Create Razorpay webhook:
   - In Razorpay: Settings → Webhooks → Create Webhook
   - URL: `https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-webhook`
   - Events: payment.authorized, payment.failed, refund.created
   - Copy Webhook Secret
   - Add to Supabase Secrets as `RAZORPAY_WEBHOOK_SECRET`

### ✓ Test It
Use test card: `4111 1111 1111 1111`

**Time to Complete:** 10-15 minutes

---

## 5. Testing

### ✅ Complete Payment Flow Test

1. Start dev server:
```powershell
npm run dev
```

2. Go to http://localhost:5173

3. Test shopping flow:
   - Browse **Shop** page
   - Add product to cart
   - Go to **Cart**
   - Click **Checkout**

4. Enter test payment details:
   - Card: `4111 1111 1111 1111`
   - Expiry: `12/25`
   - CVV: `123`
   - Click **Pay**

5. Verify order in database:
   - Supabase Dashboard → Database → orders table
   - New order should appear with status "completed"

6. Test admin features:
   - Go to http://localhost:5173/admin
   - Should see order in "Orders" tab
   - Try editing product in "Products" tab

**Time to Complete:** 10-15 minutes

---

## 6. Vercel Deployment

### ✅ What This Does
Deploys your website to production on Vercel.

### 📝 How to Do It

1. **Push to GitHub:**
```powershell
git add .
git commit -m "Complete Supabase setup and auth implementation"
git push origin main
```

2. **Import in Vercel:**
   - Go to: https://vercel.com
   - Click **Add New** → **Project**
   - Import your GitHub repo
   - Click **Import**

3. **Configure Environment Variables:**
   - In Vercel Project Settings → **Environment Variables**
   - Add:
     ```
     VITE_SUPABASE_URL=https://apmiabucenklyfaewoun.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXX (use LIVE key for production)
     VITE_API_BASE_URL=https://apmiabucenklyfaewoun.supabase.co/functions/v1
     ```

4. **Deploy:**
   - Vercel will automatically build and deploy
   - Get your live URL (e.g., `icon-by-mitali.vercel.app`)

5. **Configure Razorpay for Production:**
   - In Razorpay: Settings → Webhooks
   - Update webhook URL to: `https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-webhook`
   - Use **Live** keys in `.env` file and Supabase secrets

### ✓ Verify Production
- Go to your Vercel URL
- Test login and payment flow
- Check Razorpay Dashboard for live payments

**Time to Complete:** 10-15 minutes

---

## 📚 File Reference

| File | Purpose |
|------|---------|
| `DATABASE_SETUP.sql` | SQL script to create tables and policies |
| `ADMIN_USER_SETUP.md` | Detailed admin user creation guide |
| `EDGE_FUNCTIONS_DEPLOYMENT.md` | Detailed function deployment guide |
| `RAZORPAY_SETUP.md` | Razorpay configuration guide |
| `COMPLETE_SETUP_GUIDE.md` | Original setup documentation |
| `.env.local` | Local development environment variables |
| `.env.example` | Template for environment variables |

---

## 🔐 Security Checklist

Before going to production:

- [ ] Change admin password from initial generated one
- [ ] Enable 2FA on Supabase account
- [ ] Enable 2FA on Razorpay account
- [ ] Store secrets securely (never in code)
- [ ] Verify all RLS policies are correct
- [ ] Test with production Razorpay keys
- [ ] Review Edge Function logs for errors
- [ ] Set up database backups
- [ ] Test payment refund flow
- [ ] Monitor Vercel deployment logs

---

## 🆘 Troubleshooting

### Login not working
- Verify user in Supabase → Authentication → Users
- Check `is_admin` flag in user_profiles table
- Clear browser cache and try again

### Payments failing
- Check Razorpay credentials in Supabase Secrets
- Review Edge Function logs
- Verify webhook is configured in Razorpay

### Functions not deploying
- Run `supabase login` again
- Check project ID: `apmiabucenklyfaewoun`
- Verify you're in the correct project directory

### Database queries returning empty
- Verify tables exist (run verification query from Database Setup)
- Check RLS policies aren't blocking access
- Verify Supabase credentials in `.env.local`

---

## 📞 Support Resources

- Supabase Docs: https://supabase.com/docs
- Razorpay Docs: https://razorpay.com/docs
- Vercel Docs: https://vercel.com/docs
- React Query Docs: https://tanstack.com/query/latest
- Tailwind CSS: https://tailwindcss.com/docs

---

## ✅ Final Checklist

- [ ] Database tables created
- [ ] Admin user (ddubey7112@gmail.com) created and can login
- [ ] Edge Functions deployed (6/6)
- [ ] Razorpay credentials configured
- [ ] Payment flow tested with test card
- [ ] Admin dashboard accessible
- [ ] Vercel deployment complete
- [ ] Production URLs working
- [ ] RLS policies verified
- [ ] Security best practices implemented

---

## 🚀 Next Steps

1. **Immediate:** Complete all items in the checklist above
2. **Short-term:** Set up analytics, monitor errors, optimize performance
3. **Medium-term:** Add more admin features, improve UX, expand product catalog
4. **Long-term:** Scale infrastructure, add new features, expand payment options

---

**Last Updated:** May 24, 2026
**Status:** Complete Setup Ready for Production
