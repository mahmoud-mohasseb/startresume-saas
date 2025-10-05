import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
          await handleSubscriptionCreated(session)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        if (invoice.subscription) {
          await handlePaymentSucceeded(invoice)
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

async function handleSubscriptionCreated(session: Stripe.Checkout.Session) {
  try {
    const clerkUserId = session.metadata?.clerk_user_id
    const plan = session.metadata?.plan
    const credits = parseInt(session.metadata?.credits || '0')

    if (!clerkUserId || !plan) {
      console.error('Missing metadata in checkout session:', session.metadata)
      return
    }

    console.log(`Creating subscription for user: ${clerkUserId}, plan: ${plan}, credits: ${credits}`)

    // Create or update subscription directly with clerk_user_id as user_id
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: clerkUserId, // Use clerk_user_id directly as user_id
        plan: plan,
        credits: credits,
        credits_used: 0, // Reset used credits
        status: 'active',
        stripe_subscription_id: session.subscription as string,
        stripe_customer_id: session.customer as string,
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      return
    }

    console.log(`✅ Subscription created successfully for user: ${clerkUserId}`)
  } catch (error) {
    console.error('Error handling subscription creation:', error)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const clerkUserId = subscription.metadata?.clerk_user_id
    
    if (!clerkUserId) {
      console.error('Missing clerk_user_id in subscription metadata')
      return
    }

    console.log(`Updating subscription for user: ${clerkUserId}`)

    // Update subscription status
    const { error } = await supabase
      .from('subscriptions')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription:', error)
      return
    }

    console.log(`✅ Subscription updated successfully for user: ${clerkUserId}`)
  } catch (error) {
    console.error('Error handling subscription update:', error)
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const clerkUserId = subscription.metadata?.clerk_user_id
    
    if (!clerkUserId) {
      console.error('Missing clerk_user_id in subscription metadata')
      return
    }

    console.log(`Deleting subscription for user: ${clerkUserId}`)

    // Delete subscription record
    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error deleting subscription:', error)
      return
    }

    console.log(`✅ Subscription deleted successfully for user: ${clerkUserId}`)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    )
    
    const clerkUserId = subscription.metadata?.clerk_user_id
    const plan = subscription.metadata?.plan
    const credits = parseInt(subscription.metadata?.credits || '0')
    
    if (!clerkUserId || !plan) {
      console.error('Missing metadata in subscription')
      return
    }

    console.log(`Payment succeeded, refreshing credits for user: ${clerkUserId}`)

    // Refresh monthly credits and reset usage
    const { error } = await supabase
      .from('subscriptions')
      .update({
        credits: credits,
        credits_used: 0, // Reset used credits on payment
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', clerkUserId) // Use user_id instead of stripe_subscription_id

    if (error) {
      console.error('Error refreshing credits:', error)
      return
    }

    console.log(`✅ Credits refreshed successfully for user: ${clerkUserId}`)
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

// GET endpoint for webhook verification
export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint',
    status: 'active',
    events: [
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'checkout.session.completed'
    ]
  });
}
