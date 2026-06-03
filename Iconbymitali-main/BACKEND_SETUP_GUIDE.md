# 🚀 Backend & Database Setup Guide

**Status**: Step-by-step setup for Icon by Mitali  
**Last Updated**: June 4, 2026

---

## 📋 Setup Overview

This guide will help you:
1. ✅ Execute database migration (collections + FK)
2. ✅ Configure environment variables
3. ✅ Set up Supabase authentication
4. ✅ Initialize backend API connections
5. ✅ Test the complete setup

---

## 🔑 Your Credentials

**Supabase Project URL:**
```
https://apmiabucenklyfaewoun.supabase.co
```

**Public Anon Key:**
```
sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu
```

---

## STEP 1: Execute Database Migration

### 1.1 Navigate to Supabase SQL Editor

1. Go to: https://app.supabase.com
2. Select your project (Icon by Mitali)
3. Click **SQL Editor** (left sidebar)
4. Click **New Query** (top right)

### 1.2 Execute Migration SQL

1. Open file: `MIGRATION_COLLECTION_FK.sql` (in your workspace)
2. Copy entire content
3. Paste into Supabase SQL Editor
4. Click **RUN** button (bottom right)
5. Wait for completion (should show ~7 queries executed)

**Expected Output:**
```
Query execution successful
- CREATE TABLE collections ✓
- ALTER TABLE products ADD collection_id ✓
- ALTER TABLE knitwear_items ADD collection_id ✓
- INSERT INTO collections (4 rows) ✓
- CREATE INDEX (4 indexes) ✓
- Row Level Security (2 policies) ✓
```

### 1.3 Verify Collections Table

1. In Supabase, go to **Table Editor** (left sidebar)
2. You should see new table: **collections**
3. Click it and verify 4 rows exist:
   - Second Skin
   - Urban Elegance
   - Seasonal Essentials
   - Limited Edition

If you don't see the collections table, check for SQL errors in the output.

---

## STEP 2: Configure Environment Variables

### 2.1 Create `.env.local` file

In your project root (`Iconbymitali-main/`), create `.env.local`:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://apmiabucenklyfaewoun.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu

# API Configuration
VITE_API_URL=https://apmiabucenklyfaewoun.supabase.co/rest/v1
VITE_API_KEY=sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu

# Optional: Admin key (for server-side operations)
# Get this from Supabase Settings → API → service_role (KEEP SECRET!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 2.2 Verify Environment Variables

**In VS Code:**
1. Open `.env.local`
2. Verify all 4 variables are present
3. Do NOT commit to git (already in `.gitignore`)

**In terminal (PowerShell):**
```powershell
Get-Content .env.local
```

---

## STEP 3: Initialize Database Tables

### 3.1 Verify All Tables Exist

In Supabase Table Editor, confirm you have:
- ✅ **collections** (NEW - created by migration)
- ✅ **products** (should already exist)
- ✅ **knitwear_items** (should already exist)
- ✅ **orders** (should already exist)
- ✅ **blog_posts** (should already exist)
- ✅ **coupons** (should already exist)
- ✅ **user_profiles** (should already exist)

### 3.2 Check Foreign Key Columns

**Products table:**
- Check if `collection_id` column exists ✓
- Type should be `BIGINT`
- Should reference `collections(id)`

**Knitwear items table:**
- Check if `collection_id` column exists ✓
- Type should be `BIGINT`
- Should reference `collections(id)`

### 3.3 Enable RLS (Row Level Security)

In Supabase:
1. Go to **Authentication** → **Policies**
2. For each table, verify RLS is enabled
3. Collections table should have 2 policies (already created by migration)

---

## STEP 4: Set Up Authentication

### 4.1 Enable Email Authentication

1. In Supabase Dashboard → **Authentication**
2. Go to **Providers**
3. Enable **Email** (should already be enabled)
4. Settings:
   - ✅ Confirm email (toggle ON if you want email verification)
   - ✅ Auto-confirm users (toggle ON for development)

### 4.2 Create Admin User

**Via Supabase Auth Console:**

1. Supabase Dashboard → **Authentication** → **Users**
2. Click **Create new user**
3. Email: `admin@iconbymitali.com`
4. Password: (generate strong password)
5. Click **Create user**

**Via Node.js (alternative):**

```javascript
// supabase/functions/create-admin-user.js
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://apmiabucenklyfaewoun.supabase.co',
  'your_service_role_key'
)

async function createAdmin() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'admin@iconbymitali.com',
    password: 'YourStrongPassword123!',
    email_confirm: true
  })
  console.log(data)
}

createAdmin()
```

### 4.3 Create User Profile

After creating admin user:

1. Supabase Dashboard → **Table Editor**
2. Open `user_profiles` table
3. Insert row:
   - `id`: (admin user UUID from auth)
   - `name`: "Admin"
   - `role`: "admin"
   - `email`: "admin@iconbymitali.com"
   - `created_at`: now
   - `updated_at`: now

---

## STEP 5: Configure Supabase API

### 5.1 Set Up Storage Buckets

For image uploads (products, blog, etc.):

1. Supabase Dashboard → **Storage**
2. Create new bucket: `products`
   - Name: `products`
   - Public: ✅ (to serve images)
3. Create new bucket: `blog`
   - Name: `blog`
   - Public: ✅

### 5.2 Create Storage Policies

**For products bucket:**

```sql
CREATE POLICY "Public read access to products" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload to products" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
```

**For blog bucket:**

```sql
CREATE POLICY "Public read access to blog" ON storage.objects
  FOR SELECT USING (bucket_id = 'blog');

CREATE POLICY "Authenticated users can upload to blog" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'blog' AND auth.role() = 'authenticated');
```

