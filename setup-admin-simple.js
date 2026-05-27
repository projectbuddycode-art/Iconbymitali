#!/usr/bin/env node

/**
 * Set Admin Privileges for iconbymd@gmail.com
 * This script uses the Supabase client library
 */

async function setupAdmin() {
  console.log('🔐 Setting up admin for iconbymd@gmail.com\n');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  // Credentials from .env.local
  const SUPABASE_URL = 'https://apmiabucenklyfaewoun.supabase.co';
  const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwbWlhYnVjZW5rbHlmYWV3b3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNjUyNDcsImV4cCI6MjA5NDg0MTI0N30.-wWKMrfGeMEz1jJFEaU59Y5kAG-ru-wqlTaFn8BtNK8';
  
  try {
    console.log('📧 Fetching user data for iconbymd@gmail.com\n');
    
    // Query user_profiles table
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?email=eq.iconbymd@gmail.com`,
      {
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
        },
      }
    );

    const profiles = await response.json();

    if (profiles.length === 0) {
      console.log('❌ Profile not found for iconbymd@gmail.com\n');
      showManualSQL();
      return;
    }

    // Update the profile
    const profile = profiles[0];
    console.log(`Found profile: ${profile.email}\n`);

    // Update with admin privileges
    const updateResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${profile.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': ANON_KEY,
          'Authorization': `Bearer ${ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'admin',
          is_admin: true,
          full_name: 'Mitali Dhumal',
          updated_at: new Date().toISOString(),
        }),
      }
    );

    if (!updateResponse.ok) {
      console.log('⚠️  Could not update via API. Please use manual SQL method:\n');
      showManualSQL();
      return;
    }

    console.log('✅ SUCCESS! Admin privileges set for iconbymd@gmail.com\n');
    console.log('📋 Updated Profile:');
    console.log(`   Email: iconbymd@gmail.com`);
    console.log(`   Role: admin`);
    console.log(`   Admin: true`);
    console.log(`   Full Name: Mitali Dhumal\n`);
    
    console.log('🎉 The user can now log in and access the admin dashboard!');
    console.log('   Login URL: http://localhost:5173/login');
    console.log('   Admin Dashboard: http://localhost:5173/admin\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 Please use the manual SQL method:\n');
    showManualSQL();
  }
}

function showManualSQL() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📋 MANUAL SETUP - RUN THIS SQL IN SUPABASE');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('1️⃣  Go to Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/apmiabucenklyfaewoun\n');
  
  console.log('2️⃣  Click SQL Editor (left sidebar)\n');
  
  console.log('3️⃣  Click "New Query" and paste this SQL:\n');
  
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`INSERT INTO user_profiles (id, email, full_name, role, is_admin)
SELECT 
  id,
  email,
  'Mitali Dhumal',
  'admin',
  true
FROM auth.users
WHERE email = 'iconbymd@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', is_admin = true, full_name = 'Mitali Dhumal', updated_at = NOW();`);
  console.log('───────────────────────────────────────────────────────────────\n');
  
  console.log('4️⃣  Click Run (Ctrl+Enter)\n');
  
  console.log('5️⃣  You should see: "1 row inserted" or "1 row updated"\n');
  
  console.log('6️⃣  VERIFY with this query:\n');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`SELECT id, email, role, is_admin, created_at FROM user_profiles 
WHERE email = 'iconbymd@gmail.com';`);
  console.log('───────────────────────────────────────────────────────────────\n');
  
  console.log('✅ Once confirmed, iconbymd@gmail.com can access /admin\n');
}

setupAdmin();
