import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking subscription state')
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('👤 User ID:', user.id)
    console.log('📧 User email:', user.emailAddresses[0]?.emailAddress)

    // Check all possible subscription records
    const { data: allSubs, error: allSubsError } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('*')
      .or(`user_id.eq.${user.id}`)

    console.log('📊 All subscriptions for user:', allSubs?.length || 0)
    
    // Also check if there are any subscriptions with similar user_id patterns
    const { data: similarSubs, error: similarError } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('*')
      .ilike('user_id', `%${user.id.slice(-8)}%`)

    console.log('🔍 Similar user_id subscriptions:', similarSubs?.length || 0)

    // Check users table
    const { data: dbUsers, error: usersError } = await getSupabaseAdmin()
      .from('users')
      .select('*')
      .eq('clerk_id', user.id)

    console.log('👥 Database users:', dbUsers?.length || 0)

    // Get recent analytics events
    const { data: events, error: eventsError } = await getSupabaseAdmin()
      .from('analytics_events')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    console.log('📈 Recent events:', events?.length || 0)

    return NextResponse.json({
      debug: true,
      user: {
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName
      },
      subscriptions: {
        direct: allSubs || [],
        similar: similarSubs || [],
        errors: {
          allSubs: allSubsError?.message,
          similar: similarError?.message
        }
      },
      users: {
        records: dbUsers || [],
        error: usersError?.message
      },
      events: {
        recent: events || [],
        error: eventsError?.message
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
