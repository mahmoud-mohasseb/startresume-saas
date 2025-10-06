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

    const { action, plan = 'standard' } = await request.json()

    if (action === 'create_subscription_simple') {
      // Create a simple subscription record that works with current schema
      const subscriptionData = {
        user_id: user.id,
        plan: plan,
        credits: plan === 'basic' ? 10 : plan === 'standard' ? 50 : 200,
        status: 'active',
        stripe_customer_id: 'manual_customer_' + Date.now(),
        stripe_subscription_id: 'manual_sub_' + Date.now(),
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('Creating simple subscription:', subscriptionData)

      // Try to insert without credits_used column
      const { data, error } = await supabase
        .from('subscriptions')
        .upsert(subscriptionData, {
          onConflict: 'user_id'
        })
        .select()

      if (error) {
        console.error('Error creating subscription:', error)
        return NextResponse.json({
          success: false,
          error: error.message,
          details: error,
          attempted_data: subscriptionData
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        subscription: data,
        message: 'Subscription created successfully'
      })
    }

    if (action === 'check_schema') {
      // Check what columns exist in subscriptions table
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .limit(1)

      return NextResponse.json({
        schema_check: error ? 'error' : 'success',
        error: error,
        sample_data: data,
        message: 'Schema check completed'
      })
    }

    if (action === 'create_credit_history') {
      // Create credit history table if it doesn't exist
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS credit_history (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id TEXT NOT NULL,
          action TEXT NOT NULL,
          credits_used INTEGER NOT NULL,
          remaining_credits INTEGER NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_credit_history_user_id ON credit_history(user_id);
      `

      // Note: This would need to be run in Supabase SQL editor
      return NextResponse.json({
        success: false,
        message: 'Run this SQL in your Supabase SQL editor:',
        sql: createTableSQL
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error in fix database schema:', error)
    return NextResponse.json(
      { error: 'Failed to fix schema', details: error },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Check if credit_history table exists and get usage
    const { data: creditHistory, error: historyError } = await supabase
      .from('credit_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress
      },
      subscription: {
        found: !subError,
        data: subscription,
        error: subError
      },
      credit_history: {
        found: !historyError,
        data: creditHistory,
        error: historyError
      },
      recommendations: [
        subscription ? '✅ Subscription exists' : '❌ No subscription found - use create_subscription_simple',
        creditHistory ? '✅ Credit history exists' : '❌ No credit history - create credit_history table',
        'Use POST with action: create_subscription_simple to create a working subscription'
      ]
    })

  } catch (error) {
    console.error('Error checking database:', error)
    return NextResponse.json(
      { error: 'Failed to check database', details: error },
      { status: 500 }
    )
  }
}
