# ⚡ Quick Start - Database & Backend Setup

**Status**: Everything is configured and ready to execute!

---

## 📋 What's Been Set Up

✅ `.env.local` created with your Supabase credentials  
✅ `supabaseClient.js` configured with production settings  
✅ `supabaseAdmin.js` enhanced with collections CRUD + FK validation  
✅ `AuthContext.jsx` with token refresh + session persistence  
✅ All 4 admin components updated with collection FK + autosave  
✅ Database migration SQL ready: `MIGRATION_COLLECTION_FK.sql`

---

## 🚀 EXECUTE NOW (3 Steps)

### STEP 1: Run Database Migration (2 minutes)

**Option A: Manual (Recommended for first-time)**

1. Open: https://app.supabase.com
2. Login with your account
3. Click **"Icon by Mitali"** project (or find your project)
4. Left sidebar → Click **"SQL Editor"**
5. Click **"New Query"** (top right)
6. Open this file: `MIGRATION_COLLECTION_FK.sql`
7. Copy **entire file content**
8. Paste into Supabase SQL Editor
9. Click **"RUN"** button (bottom right)
10. Wait 30 seconds for completion

**Expected Output:**
```
✓ CREATE TABLE collections
✓ ALTER TABLE products ADD collection_id
✓ ALTER TABLE knitwear_items ADD collection_id
✓ CREATE INDEX (4 indexes)
✓ INSERT INTO collections (4 default rows)
✓ Row Level Security policies
```

**Option B: PowerShell Script**

```powershell
# Run setup script (handles migration prompts)
.\setup.ps1
```

### STEP 2: Install Dependencies (1 minute)

```powershell
npm install
```

### STEP 3: Start Development Server (instant)

```powershell
npm run dev
```

You'll see:
```
VITE v4.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

---

## ✅ Verify Everything Works

### Test 1: Admin Dashboard Access

1. Go to: http://localhost:5173/admin
2. You should see login screen
3. If you see errors, check browser console (F12 → Console tab)

### Test 2: Database Connection

In browser console (F12 → Console):

```javascript
// Test getting collections
const { supabase } = await import('./src/api/supabaseClient.js');
const { data, error } = await supabase.from('collections').select('*');
console.log(data); // Should show 4 collections
```

### Test 3: Product Creation with Collection

1. Admin Dashboard → Products tab
2. Click **"Add Product"**
3. Fill form:
   - Name: "Test Product"
   - Price: "1500"
   - **Collection**: Should show dropdown with 4 options ✓
4. Click **"Create Product"**
5. Should save successfully ✓

---

## 🔍 Troubleshooting

### ❌ "VITE_SUPABASE_URL is undefined"
- **Fix**: Restart dev server (stop with Ctrl+C, then `npm run dev`)
- Dev server reads `.env.local` on startup

### ❌ Collections table doesn't exist
- **Fix**: Execute migration SQL again (Step 1)
- Check Supabase SQL Editor for error messages

### ❌ "Foreign key constraint error"
- **Fix**: Make sure collection_id is selected in dropdown
- Don't try to enter it manually

### ❌ Can't login to admin
- **Fix**: Create admin user in Supabase:
  - https://app.supabase.com → Authentication → Users
  - Click "Create new user"
  - Email: admin@iconbymitali.com
  - Password: (generate strong one)
  - Check "Email confirm" to skip email verification

### ❌ Dev server won't start
- **Fix**: 
  ```powershell
  npm install
  npm run dev
  ```
- If still fails, check for Node.js: `node -v` (should be v16+)

---

## 📊 What Each File Does

| File | Purpose | Status |
|------|---------|--------|
| `.env.local` | Supabase credentials | ✅ Created |
| `MIGRATION_COLLECTION_FK.sql` | Database setup | ⏳ Execute now |
| `src/api/supabaseClient.js` | Supabase initialization | ✅ Ready |
| `src/api/supabaseAdmin.js` | Admin API layer | ✅ Ready |
| `src/lib/AuthContext.jsx` | Session management | ✅ Ready |
| `src/components/admin/*.jsx` | Admin forms (4 files) | ✅ Updated |

---

## 🎯 Next Steps After Setup

1. ✅ Execute migration
2. ✅ Start dev server
3. ⏭️ Test admin dashboard (comprehensive checklist in `ADMIN_COMPONENTS_UPDATE_COMPLETE.md`)
4. ⏭️ Deploy to production (Vercel)

---

## 📞 Need Help?

**Check these files for detailed info:**
- `BACKEND_SETUP_GUIDE.md` - Complete backend setup details
- `ADMIN_DASHBOARD_AUDIT_REPORT.md` - Root cause analysis & testing
- `ADMIN_COMPONENTS_UPDATE_COMPLETE.md` - Component testing checklist

**Common Issues:**
- Check browser console for JavaScript errors (F12)
- Check Supabase dashboard for SQL errors
- Verify `.env.local` exists and has your credentials

---

## ✨ You're Ready!

Everything is configured. Just:
1. Execute the migration (1 time only)
2. Run `npm install` (install dependencies)
3. Run `npm run dev` (start developing)

**That's it!** 🚀
