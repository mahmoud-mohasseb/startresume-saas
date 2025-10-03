import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { CreditSyncService } from '@/lib/credit-sync-service'
import { getStripeDirectCredits } from '@/lib/stripe-direct-credits'
import { getSubscription } from '@/lib/supabase-subscriptions'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { forceSync = false } = await request.json().catch(() => ({}))

    console.log(`=== CREDIT SYNC REQUEST ===`)
    console.log(`User ID: ${user.id}, Force Sync: ${forceSync}`)

    // Use the new credit sync service
    const syncResult = await CreditSyncService.syncUserCredits(user.id, forceSync)
    
    // Get updated data after sync
    const [stripeData, dbSubscription] = await Promise.all([
      getStripeDirectCredits(user.id),
      getSubscription(user.id)
    ])

    console.log(`Sync result:`, syncResult)

    return NextResponse.json({
      success: syncResult.success,
      message: syncResult.message,
      syncDetails: {
        discrepancyFound: syncResult.discrepancyFound,
        beforeSync: syncResult.beforeSync,
        afterSync: syncResult.afterSync
      },
      currentState: {
        credits: stripeData.remainingCredits,
        plan: stripeData.plan,
        planName: stripeData.planName,
        status: stripeData.status,
        isActive: stripeData.isActive
      },
      subscription: dbSubscription ? {
        plan: dbSubscription.plan,
        credits: dbSubscription.credits,
        status: dbSubscription.status,
        stripeSubscriptionId: dbSubscription.stripe_subscription_id
      } : null
    })

  } catch (error) {
    console.error('Error syncing credits:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to sync credits', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
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

    // Get current credits and validate consistency
    const [stripeData, dbSubscription, validation] = await Promise.all([
      getStripeDirectCredits(user.id),
      getSubscription(user.id),
      CreditSyncService.validateCreditConsistency(user.id)
    ])

    return NextResponse.json({
      success: true,
      currentState: {
        credits: stripeData.remainingCredits,
        plan: stripeData.plan,
        planName: stripeData.planName,
        status: stripeData.status,
        isActive: stripeData.isActive
      },
      subscription: dbSubscription ? {
        plan: dbSubscription.plan,
        credits: dbSubscription.credits,
        status: dbSubscription.status,
        stripeSubscriptionId: dbSubscription.stripe_subscription_id
      } : null,
      validation: {
        isConsistent: validation.isConsistent,
        issues: validation.issues,
        recommendations: validation.recommendations
      }
    })

  } catch (error) {
    console.error('Error getting credits:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get credits', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