---

## STEP 6: Verify Backend Connection

### 6.1 Check supabaseClient.js

File: `src/api/supabaseClient.js`

Verify it has:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  }
})
```

### 6.2 Test API Connection

**Create test file: `test-connection.js`**

```javascript
import { supabase } from './src/api/supabaseClient.js'

async function testConnection() {
  console.log('Testing Supabase connection...')
  
  try {
    // Test 1: Get collections
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
    
    if (collectionsError) throw collectionsError
    console.log('✅ Collections fetched:', collections.length, 'rows')
    
    // Test 2: Get products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1)
    
    if (productsError) throw productsError
    console.log('✅ Products table accessible')
    
    // Test 3: Check FK relationship
    const { data: productsWithCollection, error: fkError } = await supabase
      .from('products')
      .select('*, collections:collection_id(*)')
      .limit(1)
    
    if (fkError) throw fkError
    console.log('✅ FK relationships working')
    
    console.log('✅ All connection tests passed!')
  } catch (error) {
    console.error('❌ Connection test failed:', error.message)
  }
}

testConnection()
```

**Run test:**
```bash
node test-connection.js
```

---

## STEP 7: Set Up Admin Dashboard API

### 7.1 Verify supabaseAdmin.js

File: `src/api/supabaseAdmin.js`

Should have these modules:
- ✅ `adminProducts` (CRUD for products)
- ✅ `adminCollections` (CRUD for collections)
- ✅ `adminKnitwearItems` (CRUD for knitwear)
- ✅ `adminBlogPosts` (CRUD for blog)
- ✅ `adminCoupons` (CRUD for coupons)
- ✅ `adminOrders` (CRUD for orders)

Each should have: `list()`, `get(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `uploadImage(file)`

### 7.2 Test Admin API

```javascript
import { adminCollections } from './src/api/supabaseAdmin.js'

async function testAdminAPI() {
  console.log('Testing admin API...')
  
  try {
    // Test getting collections
    const collections = await adminCollections.list()
    console.log('✅ Collections API:', collections.length, 'items')
    
    // Test getting single collection
    const collection = await adminCollections.get(collections[0].id)
    console.log('✅ Got collection:', collection.name)
    
  } catch (error) {
    console.error('❌ Admin API test failed:', error.message)
  }
}

testAdminAPI()
```

---

## STEP 8: Start Development Server

### 8.1 Install Dependencies

```bash
npm install
```

### 8.2 Start Dev Server

```bash
npm run dev
```

Expected output:
```
VITE v4.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

### 8.3 Test Admin Dashboard

1. Navigate to: `http://localhost:5173/admin`
2. Login with admin user:
   - Email: `admin@iconbymitali.com`
   - Password: (the one you set)
3. Verify you can:
   - ✅ View Products tab (should load collection FK)
   - ✅ View Knitwear tab (should load collection FK)
   - ✅ View Blog tab
   - ✅ View Coupons tab

### 8.4 Test Product Creation

1. Click **Products** tab
2. Click **Add Product**
3. Fill form:
   - Name: "Test Product"
   - Price: "1500"
   - **Collection**: Select from dropdown (should show 4 collections)
   - Category: "knitwear"
4. Click **Create Product**
5. Should save successfully (no FK error)

---

## TROUBLESHOOTING

### ❌ "collections table doesn't exist"
- Solution: Execute migration SQL again in Supabase
- Check for error messages in SQL Editor output

### ❌ "Could not find the 'collection_id' column"
- Solution: Refresh page (frontend cache)
- Verify migration executed completely
- Check Table Editor → products → should have `collection_id` column

### ❌ "Foreign key constraint violation"
- Solution: Select a valid collection ID from dropdown
- Verify 4 default collections inserted
- Check collection_id is not null

### ❌ "Session expired" in admin dashboard
- Solution: Login again
- Check `.env.local` has correct Supabase credentials
- Verify `supabaseClient.js` has `autoRefreshToken: true`

### ❌ Environment variables not loading
- Solution: Restart dev server after adding `.env.local`
- Verify file is in project root, not in src/
- Check file name: `.env.local` (not `.env`)

---

## ✅ Verification Checklist

- [ ] Database migration executed successfully
- [ ] Collections table exists with 4 rows
- [ ] Products table has `collection_id` column (BIGINT, FK)
- [ ] Knitwear items table has `collection_id` column (BIGINT, FK)
- [ ] `.env.local` file created with Supabase credentials
- [ ] Admin user created in Supabase Auth
- [ ] Storage buckets created (products, blog)
- [ ] supabaseClient.js verified
- [ ] supabaseAdmin.js verified
- [ ] Dev server starts without errors
- [ ] Can login to admin dashboard
- [ ] Can create product with collection selection
- [ ] Collection FK saves correctly

---

## 🎯 Next Steps

1. ✅ Execute migration (STEP 1)
2. ✅ Configure environment variables (STEP 2)
3. ✅ Set up database tables (STEP 3)
4. ✅ Configure authentication (STEP 4)
5. ✅ Set up storage (STEP 5)
6. ✅ Verify connections (STEP 6-7)
7. ✅ Start dev server (STEP 8)
8. ⏭️ Run admin component tests (see ADMIN_COMPONENTS_UPDATE_COMPLETE.md)
9. ⏭️ Deploy to production

---

## 📞 Support

If you encounter issues:
1. Check Supabase Dashboard → Error Logs
2. Open browser DevTools → Console for JavaScript errors
3. Check `.env.local` is configured correctly
4. Verify environment variables are being read: `console.log(import.meta.env)`

Happy building! 🚀
