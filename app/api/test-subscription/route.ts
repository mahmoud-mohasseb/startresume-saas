import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSubscription, createSubscription, refreshMonthlyCredits } from '@/lib/supabase-subscriptions'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await getSubscription(user.id)
    
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
      },
      subscription: subscription || null,
      message: subscription ? 'Subscription found' : 'No active subscription'
    })
  } catch (error) {
    console.error('Error getting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, plan } = await request.json()

    if (action === 'create_test_subscription') {
      // Create a test subscription for development
      const subscription = await createSubscription(
        user.id,
        plan || 'basic',
        'test_subscription_id',
        'test_customer_id'
      )

      if (subscription) {
        await refreshMonthlyCredits(user.id)
        return NextResponse.json({
          success: true,
          subscription,
          message: 'Test subscription created successfully'
        })
      } else {
        return NextResponse.json(
          { error: 'Failed to create test subscription' },
          { status: 500 }
        )
      }
    }

    if (action === 'refresh_credits') {
      const success = await refreshMonthlyCredits(user.id)
      return NextResponse.json({
        success,
        message: success ? 'Credits refreshed successfully' : 'Failed to refresh credits'
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in test subscription endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
