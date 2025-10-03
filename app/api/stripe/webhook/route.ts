import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { 
  createSubscription, 
  getSubscription, 
  refreshMonthlyCredits, 
  updateSubscriptionStatus,
  cancelSubscription,
  syncCreditsWithStripe 
} from '@/lib/supabase-subscriptions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Plan configurations matching Stripe price IDs
const STRIPE_PLANS: Record<string, { credits: number; name: string }> = {
  'price_1S7dpfFlaHFpdvA4YJj1omFc': { credits: 10, name: 'Basic' },
  'price_1S7drgFlaHFpdvA4EaEaCtrA': { credits: 50, name: 'Standard' },
  'price_1S7dsBFlaHFpdvA42nBRrxgZ': { credits: 200, name: 'Pro' }
}

function getPlanCredits(subscription: Stripe.Subscription): number {
  const priceId = subscription.items.data[0]?.price.id
  return STRIPE_PLANS[priceId]?.credits || 0
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    console.log('Stripe webhook event:', event.type)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          const clerkUserId = session.metadata?.clerk_user_id
          const planId = session.metadata?.plan_id as 'basic' | 'standard' | 'pro'
          
          if (clerkUserId && planId) {
            console.log('Creating subscription for user:', clerkUserId, 'plan:', planId)
            
            await createSubscription(
              clerkUserId,
              planId,
              session.subscription as string,
              session.customer as string
            )
            
            console.log('Subscription created successfully')
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const clerkUserId = subscription.metadata?.clerk_user_id
        
        if (clerkUserId) {
          console.log('Subscription updated for user:', clerkUserId, 'status:', subscription.status)
          
          // Update subscription status in database
          await updateSubscriptionStatus(clerkUserId, subscription.status as 'active' | 'canceled' | 'past_due')
          
          // Handle subscription status changes
          if (subscription.status === 'active') {
            // Refresh credits if subscription becomes active
            await refreshMonthlyCredits(clerkUserId)
          } else if (subscription.status === 'canceled' || subscription.status === 'past_due') {
            // Don't automatically restart - let user manually reactivate
            console.log('Subscription canceled/past_due - preventing auto-restart')
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const clerkUserId = subscription.metadata?.clerk_user_id
        
        if (clerkUserId) {
          console.log('Subscription deleted for user:', clerkUserId)
          
          // Cancel subscription in database
          await cancelSubscription(clerkUserId)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          
          const clerkUserId = subscription.metadata?.clerk_user_id
          
          if (clerkUserId) {
            console.log('Payment succeeded, refreshing credits for user:', clerkUserId)
            
            // Update subscription status to active
            await updateSubscriptionStatus(clerkUserId, 'active')
            
            // Refresh monthly credits on successful payment
            await refreshMonthlyCredits(clerkUserId)
            
            // Sync credits to ensure consistency
            const planCredits = getPlanCredits(subscription)
            if (planCredits > 0) {
              await syncCreditsWithStripe(clerkUserId, planCredits, true)
            }
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          
          const clerkUserId = subscription.metadata?.clerk_user_id
          
          if (clerkUserId) {
            console.log('Payment failed for user:', clerkUserId)
            
            // Update subscription status to past_due
            await updateSubscriptionStatus(clerkUserId, 'past_due')
            
            // Don't automatically cancel - give user chance to update payment
            console.log('Subscription marked as past_due - user can update payment method')
          }
        }
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
