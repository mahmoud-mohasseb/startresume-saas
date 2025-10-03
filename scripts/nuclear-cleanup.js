#!/usr/bin/env node

/**
 * NUCLEAR OPTION: Complete data destruction script
 * This will DELETE EVERYTHING from Supabase and provide Clerk cleanup instructions
 * 
 * ⚠️  EXTREME DANGER: This action is COMPLETELY IRREVERSIBLE
 */

const { createClient } = require('@supabase/supabase-js')
const readline = require('readline')
const fs = require('fs')
const path = require('path')

// Load environment variables manually since dotenv might not be installed
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '..', '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf8')
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        process.env[key.trim()] = value
      }
    })
  } catch (error) {
    console.error('❌ Could not load .env.local file:', error.message)
    console.error('Make sure .env.local exists with SUPABASE credentials')
    process.exit(1)
  }
}

// Load environment variables
loadEnvFile()

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logBright(message, color = 'white') {
  console.log(`${colors.bright}${colors[color]}${message}${colors.reset}`)
}

async function confirmDestruction() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    log('\n🚨 NUCLEAR DATA DESTRUCTION CONFIRMATION 🚨', 'red')
    log('=' .repeat(50), 'red')
    logBright('This will PERMANENTLY DELETE:', 'red')
    log('• ALL users from Supabase database', 'yellow')
    log('• ALL subscriptions and billing data', 'yellow')
    log('• ALL credit history and usage data', 'yellow')
    log('• ALL application data', 'yellow')
    log('• You will need to manually delete Clerk users', 'yellow')
    log('\n❌ THIS ACTION CANNOT BE UNDONE!', 'red')
    log('❌ ALL DATA WILL BE LOST FOREVER!', 'red')
    log('❌ ALL USERS WILL BE DELETED!', 'red')
    
    rl.question('\nType "NUCLEAR DESTRUCTION CONFIRMED" to proceed: ', (answer) => {
      rl.close()
      resolve(answer === 'NUCLEAR DESTRUCTION CONFIRMED')
    })
  })
}

async function nukeSupabaseData() {
  logBright('\n💥 INITIATING SUPABASE DATA DESTRUCTION...', 'red')
  
  try {
    // Get counts before deletion
    log('📊 Getting current data counts...', 'cyan')
    
    const [usersCount, subscriptionsCount, creditHistoryCount] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
      supabase.from('credit_history').select('*', { count: 'exact', head: true })
    ])

    log(`📈 Current data:`, 'blue')
    log(`   • Users: ${usersCount.count || 0}`, 'white')
    log(`   • Subscriptions: ${subscriptionsCount.count || 0}`, 'white')
    log(`   • Credit History: ${creditHistoryCount.count || 0}`, 'white')

    // Delete in correct order (foreign key constraints)
    log('\n💀 DELETING CREDIT HISTORY...', 'red')
    const { error: creditError, count: creditDeleted } = await supabase
      .from('credit_history')
      .delete({ count: 'exact' })
      .neq('id', 0)
    
    if (creditError) {
      log(`❌ Error deleting credit history: ${creditError.message}`, 'red')
      throw creditError
    }
    log(`✅ Deleted ${creditDeleted || 0} credit history records`, 'green')

    log('\n💀 DELETING SUBSCRIPTIONS...', 'red')
    const { error: subError, count: subDeleted } = await supabase
      .from('subscriptions')
      .delete({ count: 'exact' })
      .neq('id', 0)
    
    if (subError) {
      log(`❌ Error deleting subscriptions: ${subError.message}`, 'red')
      throw subError
    }
    log(`✅ Deleted ${subDeleted || 0} subscription records`, 'green')

    log('\n💀 DELETING USERS...', 'red')
    const { error: userError, count: userDeleted } = await supabase
      .from('users')
      .delete({ count: 'exact' })
      .neq('id', 0)
    
    if (userError) {
      log(`❌ Error deleting users: ${userError.message}`, 'red')
      throw userError
    }
    log(`✅ Deleted ${userDeleted || 0} user records`, 'green')

    // Reset sequences
    log('\n🔄 RESETTING DATABASE SEQUENCES...', 'yellow')
    const resetQueries = [
      "ALTER SEQUENCE users_id_seq RESTART WITH 1;",
      "ALTER SEQUENCE subscriptions_id_seq RESTART WITH 1;", 
      "ALTER SEQUENCE credit_history_id_seq RESTART WITH 1;"
    ]

    for (const query of resetQueries) {
      try {
        await supabase.rpc('exec_sql', { sql: query })
        log(`✅ Reset sequence: ${query.split(' ')[2]}`, 'green')
      } catch (error) {
        log(`⚠️  Could not reset sequence: ${error.message}`, 'yellow')
      }
    }

    // Verify deletion
    log('\n🔍 VERIFYING DESTRUCTION...', 'cyan')
    const [finalUsers, finalSubs, finalCredits] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true }),
      supabase.from('credit_history').select('*', { count: 'exact', head: true })
    ])

    log('📊 Final counts:', 'blue')
    log(`   • Users: ${finalUsers.count || 0}`, 'white')
    log(`   • Subscriptions: ${finalSubs.count || 0}`, 'white')
    log(`   • Credit History: ${finalCredits.count || 0}`, 'white')

    if ((finalUsers.count || 0) === 0 && (finalSubs.count || 0) === 0 && (finalCredits.count || 0) === 0) {
      logBright('✅ SUPABASE DATA DESTRUCTION COMPLETE!', 'green')
    } else {
      log('⚠️  Some data may still exist. Check manually.', 'yellow')
    }

  } catch (error) {
    log(`❌ SUPABASE DESTRUCTION FAILED: ${error.message}`, 'red')
    throw error
  }
}

