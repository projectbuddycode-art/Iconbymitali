#!/usr/bin/env node

// Manual admin setup without dependencies
// Usage: node setup-admin-direct.js

const supabaseUrl = 'https://apmiabucenklyfaewoun.supabase.co';
const supabaseAnonKey = 'sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu';
const adminUserId = '9246f817-f333-4530-97c4-3492469daa48';
const adminEmail = 'admin@iconbymitali.com';

async function setupAdminProfile() {
  console.log('🔐 Setting up admin profile...\n');
  console.log(`User ID: ${adminUserId}`);
  console.log(`Email: ${adminEmail}\n`);

  try {
    // Attempt to insert via REST API
    const restUrl = `${supabaseUrl}/rest/v1/user_profiles`;
    const headers = {
      'Content-Type': 'application/json',
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Prefer': 'return=representation'
    };

    const payload = {
      id: adminUserId,
      email: adminEmail,
      is_admin: true,
      role: 'admin',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📤 Sending request to Supabase...');
    const response = await fetch(restUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    const responseData = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
      if (response.status === 409) {
        // Conflict - try update instead
        console.log('⚠️  Profile exists, attempting update...\n');
        
        const updateUrl = `${supabaseUrl}/rest/v1/user_profiles?id=eq.${adminUserId}`;
        const updateResponse = await fetch(updateUrl, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            is_admin: true,
            role: 'admin',
            updated_at: new Date().toISOString()
          })
        });

        if (updateResponse.ok) {
          const updateData = await updateResponse.json();
          console.log('✅ Admin profile updated successfully!');
          console.log('📋 Updated profile:', updateData[0]);
        } else {
          const error = await updateResponse.text();
          console.error('❌ Update failed:', error);
          throw new Error(`Update failed with status ${updateResponse.status}`);
        }
      } else {
        console.error('❌ Failed:', response.statusText);
        console.error('Details:', responseData);
        throw new Error(`Request failed with status ${response.status}`);
      }
    } else {
      console.log('✅ Admin profile created successfully!');
      console.log('📋 Created profile:', responseData[0] || payload);
    }

    // Verify
    console.log('\n🔍 Verifying admin setup...\n');
    const verifyUrl = `${supabaseUrl}/rest/v1/user_profiles?email=eq.${adminEmail}`;
    const verifyResponse = await fetch(verifyUrl, {
      method: 'GET',
      headers
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      if (verifyData.length > 0) {
        const profile = verifyData[0];
        console.log('✅ Verification successful!');
        console.log(`   ID: ${profile.id}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Is Admin: ${profile.is_admin}`);
        console.log(`   Role: ${profile.role}`);
        console.log('\n🎉 Admin user is now set up! Reload the browser to see the Admin link.');
      } else {
        console.log('⚠️  Profile not found in verification');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📝 If the above failed, you can manually run this SQL in Supabase SQL Editor:');
    console.log(`
INSERT INTO user_profiles (id, email, is_admin, role, created_at, updated_at)
VALUES (
  '${adminUserId}',
  '${adminEmail}',
  true,
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  role = 'admin',
  updated_at = NOW();
    `);
    process.exit(1);
  }
}

setupAdminProfile();
