import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan = 'standard' } = await request.json()

    console.log(`🚨 Emergency fix: Creating subscription for user ${user.id}`)

    // First, let's check what columns actually exist in the subscriptions table
    const { data: existingData, error: checkError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1)

    console.log('📋 Existing subscriptions table structure check:', { checkError, sampleData: existingData })

    // Try to create subscription with minimal required fields only
    const subscriptionData: any = {
      user_id: user.id, // This might fail if it expects UUID
      plan: plan,
      credits: plan === 'basic' ? 10 : plan === 'standard' ? 50 : 200,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Add optional fields that might exist
    if (plan === 'standard') {
      subscriptionData.stripe_customer_id = 'emergency_customer_' + Date.now()
      subscriptionData.stripe_subscription_id = 'emergency_sub_' + Date.now()
      subscriptionData.current_period_start = new Date().toISOString()
      subscriptionData.current_period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }

    console.log('📝 Attempting to create subscription with data:', subscriptionData)

    // Try different approaches based on the schema
    let result = null
    let method = ''

    // Method 1: Try with TEXT user_id (direct insert)
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()

      if (!error && data) {
        result = data[0]
        method = 'direct_insert'
        console.log('✅ Method 1 (direct insert) succeeded')
      } else {
        console.log('❌ Method 1 failed:', error)
        throw error
      }
    } catch (insertError: any) {
      console.log('❌ Direct insert failed, trying upsert...')

      // Method 2: Try upsert (might handle conflicts better)
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .upsert(subscriptionData, { onConflict: 'user_id' })
          .select()

        if (!error && data) {
          result = data[0]
          method = 'upsert'
          console.log('✅ Method 2 (upsert) succeeded')
        } else {
          throw error
        }
      } catch (upsertError: any) {
        console.log('❌ Upsert failed, trying without optional fields...')

        // Method 3: Minimal data only
        const minimalData = {
          user_id: user.id,
          plan: plan,
          credits: subscriptionData.credits,
          status: 'active'
        }

        const { data, error } = await supabase
          .from('subscriptions')
          .insert(minimalData)
          .select()

        if (!error && data) {
          result = data[0]
          method = 'minimal_insert'
          console.log('✅ Method 3 (minimal) succeeded')
        } else {
          console.error('❌ All methods failed. Final error:', error)
          return NextResponse.json({
            success: false,
            error: 'Failed to create subscription with any method',
            details: {
              insertError: insertError?.message,
              upsertError: upsertError?.message,
              finalError: error?.message
            },
            schema_issues: [
              'user_id column might expect UUID instead of TEXT',
              'credits_used column is missing from table',
              'Some required columns might be missing'
            ],
            recommendations: [
              'Run the SQL migration to fix schema',
              'Or update Supabase table manually to add missing columns',
              'Check if user_id column type is UUID or TEXT'
            ]
          }, { status: 500 })
        }
      }
    }

    if (result) {
      console.log(`✅ Emergency subscription created using ${method}:`, result)
      
      return NextResponse.json({
        success: true,
        subscription: result,
        method: method,
        message: 'Emergency subscription created successfully',
        next_steps: [
          'Test AI features now',
          'Credits should be available immediately',
          'Consider fixing database schema for long-term solution'
        ]
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Unexpected error - no result returned'
    }, { status: 500 })

  } catch (error) {
    console.error('❌ Emergency fix failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Emergency fix failed',
      details: error,
      message: 'Database schema issues prevent subscription creation'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check current subscription status
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)

    return NextResponse.json({
      user_id: user.id,
      subscription_found: !error && subscription && subscription.length > 0,
      subscription_data: subscription,
      error: error,
      recommendations: subscription && subscription.length > 0 
        ? ['✅ Subscription exists - AI features should work']
        : ['❌ No subscription found - use POST to create emergency subscription']
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check subscription',
      details: error
    }, { status: 500 })
  }
}
