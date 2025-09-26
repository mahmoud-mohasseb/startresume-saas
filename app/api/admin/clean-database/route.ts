import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This is a DANGEROUS endpoint - only use in development!
export async function POST(request: NextRequest) {
  try {
    // Security check - only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Database cleanup not allowed in production' },
        { status: 403 }
      )
    }

    // Additional security - require admin key
    const { adminKey } = await request.json()
    if (adminKey !== process.env.ADMIN_CLEANUP_KEY) {
      return NextResponse.json(
        { error: 'Invalid admin key' },
        { status: 401 }
      )
    }

    // Initialize Supabase client with service role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    console.log('🧹 Starting database cleanup...')

    // Step 1: Clean credit_history
    const { error: creditHistoryError } = await supabase
      .from('credit_history')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all rows

    if (creditHistoryError) {
      console.error('Error cleaning credit_history:', creditHistoryError)
    } else {
      console.log('✅ Cleaned credit_history table')
    }

    // Step 2: Clean feature_usage (if exists)
    try {
      const { error: featureUsageError } = await supabase
        .from('feature_usage')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (featureUsageError && !featureUsageError.message.includes('does not exist')) {
        console.error('Error cleaning feature_usage:', featureUsageError)
      } else {
        console.log('✅ Cleaned feature_usage table')
      }
    } catch (error) {
      console.log('ℹ️  feature_usage table does not exist, skipping...')
    }

    // Step 3: Clean subscriptions
    const { error: subscriptionsError } = await supabase
      .from('subscriptions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (subscriptionsError) {
      console.error('Error cleaning subscriptions:', subscriptionsError)
    } else {
      console.log('✅ Cleaned subscriptions table')
    }

    // Step 4: Clean users
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')

    if (usersError) {
      console.error('Error cleaning users:', usersError)
    } else {
      console.log('✅ Cleaned users table')
    }

    // Step 5: Clean any additional tables you might have
    const additionalTables = ['resumes', 'cover_letters', 'job_applications']
    
    for (const tableName of additionalTables) {
      try {
        const { error } = await supabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000')

        if (error && !error.message.includes('does not exist')) {
          console.error(`Error cleaning ${tableName}:`, error)
        } else if (!error) {
          console.log(`✅ Cleaned ${tableName} table`)
        }
      } catch (error) {
        console.log(`ℹ️  ${tableName} table does not exist, skipping...`)
      }
    }

    // Step 6: Verify cleanup by counting rows
    const verificationResults = []
    
    const tables = ['users', 'subscriptions', 'credit_history']
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        if (!error) {
          verificationResults.push({
            table,
            rowCount: count || 0
          })
        }
      } catch (error) {
        console.log(`Could not verify ${table}:`, error)
      }
    }

    console.log('🧹 Database cleanup completed!')
    console.log('📊 Verification results:', verificationResults)

    return NextResponse.json({
      success: true,
      message: 'Database cleaned successfully',
      verification: verificationResults,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Database cleanup failed:', error)
    
    return NextResponse.json(
      { 
        error: 'Database cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check cleanup status
export async function GET() {
  try {
    // Security check - only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Database cleanup not allowed in production' },
        { status: 403 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const tables = ['users', 'subscriptions', 'credit_history']
    const counts = []

    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })

        counts.push({
          table,
          rowCount: count || 0,
          error: error?.message || null
        })
      } catch (error) {
        counts.push({
          table,
          rowCount: 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      environment: process.env.NODE_ENV,
      tableCounts: counts,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check database status' },
      { status: 500 }
    )
  }
}
