# 🚀 SUPABASE COMPLETE SETUP - STEP BY STEP GUIDE

**Project Info:**
- Project ID: `apmiabucenklyfaewoun`
- Dashboard: https://supabase.com/dashboard/project/apmiabucenklyfaewoun
- Admin Email: ddubey7112@gmail.com

---

## ✅ STEP 1: CREATE DATABASE TABLES (5 minutes)

### What to do:
1. Open: https://supabase.com/dashboard/project/apmiabucenklyfaewoun
2. Click **SQL Editor** (left sidebar)
3. Click **New Query** button
4. **Copy the entire content from the file:** `DATABASE_SETUP.sql` in your project root
5. **Paste it** into the SQL Editor
6. Click **Run** button (or Ctrl+Enter)
7. Wait for "success" messages

### Expected Result:
✅ You should see "Query succeeded" messages
✅ All 5 tables will be created

### If it fails:
- Check for SQL syntax errors
- Ensure you're in the correct project
- Try running queries one at a time

---

## ✅ STEP 2: CREATE ADMIN USER (5 minutes)

### What to do:
1. In Supabase Dashboard, go to **Authentication** (left sidebar)
2. Click **Users** tab
3. Click **+ Add User** button (top right)
4. Fill in:
   - **Email:** `ddubey7112@gmail.com`
   - **Password:** ☑️ Check "Auto generate password"
5. Click **Save User**

### After user is created:
1. Go to **SQL Editor** → **New Query**
2. Copy and run this SQL:

```sql
INSERT INTO user_profiles (id, email, full_name, role, is_admin)
SELECT 
  id, 
  email,
  'Mitali Admin',
  'admin',
  true
FROM auth.users
WHERE email = 'ddubey7112@gmail.com'
ON CONFLICT (email) DO UPDATE
SET role = 'admin', is_admin = true;
```

3. Click **Run**

### Check if it worked:
Run this query:
```sql
SELECT email, role, is_admin FROM user_profiles WHERE email = 'ddubey7112@gmail.com';
```

Expected output:
```
ddubey7112@gmail.com | admin | true
```

---

## ✅ STEP 3: ADD RAZORPAY SECRETS (5 minutes)

### Razorpay Credentials You Provided:
- Key ID: `rzp_live_St8qPORB5NlnAZ` ✅
- Key Secret: `G9NVKE7ZruJwXt5owpQ9qrPX` ✅

### What to do:
1. In Supabase Dashboard, go to **Settings** (left sidebar bottom)
2. Click **Secrets**
3. Click **+ New Secret** button for each:

**Secret 1: Razorpay Key ID**
- Name: `RAZORPAY_KEY_ID`
- Value: `rzp_live_St8qPORB5NlnAZ`
- Click **Save**

**Secret 2: Razorpay Key Secret**
- Name: `RAZORPAY_KEY_SECRET`
- Value: `G9NVKE7ZruJwXt5owpQ9qrPX`
- Click **Save**

