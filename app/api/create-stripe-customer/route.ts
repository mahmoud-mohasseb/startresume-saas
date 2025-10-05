import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log(`Creating Stripe customer for user: ${user.id}`)

    // Check if customer already exists
    const existingCustomers = await stripe.customers.search({
      query: `metadata['clerk_user_id']:'${user.id}'`
    })

    if (existingCustomers.data.length > 0) {
      const customer = existingCustomers.data[0]
      return NextResponse.json({
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          metadata: customer.metadata
        },
        message: 'Customer already exists'
      })
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email: user.emailAddresses[0]?.emailAddress,
      name: user.fullName || undefined,
      metadata: {
        clerk_user_id: user.id,
      },
    })

    console.log(`✅ Created Stripe customer: ${customer.id}`)

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        metadata: customer.metadata
      },
      message: 'Customer created successfully'
    })

  } catch (error) {
    console.error('Error creating Stripe customer:', error)
    return NextResponse.json(
      { error: 'Failed to create customer', details: error },
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

    // Search for customer by clerk_user_id
    const customers = await stripe.customers.search({
      query: `metadata['clerk_user_id']:'${user.id}'`
    })

    if (customers.data.length === 0) {
      return NextResponse.json({
        found: false,
        message: 'No Stripe customer found for this user',
        userId: user.id
      })
    }

    const customer = customers.data[0]
    
    // Get subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      limit: 10
    })

    return NextResponse.json({
      found: true,
      customer: {
        id: customer.id,
        email: customer.email,
        metadata: customer.metadata,
        created: new Date(customer.created * 1000).toISOString()
      },
      subscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        plan: sub.metadata?.plan,
        current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
        current_period_end: new Date(sub.current_period_end * 1000).toISOString()
      })),
      message: 'Customer found successfully'
    })

  } catch (error) {
    console.error('Error finding Stripe customer:', error)
    return NextResponse.json(
      { error: 'Failed to find customer', details: error },
      { status: 500 }
    )
  }
}
