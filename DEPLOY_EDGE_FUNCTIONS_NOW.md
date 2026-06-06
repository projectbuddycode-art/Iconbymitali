# 🔴 URGENT: Edge Functions Not Deployed - Fix Now!

## The Problem

Your payment is failing with **404 Not Found** because the edge functions aren't deployed yet.

```
❌ razorpay-create-order: NOT DEPLOYED (404)
❌ razorpay-verify-payment: NOT DEPLOYED
❌ Other functions: NOT DEPLOYED
```

---

## The Solution (3 Steps, 5 Minutes)

### Step 1: Open PowerShell in the project directory

```powershell
cd c:\Users\dubey\Downloads\Iconbymitali-main
```

### Step 2: Deploy the edge functions

```powershell
supabase functions deploy --no-verify
```

**If you get "supabase command not found"**, first install it:
```powershell
npm install -g supabase
```

Then run the deploy command again.

### Step 3: Wait for completion

You should see:
```
✓ Function "razorpay-create-order" deployed
✓ Function "razorpay-verify-payment" deployed
✓ Function "shiprocket-create-order" deployed
...
```

---

## Then Test the Payment

1. Go to: http://localhost:5173/Shop
2. Add a product to cart
3. Click "Proceed to Checkout"
4. Fill in details
5. Click "Pay Now"
6. **Payment modal should now open!** 🎉

---

## Troubleshooting

### "supabase: command not found"
→ Install: `npm install -g supabase`

### "Not authenticated"
→ Run: `supabase login`

### "Project not linked"
→ Run: `supabase link --project-ref apmiabucenklyfaewoun`

### Functions still show 404 after deploy
→ Wait 30 seconds, then hard refresh: `Ctrl+Shift+R`
→ If still broken, try: `supabase functions deploy razorpay-create-order --no-verify`

---

## Verification Checklist

- [ ] Run: `supabase functions deploy --no-verify`
- [ ] Wait for all deployments to complete
- [ ] See green ✅ checkmarks for each function
- [ ] Go to http://localhost:5173/Cart
- [ ] Try "Pay Now" button
- [ ] Check browser console (F12) for 💳 logs
- [ ] Payment modal should open
- [ ] Test with Razorpay test card

---

## DO THIS NOW:

```powershell
cd c:\Users\dubey\Downloads\Iconbymitali-main
supabase functions deploy --no-verify
```

Then test again! ✨
