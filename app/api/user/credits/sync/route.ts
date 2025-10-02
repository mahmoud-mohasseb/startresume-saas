import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { 
  forceSyncWithStripe, 
  getStripeDirectCredits, 
  getCurrentUserSubscription,
  logSubscriptionEvent 
} from '@/lib/subscription-manager'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`=== CREDIT SYNC REQUEST ===`)
    console.log(`User ID: ${userId}`)

    // Try Stripe-direct credit check first
    const stripeCredits = await getStripeDirectCredits(userId)
    console.log(`Stripe-direct credits:`, stripeCredits)

    // Force sync with Stripe if needed
    let syncResult = false
    if (stripeCredits.status === 'active' && stripeCredits.credits > 0) {
      syncResult = await forceSyncWithStripe(userId)
      console.log(`Force sync result: ${syncResult}`)
    }

    // Get updated subscription after sync
    const subscription = await getCurrentUserSubscription()
    console.log(`Final subscription:`, subscription)

    // Log the sync attempt
    await logSubscriptionEvent(userId, 'credit_sync_requested', {
      stripeCredits,
      syncResult,
      finalSubscription: subscription
    })

    return NextResponse.json({
      success: true,
      credits: stripeCredits.credits,
      plan: stripeCredits.plan,
      status: stripeCredits.status,
      syncPerformed: syncResult,
      subscription: subscription,
      message: syncResult 
        ? 'Credits synced successfully with Stripe'
        : 'Using current credit balance'
    })

  } catch (error) {
    console.error('Error syncing credits:', error)
    return NextResponse.json(
      { error: 'Failed to sync credits', details: error.message },
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

    // Get current credits without syncing
    const stripeCredits = await getStripeDirectCredits(userId)
    const subscription = await getCurrentUserSubscription()

    return NextResponse.json({
      success: true,
      credits: stripeCredits.credits,
      plan: stripeCredits.plan,
      status: stripeCredits.status,
      subscription: subscription
    })

  } catch (error) {
    console.error('Error getting credits:', error)
    return NextResponse.json(
      { error: 'Failed to get credits', details: error.message },
      { status: 500 }
    )
  }
}
