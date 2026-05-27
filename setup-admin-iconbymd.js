import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local file
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match && !line.startsWith('#')) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

async function makeAdminVisible() {
  try {
    console.log('🔍 Setting up admin privileges for iconbymd@gmail.com...\n');

    // First, check if the user exists in auth
    console.log('📧 Checking if user exists in Supabase Auth...');
    
    // Query the user_profiles table to set or update admin status
    console.log('⚙️ Updating user profile to admin...\n');

    // Since we need to update the profile, we'll use the RPC or direct update
    // We'll insert or update the profile for this user
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        role: 'admin',
        is_admin: true,
        full_name: 'Mitali Dhumal',
        updated_at: new Date().toISOString(),
      })
      .eq('email', 'iconbymd@gmail.com')
      .select();

    if (error) {
      if (error.code === 'PGRST116') {
        // No matching profile found, we need to create one
        console.log('👤 Profile not found. Creating new admin profile...\n');
        
        // We need to get the user ID from auth first
        // This is a limitation - we can't directly access auth.users from the client
        // So we'll show the user manual SQL instructions
        showManualInstructions();
        return;
      }
      throw error;
    }

    if (data && data.length > 0) {
      console.log('✅ SUCCESS! Admin privileges have been set for iconbymd@gmail.com\n');
      console.log('📋 Updated Profile:');
      console.log(`   Email: ${data[0].email}`);
      console.log(`   Role: ${data[0].role}`);
      console.log(`   Admin: ${data[0].is_admin}`);
      console.log(`   Full Name: ${data[0].full_name}\n`);
      
      console.log('🎉 The user can now log in and access the admin dashboard!');
      console.log('   Login URL: http://localhost:5173/login');
      console.log('   Admin Dashboard: http://localhost:5173/admin\n');
    } else {
      // Profile exists but needs to be created
      showManualInstructions();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n📝 Please use the manual SQL method shown below:\n');
    showManualInstructions();
  }
}

function showManualInstructions() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📋 MANUAL SETUP INSTRUCTIONS');
  console.log('═══════════════════════════════════════════════════════════════\n');
  
  console.log('Follow these steps to make iconbymd@gmail.com an admin:\n');
  
  console.log('1️⃣  Open Supabase Dashboard:');
  console.log('   https://supabase.com/dashboard/project/apmiabucenklyfaewoun\n');
  
  console.log('2️⃣  Go to SQL Editor (left sidebar)\n');
  
  console.log('3️⃣  Click "New Query" and run this SQL:\n');
  
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
  
  console.log('4️⃣  You should see: "1 row inserted" or "1 row updated"\n');
  
  console.log('5️⃣  VERIFY with this query:\n');
  console.log('───────────────────────────────────────────────────────────────');
  console.log(`SELECT id, email, role, is_admin, created_at FROM user_profiles 
WHERE email = 'iconbymd@gmail.com';`);
  console.log('───────────────────────────────────────────────────────────────\n');
  
  console.log('✅ After running the SQL, the user can log in and access /admin\n');
}

// Run the setup
makeAdminVisible();
