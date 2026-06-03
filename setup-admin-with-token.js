#!/usr/bin/env node

// Admin setup with user's auth token
// Usage: node setup-admin-with-token.js <token>

const args = process.argv.slice(2);
const accessToken = args[0];

if (!accessToken) {
  console.error('❌ Access token not provided');
  console.log('Usage: node setup-admin-with-token.js "<access_token>"');
  console.log('\nTo get the token:');
  console.log('1. Log in to http://localhost:5173');
  console.log('2. Open browser DevTools > Console');
  console.log('3. Run: JSON.parse(localStorage.getItem("icon_by_mitali_auth")).access_token');
  console.log('4. Copy the token and paste it here as an argument');
  process.exit(1);
}

const supabaseUrl = 'https://apmiabucenklyfaewoun.supabase.co';
const adminUserId = '9246f817-f333-4530-97c4-3492469daa48';
const adminEmail = 'admin@iconbymitali.com';

async function setupAdminProfile() {
  console.log('🔐 Setting up admin profile with authenticated token...\n');

  try {
    const restUrl = `${supabaseUrl}/rest/v1/user_profiles`;
    const supabaseAnonKey = 'sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'apikey': supabaseAnonKey,
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

    console.log('📤 Sending authenticated request to Supabase...');
    const response = await fetch(restUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    const responseData = responseText ? JSON.parse(responseText) : null;

    if (!response.ok) {
      if (response.status === 409) {
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
          console.log('📋 Profile:', updateData[0] || payload);
        } else {
          throw new Error(`Update failed with status ${updateResponse.status}`);
        }
      } else {
        console.error('❌ Failed:', response.statusText);
        console.error('Details:', responseData);
        throw new Error(`Request failed with status ${response.status}`);
      }
    } else {
      console.log('✅ Admin profile created successfully!');
      console.log('📋 Profile:', responseData[0] || payload);
    }

    console.log('\n🎉 Admin setup complete! Reload the browser to see the Admin link.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupAdminProfile();
