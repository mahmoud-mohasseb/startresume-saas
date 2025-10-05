import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createSubscription, getSubscription } from '@/lib/supabase-subscriptions'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan = 'basic' } = await request.json()

    console.log(`Manually creating subscription for user: ${user.id}, plan: ${plan}`)

    // Create subscription
    const subscription = await createSubscription(
      user.id,
      plan,
      'manual_subscription_id',
      'manual_customer_id'
    )

    if (subscription) {
      return NextResponse.json({
        success: true,
        subscription,
        message: `Subscription created successfully for plan: ${plan}`
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to create subscription' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in fix subscription endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
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
