# Adding Admin User: iconbymd@gmail.com

## Step-by-Step Instructions

### Step 1: Create Auth User in Supabase Dashboard

1. Open Supabase Dashboard: https://supabase.com/dashboard/project/apmiabucenklyfaewoun
2. Go to: **Authentication** → **Users** (in left sidebar)
3. Click the **+ Add User** button (top right)
4. In the modal that appears:
   - **Email**: `iconbymd@gmail.com`
   - **Password**: `AsIconicasyou!`
   - ⚠️ **Important**: Do NOT check "Auto generate password" - enter the password above
5. Click **Save User**

The auth user is now created in Supabase!

---

### Step 2: Set Admin Role in Database

Now we need to set this user as admin in the database.

1. In Supabase Dashboard, go to: **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy and paste the SQL below:

```sql
-- Make iconbymd@gmail.com an admin user
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

4. Click **Run** (or Ctrl+Enter)
5. You should see: **"1 row inserted"** or **"1 row updated"**

---

### Step 3: Verify Setup

Run this verification query in SQL Editor:

```sql
-- Verify admin user exists
SELECT id, email, full_name, role, is_admin, created_at FROM user_profiles 
WHERE email = 'iconbymd@gmail.com';
```

Expected output should show:
- `email`: iconbymd@gmail.com
- `role`: admin
- `is_admin`: true

---

### Step 4: Test Admin Login

1. Go to your website: http://localhost:5173 (or your production URL)
2. Click the **LOGIN** button (top right)
3. Enter:
   - **Email**: `iconbymd@gmail.com`
   - **Password**: `AsIconicasyou!`
4. Click **Sign In**
5. You should be redirected to `/admin` dashboard with all admin tabs visible

---

## Credentials Reference

| Field | Value |
|-------|-------|
| Admin Email | iconbymd@gmail.com |
| Admin Password | AsIconicasyou! |
| Admin Full Name | Mitali Dhumal |
| Dashboard URL | /admin |

---

## Troubleshooting

- **"User not found" error**: Make sure the user was created in Step 1 first
- **Still can't access admin**: Check that the SQL query ran successfully (should show 1 row inserted/updated)
- **Can't login**: Verify email and password are entered exactly as specified
