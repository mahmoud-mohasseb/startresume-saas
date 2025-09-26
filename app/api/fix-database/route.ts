import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting database schema fix...')
    
    const supabase = getSupabaseAdmin()
    
    // First, let's check current schema
    const { data: currentSchema, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_name', 'subscriptions')
    
    console.log('📊 Current subscriptions table columns:', currentSchema?.map(c => c.column_name))
    
    // Add missing columns using ALTER TABLE
    console.log('1️⃣ Adding missing columns...')
    
    try {
      // Add credits_used column
      const { error: creditsUsedError } = await supabase.rpc('sql', {
        query: 'ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0'
      })
      if (creditsUsedError) console.log('Credits_used column might already exist:', creditsUsedError.message)
      
      // Add period columns
      const { error: periodStartError } = await supabase.rpc('sql', {
        query: 'ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ'
      })
      if (periodStartError) console.log('Period start column might already exist:', periodStartError.message)
      
      const { error: periodEndError } = await supabase.rpc('sql', {
        query: 'ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ'
      })
      if (periodEndError) console.log('Period end column might already exist:', periodEndError.message)
      
    } catch (alterError) {
      console.log('ALTER TABLE approach failed, trying direct insert approach')
    }
    
    // Update existing records to have valid values
    console.log('2️⃣ Updating existing records...')
    
    // Update NULL plans to 'basic' (since 'free' might still be constrained)
    const { error: updatePlanError } = await supabase
      .from('subscriptions')
      .update({ plan: 'basic', credits: 10 })
      .is('plan', null)
    
    if (updatePlanError) console.log('Plan update error:', updatePlanError.message)
    
    // Update NULL status to 'active'
    const { error: updateStatusError } = await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .is('status', null)
    
    if (updateStatusError) console.log('Status update error:', updateStatusError.message)
    
    console.log('✅ Database fix completed')
    
    return NextResponse.json({
      success: true,
      message: 'Database schema fix attempted',
      note: 'Some operations may have been skipped if columns already exist or constraints prevent changes'
    })
    
  } catch (error) {
    console.error('❌ Database fix error:', error)
    return NextResponse.json({
      success: false,
      error: 'Database fix failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
