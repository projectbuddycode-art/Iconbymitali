# Making iconbymd@gmail.com Admin - Quick Guide

## Current Status ✅
- User `iconbymd@gmail.com` exists in Supabase Authentication
- User profile needs to be created with admin privileges
- This will give them access to the `/admin` dashboard

---

## ⚡ Quick Setup (2 minutes)

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/apmiabucenklyfaewoun

### Step 2: Navigate to SQL Editor
1. In the left sidebar, find **SQL Editor**
2. Click on it

### Step 3: Create New Query
1. Click the **"New Query"** button (top right)
2. You'll see a blank SQL editor

### Step 4: Copy & Run the SQL
Copy this entire SQL query and paste it into the editor:

```sql
INSERT INTO user_profiles (id, email, full_name, role, is_admin)
SELECT 
  id,
  email,
  'Mitali Dhumal',
  'admin',
  true
FROM auth.users
WHERE email = 'iconbymd@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', is_admin = true, full_name = 'Mitali Dhumal', updated_at = NOW();
```

Press **Ctrl+Enter** or click the **Run** button

### Step 5: Verify Success
You should see one of these messages:
- **"1 row inserted"** (new profile created)
- **"1 row updated"** (existing profile updated)

---

## ✅ Verify It Worked

Run this query to confirm:

```sql
SELECT id, email, role, is_admin, created_at 
FROM user_profiles 
WHERE email = 'iconbymd@gmail.com';
```

**Expected output:**
| id | email | role | is_admin | created_at |
|---|---|---|---|---|
| (UUID) | iconbymd@gmail.com | admin | true | (timestamp) |

---

## 🎉 You're Done!

Now `iconbymd@gmail.com` can:

### Login
- Go to http://localhost:5173/login (or your production URL)
- Email: `iconbymd@gmail.com`
- Password: `AsIconicasyou!`

### Access Admin Dashboard
After login, they'll be redirected to:
- http://localhost:5173/admin (development)
- https://yoursite.com/admin (production)

### Admin Privileges Include
- 📦 Manage Products
- 🧵 Manage Knitwear
- 📋 Manage Orders
- 📝 Manage Blog
- 📧 Manage Contacts
- 🏷️ Manage Coupons
- ⚙️ Settings

---

## 🆘 Troubleshooting

### "Permission denied" error
- Make sure you're logged into Supabase with the correct account
- You need to be the project owner or have database access

### Still can't log in as admin
1. Clear browser cache and cookies
2. Try in an incognito/private window
3. Verify the SQL query ran successfully (check step 5)

### User can log in but can't access /admin
1. Re-run the verification query from Step 5
2. Make sure `is_admin = true` in the result
3. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)

---

## 📝 Reference

- **Supabase Project:** apmiabucenklyfaewoun
- **Dashboard:** https://supabase.com/dashboard/project/apmiabucenklyfaewoun
- **User Email:** iconbymd@gmail.com
- **Admin Role Set:** ✅ Yes
- **Table Modified:** user_profiles

---

**Need help?** Check the ADD_ADMIN_ICONBYMD.md file for more details.
