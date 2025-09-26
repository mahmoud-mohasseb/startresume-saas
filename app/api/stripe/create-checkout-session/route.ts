import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { findOrCreateStripeCustomer } from '@/lib/stripe-direct-credits'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

const PLAN_PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID!,
  standard: process.env.STRIPE_STANDARD_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
}

// Plan details for metadata
const PLAN_DETAILS = {
  basic: { name: 'Basic', credits: 10, price: 9.99 },
  standard: { name: 'Standard', credits: 50, price: 19.99 },
  pro: { name: 'Pro', credits: 200, price: 49.99 },
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planId, successUrl, cancelUrl } = await request.json()

    if (!planId || !PLAN_PRICE_IDS[planId as keyof typeof PLAN_PRICE_IDS]) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 })
    }

    const priceId = PLAN_PRICE_IDS[planId as keyof typeof PLAN_PRICE_IDS]
    const planDetails = PLAN_DETAILS[planId as keyof typeof PLAN_DETAILS]

    console.log('🛒 Creating checkout session for:', {
      userId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      planId,
      priceId,
      planDetails
    })

    // Find or create Stripe customer with proper metadata
    const customerId = await findOrCreateStripeCustomer(
      user.id,
      user.emailAddresses[0]?.emailAddress || `${user.id}@temp.com`
    )

    console.log('✅ Using Stripe customer:', customerId)

    // Create checkout session with comprehensive metadata
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&plan=${planId}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/billing?canceled=true`,
      metadata: {
        clerk_user_id: user.id,
        plan_id: planId,
        plan_name: planDetails.name,
        credits: planDetails.credits.toString(),
        price: planDetails.price.toString()
      },
      subscription_data: {
        metadata: {
          clerk_user_id: user.id,
          plan_id: planId,
          plan_name: planDetails.name,
          credits: planDetails.credits.toString(),
          price: planDetails.price.toString()
        },
      },
    })

    console.log('✅ Checkout session created:', {
      sessionId: session.id,
      url: session.url,
      customerId: session.customer,
      metadata: session.metadata
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