function displayClerkDestructionInstructions() {
  logBright('\n🔥 CLERK USER DESTRUCTION REQUIRED', 'red')
  log('=' .repeat(50), 'red')
  log('Supabase is clean, but Clerk users must be deleted manually:', 'yellow')
  
  logBright('\n📋 CLERK CLEANUP METHODS:', 'cyan')
  
  log('\n1️⃣  CLERK DASHBOARD (Easiest):', 'blue')
  log('   • Go to: https://dashboard.clerk.com/', 'white')
  log('   • Select your application', 'white')
  log('   • Click "Users" in sidebar', 'white')
  log('   • Select all users and delete them', 'white')
  
  log('\n2️⃣  CLERK API (For many users):', 'blue')
  log('   • Use your Clerk Secret Key', 'white')
  log('   • GET /v1/users to list all users', 'white')
  log('   • DELETE /v1/users/{user_id} for each user', 'white')
  
  log('\n3️⃣  NUCLEAR OPTION - New Clerk App:', 'blue')
  log('   • Create entirely new Clerk application', 'white')
  log('   • Update .env.local with new keys', 'white')
  log('   • Delete old Clerk application', 'white')

  logBright('\n⚠️  IMPORTANT REMINDERS:', 'yellow')
  log('• All user sessions will be invalidated', 'white')
  log('• Webhooks may be triggered', 'white')
  log('• Check for active Stripe subscriptions', 'white')
  log('• Update environment variables if needed', 'white')
}

async function main() {
  logBright('🚨 NUCLEAR DATA DESTRUCTION PROTOCOL 🚨', 'red')
  log('=' .repeat(50), 'red')
  
  log('\nThis script will:', 'yellow')
  log('💥 DELETE ALL DATA from Supabase', 'red')
  log('💥 RESET all database sequences', 'red')
  log('💥 Provide instructions for Clerk cleanup', 'red')
  
  logBright('\n⚠️  FINAL WARNING:', 'red')
  log('This is a NUCLEAR OPTION - everything will be destroyed!', 'yellow')
  log('Make sure you have backups if you need them!', 'yellow')

  const confirmed = await confirmDestruction()
  
  if (!confirmed) {
    log('\n❌ Nuclear destruction cancelled. Data is safe.', 'green')
    log('No changes were made to your database.', 'white')
    process.exit(0)
  }

  logBright('\n💥 INITIATING NUCLEAR DESTRUCTION SEQUENCE...', 'red')
  
  // Countdown
  for (let i = 5; i > 0; i--) {
    log(`💣 Destruction in ${i}...`, 'red')
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  try {
    await nukeSupabaseData()
    displayClerkDestructionInstructions()
    
    logBright('\n🎯 NUCLEAR DESTRUCTION SEQUENCE COMPLETE!', 'green')
    log('Supabase has been wiped clean.', 'white')
    log('Remember to clean Clerk users manually.', 'yellow')
    
  } catch (error) {
    logBright('\n💥 NUCLEAR DESTRUCTION FAILED!', 'red')
    log(`Error: ${error.message}`, 'red')
    log('Some data may still exist. Check manually.', 'yellow')
    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error)
}

module.exports = { nukeSupabaseData, displayClerkDestructionInstructions }