**Secret 3: Razorpay Webhook Secret**
- Name: `RAZORPAY_WEBHOOK_SECRET`
- Value: *(We'll get this after creating webhook)*
- For now, use: `webhook_secret_temp` (will update later)

**Secret 4: Shiprocket Token**
- Name: `SHIPROCKET_TOKEN`
- Value: *(Contact Shiprocket for this or skip for now)*

### Verify Success:
✅ You should see all 3-4 secrets listed in the Secrets section

---

## ✅ STEP 4: DEPLOY EDGE FUNCTIONS (20 minutes)

### What to do:

1. **Open PowerShell Terminal** on your computer

2. **Install Supabase CLI:**
```powershell
npm install -g supabase
```

3. **Login to Supabase:**
```powershell
supabase login
```
- This will open a browser window
- Login with your Supabase credentials
- A browser window will close automatically

4. **Navigate to your project directory:**
```powershell
cd "c:\Users\dubey\OneDrive\Desktop\iconbymitalidhumal (1)"
```

5. **Deploy the first function (Razorpay Create Order):**
```powershell
supabase functions deploy razorpay-create-order --project-id apmiabucenklyfaewoun
```

You should see output like:
```
✓ Function deployed successfully: razorpay-create-order
  Endpoint: https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-create-order
```

6. **Deploy all remaining functions:**
```powershell
supabase functions deploy razorpay-verify-payment --project-id apmiabucenklyfaewoun
supabase functions deploy razorpay-webhook --project-id apmiabucenklyfaewoun
supabase functions deploy shiprocket-create-order --project-id apmiabucenklyfaewoun
supabase functions deploy shiprocket-track --project-id apmiabucenklyfaewoun
supabase functions deploy get-shipment-details --project-id apmiabucenklyfaewoun
```

### Verify Deployment:
1. Go to Supabase Dashboard → **Edge Functions** (left sidebar)
2. You should see all 6 functions listed with "Active" status

---

## ✅ STEP 5: CONFIGURE RAZORPAY WEBHOOK (5 minutes)

### What to do:
1. Go to: https://dashboard.razorpay.com/
2. Login to your Razorpay account
3. Go to **Settings** → **Webhooks**
4. Click **+ Add New Webhook** (or Edit if exists)

5. Fill in:
   - **Webhook URL:** 
     ```
     https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-webhook
     ```
   - **Events to Subscribe:** Select these 3:
     - ✓ payment.authorized
     - ✓ payment.failed
     - ✓ refund.created
   - Click **Create** or **Update**

6. **Copy the Webhook Secret** that appears
   - It looks like: `whsec_xxxxxxxxxxxxx`

7. **Add to Supabase Secrets:**
   - Go back to Supabase Dashboard → Settings → Secrets
   - Click **+ New Secret**
   - Name: `RAZORPAY_WEBHOOK_SECRET`
   - Value: *(paste the webhook secret you copied)*
   - Click **Save**

---

## ✅ STEP 6: TEST EVERYTHING (10 minutes)

### Test Database Tables:
1. Supabase Dashboard → **Table Editor**
2. You should see all 5 tables:
   - orders
   - products
   - blog_posts
   - page_settings
   - user_profiles

### Test Admin Login:
1. Go to: http://localhost:5173
2. Click **LOGIN** button
3. Enter:
   - Email: `ddubey7112@gmail.com`
   - Password: *(Check your email for generated password, or set it manually)*
4. Should redirect to http://localhost:5173/admin
5. Should see Admin Dashboard with tabs

### Test Payment Function:
1. In PowerShell, run this test:
```powershell
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbWlhYnVjZW5rbHlmYWV3b3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjUyNDcsImV4cCI6MjA5NDg0MTI0N30.-wWKMrfGeMEz1jJFEaU59Y5kAG-ru-wqlTaFn8BtNK8"
}

$body = @{
    amount = 50000
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://apmiabucenklyfaewoun.supabase.co/functions/v1/razorpay-create-order" `
    -Method POST `
    -Headers $headers `
    -Body $body
```

Expected response (if secrets configured correctly):
```json
{
  "order_id": "order_XXXXX",
  "currency": "INR",
  "key_id": "rzp_live_St8qPORB5NlnAZ"
}
```

---

## 📋 COMPLETE SETUP CHECKLIST

- [ ] Step 1: Database tables created (SQL ran successfully)
- [ ] Step 2: Admin user created and has admin role
- [ ] Step 3: All 4 secrets added to Supabase
- [ ] Step 4: All 6 Edge Functions deployed (showing "Active")
- [ ] Step 5: Razorpay webhook configured
- [ ] Step 6: Admin can login
- [ ] Step 6: Payment function test returns order ID

---

## 🧪 FULL PAYMENT FLOW TEST

Once everything is deployed:

1. Go to: http://localhost:5173/Shop
2. Add a product to cart
3. Click Checkout
4. Use test Razorpay card:
   - Number: `4111 1111 1111 1111`
   - Expiry: `12/25`
   - CVV: `123`
5. Click Pay
6. After payment:
   - Check Razorpay Dashboard for payment status
   - Check Supabase → orders table for new order

---

## ⚠️ COMMON ISSUES & FIXES

### Issue: Functions won't deploy
**Fix:** Run `supabase login` again and ensure you're in the correct directory

### Issue: Payment function returns error 401
**Fix:** Check that all 3 secrets are added correctly in Supabase

### Issue: Admin login shows "Access Denied"
**Fix:** Verify `is_admin = true` in user_profiles table

### Issue: Can't find generated password
**Fix:** In Supabase → Users, click the user row, check email field or reset password

---

## 🎯 NEXT STEPS AFTER SETUP

1. **Test complete payment flow** with test card
2. **Create sample products** in Supabase database
3. **Deploy to Vercel** for production
4. **Switch to live Razorpay keys** (yours are already live!)
5. **Monitor Edge Function logs** for errors

---

## 📞 QUICK REFERENCE

**Supabase Dashboard:** https://supabase.com/dashboard/project/apmiabucenklyfaewoun
**Your Project ID:** apmiabucenklyfaewoun
**Admin Email:** ddubey7112@gmail.com
**Razorpay Key ID:** rzp_live_St8qPORB5NlnAZ
**Dev Server:** http://localhost:5173
**Login Page:** http://localhost:5173/login
**Admin Dashboard:** http://localhost:5173/admin

---

## 🚀 READY TO START?

**Begin with STEP 1** - Create database tables. This is the foundation for everything else!

Once you complete a step, let me know and I can help verify or move to the next step.
