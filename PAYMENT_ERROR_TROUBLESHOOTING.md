# 🔧 Payment Error Troubleshooting - Edge Function 500 Error

## ❌ Problem
```
"Could not initiate payment: Edge Function returned a non-2xx status code"
```

This means the `create-payment-link` edge function is returning HTTP 500 (internal server error).

---

## ✅ Solution: Configure Razorpay Secrets in Supabase

### Step 1: Get Your Razorpay API Credentials

1. Go to: **Razorpay Dashboard** → **Settings** → **API Keys**
2. Copy:
   - **Key ID** (already have: `rzp_live_St8qPORB5NlnAZ`)
   - **Key Secret** (⚠️ Keep this SECRET - don't commit to Git)

### Step 2: Add Secrets to Supabase

1. Go to: **Supabase Dashboard** → **Project Settings** → **Secrets**
2. Click **Add Secret**
3. Add TWO secrets:

```
Name: RAZORPAY_KEY_ID
Value: rzp_live_St8qPORB5NlnAZ

Name: RAZORPAY_KEY_SECRET
Value: [your secret key from Razorpay]
```

4. Click **Save** for each

### Step 3: Redeploy Edge Function

Option A (via CLI):
```bash
cd c:\Users\dubey\Downloads\Iconbymitali-main
supabase functions deploy create-payment-link --project-id apmiabucenklyfaewoun
```

Option B (via Supabase Console):
1. Go to: **Functions** → **create-payment-link**
2. Click **Deploy** (forces function restart with new secrets)

### Step 4: Test Payment Flow

1. Refresh http://localhost:5173/Cart
2. Try checkout again
3. Should now work!

---

## 🔍 Verify Secrets Are Configured

To check if secrets are set correctly, look at Supabase function logs:

1. Go to: **Supabase Dashboard** → **Functions** → **create-payment-link**
2. Click **Logs** tab
3. If you see errors like:
   - `Cannot read property 'value' of undefined` → Secrets not set
   - `Unauthorized` → Wrong secret value

---

## 📋 Checklist Before Next Payment Test

- [ ] RAZORPAY_KEY_ID added to Supabase secrets
- [ ] RAZORPAY_KEY_SECRET added to Supabase secrets
- [ ] Function redeployed or Supabase refreshed
- [ ] Checked function logs for errors
- [ ] Test payment attempted in browser
- [ ] Payment URL loads successfully

---

## 🆘 If Still Getting 500 Error

Check Supabase function logs:

1. Go to: **Supabase Dashboard** → **Functions** → **create-payment-link**
2. Click **Logs** 
3. Look for error messages - common issues:
   - `RAZORPAY_KEY_ID is undefined` → Secret not saved
   - `Razorpay API error: Unauthorized` → Wrong secret key
   - `fetch error` → Network issue or API down
   - `JSON parse error` → Response format issue

Share the error from logs and I can help debug further.

---

## 🚨 Security Reminder

**NEVER**:
- Commit `RAZORPAY_KEY_SECRET` to Git
- Paste it in code comments
- Share it in Slack/email
- Use test keys in production

**ALWAYS**:
- Keep it in Supabase secrets only
- Use different keys for test vs production
- Rotate keys periodically
