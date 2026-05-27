# 🔐 YOUR DEPLOYMENT CREDENTIALS - KEEP SAFE

**Generated:** May 24, 2026
**Status:** Ready for Deployment

---

## 🔑 RAZORPAY CREDENTIALS (Live Mode)

| Item | Value |
|------|-------|
| Key ID | `rzp_live_St8qPORB5NlnAZ` |
| Key Secret | `G9NVKE7ZruJwXt5owpQ9qrPX` |
| Mode | LIVE (Production) |
| Status | ✅ Added to .env.local |
| Status | ⏳ Needs to be added to Supabase Secrets |

---

## 🏗️ SUPABASE PROJECT INFO

| Item | Value |
|------|-------|
| Project ID | `apmiabucenklyfaewoun` |
| Project URL | https://apmiabucenklyfaewoun.supabase.co |
| Dashboard | https://supabase.com/dashboard/project/apmiabucenklyfaewoun |
| Anon Key | eyJhbGc... (in .env.local) |

---

## 👤 ADMIN USERS

### Admin 1
| Item | Value |
|------|-------|
| Email | `ddubey7112@gmail.com` |
| Role | admin |
| Status | ✅ Active |
| Access Level | Full admin dashboard access |

### Admin 2 (Mitali)
| Item | Value |
|------|-------|
| Email | `iconbymd@gmail.com` |
| Password | `AsIconicasyou!` |
| Role | admin |
| Status | ⏳ Ready to add (see ADD_ADMIN_ICONBYMD.md) |
| Access Level | Full admin dashboard access |

---

## 🔄 DEPLOYMENT PROGRESS

### Completed ✅
- [x] Frontend code ready
- [x] Authentication system built
- [x] Edge Functions created
- [x] Environment variables configured
- [x] Razorpay credentials added to .env.local

### To Do ⏳
- [ ] Step 1: Create database tables
- [ ] Step 2: Create admin user
- [ ] Step 3: Add secrets to Supabase
- [ ] Step 4: Deploy Edge Functions
- [ ] Step 5: Configure webhook
- [ ] Step 6: Test everything

---

## 🚀 START HERE

**Next Action:** Open `SUPABASE_DEPLOYMENT_GUIDE.md` and follow **STEP 1** to create database tables.

**Time Estimate:** 60 minutes total for complete setup

---

## ⚠️ IMPORTANT NOTES

1. **Never share Key Secret in public** - Keep it private
2. **Razorpay is in LIVE mode** - Real payments will be charged
3. **All credentials are already in code** - No need to reconfigure
4. **Admin email receives password** - Check inbox after Step 2
5. **Edge Functions need Supabase CLI** - Install in Step 4

---

## 📋 SUPABASE SECRETS CHECKLIST

Add these 3 secrets to Supabase Settings → Secrets:

```
RAZORPAY_KEY_ID = rzp_live_St8qPORB5NlnAZ
RAZORPAY_KEY_SECRET = G9NVKE7ZruJwXt5owpQ9qrPX
RAZORPAY_WEBHOOK_SECRET = (will get from Razorpay webhook)
```

---

**Last Updated:** May 24, 2026
**Ready to Deploy:** YES ✅
