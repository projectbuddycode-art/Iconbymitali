import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAdminProfile() {
  try {
    console.log('🔐 Setting up admin profile for admin@iconbymitali.com...');

    // Get the admin user from auth.users
    // Note: This requires service role key, but we'll use a workaround

    // First, let's check if the user exists in user_profiles
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'admin@iconbymitali.com')
      .single();

    if (existingProfile) {
      console.log('✅ Found existing profile, updating...');
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ is_admin: true, role: 'admin' })
        .eq('email', 'admin@iconbymitali.com')
        .select();

      if (error) {
        console.error('❌ Error updating profile:', error);
      } else {
        console.log('✅ Admin profile updated:', data);
      }
    } else {
      console.log('ℹ️  No existing profile found. Creating new one...');
      
      // We need to get the user ID from auth, which requires service role key
      // For now, show instructions
      console.log(`
⚠️  To complete admin setup, please run this SQL in Supabase SQL Editor:

INSERT INTO user_profiles (id, email, is_admin, role, created_at, updated_at)
SELECT 
  id,
  email,
  true,
  'admin',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@iconbymitali.com'
ON CONFLICT (id) DO UPDATE SET
  is_admin = true,
  role = 'admin',
  updated_at = NOW();
      `);
    }
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

setupAdminProfile();
