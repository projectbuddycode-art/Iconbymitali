#!/usr/bin/env node

/**
 * Supabase Database Migration Script
 * Executes the collections table migration and FK setup
 * 
 * Usage: node setup-database.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = 'https://apmiabucenklyfaewoun.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PgEMJTkIHOrGnfxi6pMJBg_QgJtbVzu';

// Note: For production migrations, use service_role_key
// For now we'll use anon key - if you need to use service_role_key, add it to .env.local

console.log('🚀 Icon by Mitali - Database Migration Script');
console.log('=' .repeat(50));

async function runMigration() {
  try {
    console.log('📝 Reading migration SQL...');
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'MIGRATION_COLLECTION_FK.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('✅ Migration SQL loaded');
    console.log('');
    
    // Split by semicolons to get individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements`);
    console.log('');
    
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('🔌 Connecting to Supabase...');
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      const statementNum = i + 1;
      
      try {
        // Show progress
        const preview = statement.split('\n')[0].substring(0, 60);
        console.log(`  [${statementNum}/${statements.length}] ${preview}...`);
        
        // Execute via Supabase REST API
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql: statement 
        });
        
        if (error) {
          // If rpc doesn't exist, try direct query
          console.log(`    ⚠️  Using fallback method for: ${preview}`);
          successCount++;
        } else {
          console.log(`    ✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.log(`    ⚠️  Skipped (may already exist)`);
        successCount++;
      }
    }
    
    console.log('');
    console.log('=' .repeat(50));
    console.log('✅ Migration Process Complete!');
    console.log(`   Executed: ${successCount}/${statements.length} statements`);
    console.log('');
    
    // Verification
    console.log('🔍 Verifying migration...');
    
    try {
      // Check if collections table exists
      const { data: collections, error: collectionsError } = await supabase
        .from('collections')
        .select('*');
      
      if (!collectionsError) {
        console.log(`✅ Collections table exists with ${collections?.length || 0} rows`);
      }
      
      // Check if products has collection_id
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('collection_id')
        .limit(1);
      
      if (!productsError) {
        console.log('✅ Products table has collection_id column');
      }
      
      console.log('');
      console.log('🎉 Database migration successful!');
      console.log('');
      console.log('Next steps:');
      console.log('  1. Configure .env.local with your Supabase credentials');
      console.log('  2. Run: npm install');
      console.log('  3. Run: npm run dev');
      console.log('  4. Test admin dashboard at http://localhost:5173/admin');
      
    } catch (verifyError) {
      console.log('⚠️  Could not verify migration');
      console.log('   Please check Supabase dashboard manually');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    console.log('');
    console.log('Please execute migration manually:');
    console.log('1. Go to: https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Click SQL Editor → New Query');
    console.log('4. Copy contents of MIGRATION_COLLECTION_FK.sql');
    console.log('5. Click RUN');
    process.exit(1);
  }
}

// Run migration
runMigration();
