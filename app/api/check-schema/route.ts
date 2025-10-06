import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Check subscriptions table schema
    const { data: subscriptionsSchema, error: schemaError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1)

    if (schemaError) {
      console.error('Schema error:', schemaError)
    }

    // Check if subscriptions table exists and get a sample row
    const { data: sampleSubscription, error: sampleError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1)
      .single()

    // Get table information from information_schema
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'subscriptions' })
      .catch(() => null) // This RPC might not exist

    return NextResponse.json({
      subscriptions: {
        schema_check: schemaError ? 'error' : 'success',
        schema_error: schemaError,
        sample_data: sampleSubscription,
        sample_error: sampleError,
        table_info: tableInfo || 'RPC not available'
      },
      recommendations: [
        'Check if credits_used column exists',
        'Verify user_id column type (UUID vs TEXT)',
        'Ensure proper indexes are in place'
      ]
    })

  } catch (error) {
    console.error('Error checking schema:', error)
    return NextResponse.json(
      { error: 'Failed to check schema', details: error },
      { status: 500 }
    )
  }
}
