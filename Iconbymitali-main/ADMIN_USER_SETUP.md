# Adding Admin User to Icon by Mitali

## Overview
This guide shows how to create the admin user for `ddubey7112@gmail.com` and set up admin access to the dashboard.

## Step-by-Step Instructions

### Step 1: Create Auth User in Supabase

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/apmiabucenklyfaewoun
2. Go to: **Authentication** → **Users** (in left sidebar)
3. Click the **+ Add User** button (top right)
4. In the modal that appears:
   - **Email**: `ddubey7112@gmail.com`
   - **Password**: 
     - Option A: Check "Auto generate password" (Supabase will generate and email it)
     - Option B: Enter a custom strong password (minimum 8 characters)
5. Click **Save User**

The user is now created in Supabase Auth!

### Step 2: Set Admin Role in Database

Now we need to create their profile and set them as admin.

1. In Supabase Dashboard, go to: **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the SQL below:

```sql
-- Insert admin user profile
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
SET role = 'admin', is_admin = true, full_name = 'Mitali Dhumal';
```

4. Click **Run** (or Ctrl+Enter)
5. You should see: "1 row inserted" or "1 row updated"

### Step 3: Verify Setup

Run this verification query:

```sql
-- Verify admin user exists
SELECT id, email, role, is_admin, created_at FROM user_profiles 
WHERE email = 'ddubey7112@gmail.com';
```

Expected output:
```
id                                   | email                  | role  | is_admin | created_at
-------------------------------------|------------------------|-------|----------|---
550e8400-e29b-41d4-a716-446655440000 | ddubey7112@gmail.com   | admin | true     | 2024-01-15 10:30:00
```

### Step 4: Test Admin Login

1. Go to your website: http://localhost:5173 (or production URL)
2. Click the **LOGIN** button (top right of header)
3. On login page, enter:
   - **Email**: `ddubey7112@gmail.com`
   - **Password**: (password from Step 1)
4. Click **Sign In**
5. You should be redirected to: http://localhost:5173/admin
6. Admin dashboard with tabs should be visible:
   - Knitwear
   - Products
   - Orders
   - Blog
   - Contacts
   - Settings

## Adding Additional Admin Users

Repeat the above steps for any other admin emails:

```sql
INSERT INTO user_profiles (id, email, full_name, role, is_admin)
SELECT 
  id, 
  email,
  'Admin Name',
  'admin',
  true
FROM auth.users
WHERE email = 'newemail@example.com'
ON CONFLICT (email) DO UPDATE
SET role = 'admin', is_admin = true;
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login button shows "Coming soon" | Frontend not deployed or auth code not loaded. Refresh page. |
| Login page not loading | Check if `/login` route exists. Verify App.jsx has Login import. |
| "Access Denied" on admin page | User profile doesn't have `is_admin = true`. Run verification query above. |
| Forgot password | In Supabase → Users, find user, click ⋮ menu → "Reset Password" |
| Can't find user in Auth Users list | Try logging in again or check email for signup link. |

## Useful SQL Queries

**View all admin users:**
```sql
SELECT email, role, is_admin, created_at FROM user_profiles WHERE is_admin = true;
```

**Make someone admin:**
```sql
UPDATE user_profiles SET role = 'admin', is_admin = true WHERE email = 'email@example.com';
```

**Remove admin privileges:**
```sql
UPDATE user_profiles SET role = 'user', is_admin = false WHERE email = 'email@example.com';
```

**Delete a user (from auth and profiles):**
```sql
DELETE FROM user_profiles WHERE email = 'email@example.com';
-- User must also be deleted from auth.users in UI or via Supabase CLI
```

## What's Next?

After admin setup:
- [ ] Test admin login at http://localhost:5173/admin
- [ ] Configure Razorpay credentials (see RAZORPAY_SETUP.md)
- [ ] Deploy Edge Functions (see EDGE_FUNCTIONS_DEPLOYMENT.md)
- [ ] Deploy to Vercel
