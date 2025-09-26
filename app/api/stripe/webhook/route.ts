import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSubscription, getSubscription, refreshMonthlyCredits } from '@/lib/supabase-subscriptions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

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
          console.log('Subscription updated for user:', clerkUserId)
          
          // Handle subscription status changes
          if (subscription.status === 'active') {
            // Refresh credits if subscription becomes active
            await refreshMonthlyCredits(clerkUserId)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const clerkUserId = subscription.metadata?.clerk_user_id
        
        if (clerkUserId) {
          console.log('Subscription canceled for user:', clerkUserId)
          
          // Update subscription status in database
          // Note: You might want to implement a function to update subscription status
          // For now, we'll just log it
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
            
            // Refresh monthly credits on successful payment
            await refreshMonthlyCredits(clerkUserId)
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
            
            // Handle payment failure - you might want to send an email
            // or update subscription status
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
