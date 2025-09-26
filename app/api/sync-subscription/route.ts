import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { updateUserSubscription, SUBSCRIPTION_PLANS } from '@/lib/subscription-manager'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Manual subscription sync requested')
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Get all Stripe subscriptions for this user
    const customers = await stripe.customers.list({
      email: user.emailAddresses[0]?.emailAddress,
      limit: 10
    })

    console.log('📧 Found customers:', customers.data.length)

    if (customers.data.length === 0) {
      return NextResponse.json({
        error: 'No Stripe customer found',
        message: 'Please complete a payment first'
      }, { status: 404 })
    }

    // Get the most recent customer
    const customer = customers.data[0]
    console.log('👤 Using customer:', customer.id)

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10
    })

    console.log('📋 Found active subscriptions:', subscriptions.data.length)

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        error: 'No active subscription found',
        message: 'Please subscribe to a plan first'
      }, { status: 404 })
    }

    // Use the most recent subscription
    const subscription = subscriptions.data[0]
    console.log('🎯 Using subscription:', subscription.id)

    // Determine plan from price ID
    const priceId = subscription.items.data[0]?.price.id
    const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === priceId)

    if (!plan) {
      return NextResponse.json({
        error: 'Unknown subscription plan',
        message: `Price ID ${priceId} not recognized`
      }, { status: 400 })
    }

    console.log('✅ Found plan:', plan.id, 'with', plan.credits, 'credits')

    // Update the subscription in our database
    const updatedSubscription = await updateUserSubscription(user.id, plan.id, {
      customerId: customer.id,
      subscriptionId: subscription.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
    })

    console.log('✅ Subscription synced successfully:', {
      id: updatedSubscription.id,
      plan: updatedSubscription.plan,
      credits: updatedSubscription.credits,
      status: updatedSubscription.status
    })

    return NextResponse.json({
      success: true,
      message: 'Subscription synced successfully',
      subscription: {
        plan: updatedSubscription.plan,
        credits: updatedSubscription.credits,
        status: updatedSubscription.status,
        remainingCredits: updatedSubscription.credits - (updatedSubscription.credits_used || 0)
      }
    })

  } catch (error) {
    console.error('❌ Sync error:', error)
    return NextResponse.json({
      error: 'Sync failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
