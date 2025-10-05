import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Plan configuration with Stripe Price IDs - Updated to match billing page
const PLAN_CONFIG = {
  basic: {
    name: 'Basic Plan',
    priceId: process.env.STRIPE_BASIC_PRICE_ID!,
    credits: 10,
    price: 9.99
  },
  standard: {
    name: 'Standard Plan',
    priceId: process.env.STRIPE_STANDARD_PRICE_ID!,
    credits: 50,
    price: 19.99
  },
  pro: {
    name: 'Pro Plan',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    credits: 200,
    price: 49.99
  }
} as const

type PlanId = keyof typeof PLAN_CONFIG

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json()

    // Validate plan
    if (!plan || !PLAN_CONFIG[plan as PlanId]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const selectedPlan = PLAN_CONFIG[plan as PlanId]

    console.log(`Creating checkout session for user ${user.id}, plan: ${plan}`)

    // Create or retrieve Stripe customer with proper metadata
    let customer: Stripe.Customer
    
    // First, search by clerk_user_id in metadata
    const existingCustomersByMetadata = await stripe.customers.search({
      query: `metadata['clerk_user_id']:'${user.id}'`
    })

    if (existingCustomersByMetadata.data.length > 0) {
      customer = existingCustomersByMetadata.data[0]
      console.log(`Found existing customer by metadata: ${customer.id}`)
    } else {
      // Search by email as fallback
      const existingCustomersByEmail = await stripe.customers.list({
        email: user.emailAddresses[0]?.emailAddress,
        limit: 1,
      })

      if (existingCustomersByEmail.data.length > 0) {
        customer = existingCustomersByEmail.data[0]
        
        // Update existing customer with clerk_user_id metadata
        customer = await stripe.customers.update(customer.id, {
          metadata: {
            ...customer.metadata,
            clerk_user_id: user.id,
          },
        })
        console.log(`Updated existing customer with metadata: ${customer.id}`)
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName || undefined,
          metadata: {
            clerk_user_id: user.id,
          },
        })
        console.log(`Created new customer: ${customer.id}`)
      }
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/?canceled=true`,
      metadata: {
        clerk_user_id: user.id,
        plan: plan,
        credits: selectedPlan.credits.toString(),
      },
      subscription_data: {
        metadata: {
          clerk_user_id: user.id,
          plan: plan,
          credits: selectedPlan.credits.toString(),
        },
      },
      allow_promotion_codes: true,
    })

    console.log(`Checkout session created: ${session.id}`)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
