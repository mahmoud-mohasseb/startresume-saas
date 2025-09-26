#!/usr/bin/env node

/**
 * Database Cleanup Execution Script
 * Safely cleans all data from the StartResume.io database
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚨 DATABASE CLEANUP SCRIPT');
console.log('==========================');
console.log('⚠️  WARNING: This will DELETE ALL DATA in your database!');
console.log('📋 This includes:');
console.log('   - All user accounts');
console.log('   - All subscriptions');
console.log('   - All credit history');
console.log('   - All feature usage data');
console.log('   - All resumes and cover letters');
console.log('   - ALL OTHER USER DATA');
console.log('');
console.log('✅ This is safe to run in development environments');
console.log('❌ DO NOT run this in production!');
console.log('');

// Check if we're in development
const isDevelopment = process.env.NODE_ENV !== 'production';

if (!isDevelopment) {
  console.log('🛑 BLOCKED: This script is blocked in production environment');
  console.log('   Set NODE_ENV to "development" to run this script');
  process.exit(1);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function confirmCleanup() {
  console.log('🔍 Environment Check:');
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
  console.log(`   Environment: ${isDevelopment ? 'Development ✅' : 'Production ❌'}`);
  console.log('');

  const answer1 = await askQuestion('❓ Are you sure you want to DELETE ALL DATA? (type "yes" to continue): ');
  
  if (answer1.toLowerCase() !== 'yes') {
    console.log('❌ Cleanup cancelled by user');
    rl.close();
    return false;
  }

  const answer2 = await askQuestion('❓ This action cannot be undone. Type "DELETE ALL DATA" to confirm: ');
  
  if (answer2 !== 'DELETE ALL DATA') {
    console.log('❌ Cleanup cancelled - confirmation text did not match');
    rl.close();
    return false;
  }

  console.log('');
  console.log('🧹 Starting database cleanup...');
  return true;
}

async function executeCleanup() {
  try {
    // Method 1: Try using the API endpoint (if server is running)
    console.log('🔄 Attempting cleanup via API endpoint...');
    
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('http://localhost:3000/api/admin/clean-database', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        adminKey: process.env.ADMIN_CLEANUP_KEY || 'dev-cleanup-key'
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Database cleanup completed via API!');
      console.log('📊 Results:', result);
      return true;
    } else {
      console.log('⚠️  API cleanup failed, trying direct database method...');
    }
  } catch (error) {
    console.log('⚠️  API not available, trying direct database method...');
  }

  // Method 2: Direct database cleanup using Supabase
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('❌ Missing Supabase environment variables');
      console.log('   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
      return false;
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    console.log('🔄 Cleaning credit_history...');
    await supabase.from('credit_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('🔄 Cleaning subscriptions...');
    await supabase.from('subscriptions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('🔄 Cleaning users...');
    await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Clean additional tables if they exist
    const additionalTables = ['resumes', 'cover_letters', 'feature_usage'];
    for (const table of additionalTables) {
      try {
        console.log(`🔄 Cleaning ${table}...`);
        await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (error) {
        console.log(`ℹ️  ${table} table does not exist or error occurred, skipping...`);
      }
    }

    console.log('✅ Direct database cleanup completed!');
    return true;

  } catch (error) {
    console.error('❌ Direct database cleanup failed:', error.message);
    return false;
  }
}

async function verifyCleanup() {
  try {
    console.log('🔍 Verifying cleanup...');
    
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const tables = ['users', 'subscriptions', 'credit_history'];
    
    for (const table of tables) {
      try {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        console.log(`📊 ${table}: ${count || 0} rows`);
      } catch (error) {
        console.log(`📊 ${table}: Could not verify (${error.message})`);
      }
    }

    console.log('✅ Verification completed');
  } catch (error) {
    console.log('⚠️  Could not verify cleanup:', error.message);
  }
}

async function main() {
  try {
    const confirmed = await confirmCleanup();
    
    if (!confirmed) {
      return;
    }

    const success = await executeCleanup();
    
    if (success) {
      await verifyCleanup();
      console.log('');
      console.log('🎉 Database cleanup completed successfully!');
      console.log('💡 Your database is now clean and ready for fresh data');
    } else {
      console.log('');
      console.log('❌ Database cleanup failed');
      console.log('💡 Please check the error messages above and try again');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the script
main();
