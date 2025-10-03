#!/usr/bin/env node

/**
 * DANGER: This script will DELETE ALL DATA from Supabase and Clerk
 * Use with extreme caution - this action is IRREVERSIBLE
 */

const { createClient } = require('@supabase/supabase-js')
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function cleanSupabaseData() {
  console.log('🚨 DANGER: Starting Supabase data cleanup...')
  console.log('This will DELETE ALL DATA from your Supabase database!')
  
  try {
    // Delete all data from tables in correct order (respecting foreign keys)
    console.log('🗑️  Deleting credit_history...')
    const { error: creditHistoryError } = await supabase
      .from('credit_history')
      .delete()
      .neq('id', 0) // Delete all records
    
    if (creditHistoryError) {
      console.error('❌ Error deleting credit_history:', creditHistoryError)
    } else {
      console.log('✅ Credit history deleted')
    }

    console.log('🗑️  Deleting subscriptions...')
    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .delete()
      .neq('id', 0) // Delete all records
    
    if (subscriptionsError) {
      console.error('❌ Error deleting subscriptions:', subscriptionsError)
    } else {
      console.log('✅ Subscriptions deleted')
    }

    console.log('🗑️  Deleting users...')
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', 0) // Delete all records
    
    if (usersError) {
      console.error('❌ Error deleting users:', usersError)
    } else {
      console.log('✅ Users deleted')
    }

    // Reset sequences (auto-increment counters)
    console.log('🔄 Resetting sequences...')
    
    const resetQueries = [
      "SELECT setval('users_id_seq', 1, false);",
      "SELECT setval('subscriptions_id_seq', 1, false);",
      "SELECT setval('credit_history_id_seq', 1, false);"
    ]

    for (const query of resetQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      if (error) {
        console.warn('⚠️  Could not reset sequence:', error.message)
      }
    }

    console.log('✅ Supabase cleanup completed!')
    
  } catch (error) {
    console.error('❌ Supabase cleanup failed:', error)
    throw error
  }
}

async function displayClerkInstructions() {
  console.log('\n🔧 CLERK CLEANUP INSTRUCTIONS:')
  console.log('=====================================')
  console.log('Clerk users must be deleted manually from the Clerk Dashboard:')
  console.log('')
  console.log('1. Go to: https://dashboard.clerk.com/')
  console.log('2. Select your application')
  console.log('3. Navigate to "Users" in the sidebar')
  console.log('4. Select all users and delete them')
  console.log('')
  console.log('OR use the Clerk API (if you have the API key):')
  console.log('curl -X DELETE "https://api.clerk.com/v1/users/{user_id}" \\')
  console.log('  -H "Authorization: Bearer YOUR_CLERK_SECRET_KEY"')
  console.log('')
  console.log('⚠️  WARNING: This will permanently delete all user accounts!')
}

async function confirmAction() {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    readline.question('⚠️  Are you ABSOLUTELY SURE you want to delete ALL data? Type "DELETE ALL DATA" to confirm: ', (answer) => {
      readline.close()
      resolve(answer === 'DELETE ALL DATA')
    })
  })
}

async function main() {
  console.log('🚨 CRITICAL WARNING 🚨')
  console.log('======================')
  console.log('This script will PERMANENTLY DELETE:')
  console.log('• All users from Supabase')
  console.log('• All subscriptions')
  console.log('• All credit history')
  console.log('• All user data')
  console.log('')
  console.log('This action is IRREVERSIBLE!')
  console.log('')

  const confirmed = await confirmAction()
  
  if (!confirmed) {
    console.log('❌ Operation cancelled. No data was deleted.')
    process.exit(0)
  }

  console.log('\n🚨 PROCEEDING WITH DATA DELETION...\n')

  try {
    await cleanSupabaseData()
    await displayClerkInstructions()
    
    console.log('\n✅ DATA CLEANUP COMPLETED!')
    console.log('🔄 Remember to also clean Clerk users manually.')
    
  } catch (error) {
    console.error('\n❌ CLEANUP FAILED:', error)
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main()
}

module.exports = { cleanSupabaseData, displayClerkInstructions }
