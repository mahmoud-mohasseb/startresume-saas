import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { getSubscription } from '@/lib/supabase-subscriptions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const userEmail = user.emailAddresses[0]?.emailAddress

    console.log(`🔍 Debugging Stripe for user: ${userId}`)

    const results: any = {
      user: {
        id: userId,
        email: userEmail
      },
      stripe: {
        customerByMetadata: null,
        customerByEmail: null,
        subscriptions: []
      },
      database: {
        subscription: null
      },
      diagnostics: []
    }

    // 1. Search for customer by metadata
    try {
      const customersByMetadata = await stripe.customers.search({
        query: `metadata['clerk_user_id']:'${userId}'`
      })
      
      if (customersByMetadata.data.length > 0) {
        results.stripe.customerByMetadata = {
          id: customersByMetadata.data[0].id,
          email: customersByMetadata.data[0].email,
          metadata: customersByMetadata.data[0].metadata
        }
        results.diagnostics.push('✅ Found customer by metadata')
      } else {
        results.diagnostics.push('❌ No customer found by metadata')
      }
    } catch (error) {
      results.diagnostics.push(`❌ Error searching by metadata: ${error}`)
    }

    // 2. Search for customer by email
    if (userEmail) {
      try {
        const customersByEmail = await stripe.customers.list({
          email: userEmail,
          limit: 5
        })
        
        if (customersByEmail.data.length > 0) {
          results.stripe.customerByEmail = customersByEmail.data.map(customer => ({
            id: customer.id,
            email: customer.email,
            metadata: customer.metadata,
            created: new Date(customer.created * 1000).toISOString()
          }))
          results.diagnostics.push(`✅ Found ${customersByEmail.data.length} customer(s) by email`)
        } else {
          results.diagnostics.push('❌ No customer found by email')
        }
      } catch (error) {
        results.diagnostics.push(`❌ Error searching by email: ${error}`)
      }
    }

    // 3. Get subscriptions if customer exists
    const customerId = results.stripe.customerByMetadata?.id || results.stripe.customerByEmail?.[0]?.id
    if (customerId) {
      try {
        const subscriptions = await stripe.subscriptions.list({
          customer: customerId,
          limit: 10
        })
        
        results.stripe.subscriptions = subscriptions.data.map(sub => ({
          id: sub.id,
          status: sub.status,
          metadata: sub.metadata,
          priceId: sub.items.data[0]?.price.id,
          current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString()
        }))
        
        results.diagnostics.push(`✅ Found ${subscriptions.data.length} subscription(s)`)
      } catch (error) {
        results.diagnostics.push(`❌ Error getting subscriptions: ${error}`)
      }
    }

    // 4. Check database subscription
    try {
      const dbSubscription = await getSubscription(userId)
      if (dbSubscription) {
        results.database.subscription = {
          id: dbSubscription.id,
          plan: dbSubscription.plan,
          credits: dbSubscription.credits,
          credits_used: dbSubscription.credits_used,
          status: dbSubscription.status,
          stripe_customer_id: dbSubscription.stripe_customer_id,
          stripe_subscription_id: dbSubscription.stripe_subscription_id
        }
        results.diagnostics.push('✅ Found database subscription')
      } else {
        results.diagnostics.push('❌ No database subscription found')
      }
    } catch (error) {
      results.diagnostics.push(`❌ Error getting database subscription: ${error}`)
    }

    // 5. Recommendations
    const recommendations = []
    
    if (!results.stripe.customerByMetadata && !results.stripe.customerByEmail) {
      recommendations.push('🔧 No Stripe customer found. User needs to complete a payment first.')
    } else if (!results.stripe.customerByMetadata && results.stripe.customerByEmail) {
      recommendations.push('🔧 Customer exists but missing metadata. Use /api/create-stripe-customer to fix.')
    } else if (results.stripe.subscriptions.length === 0) {
      recommendations.push('🔧 Customer exists but no subscriptions. Check webhook processing.')
    } else if (!results.database.subscription) {
      recommendations.push('🔧 Stripe subscription exists but not in database. Check webhook handlers.')
    } else {
      recommendations.push('✅ Everything looks good!')
    }

    results.recommendations = recommendations

    return NextResponse.json(results)

  } catch (error) {
    console.error('Error in debug endpoint:', error)
    return NextResponse.json(
      { error: 'Debug failed', details: error },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    if (action === 'fix_customer_metadata') {
      const userEmail = user.emailAddresses[0]?.emailAddress
      if (!userEmail) {
        return NextResponse.json({ error: 'No email found' }, { status: 400 })
      }

      // Find customer by email and update metadata
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1
      })

      if (customers.data.length === 0) {
        return NextResponse.json({ error: 'No customer found by email' }, { status: 404 })
      }

      const customer = customers.data[0]
      const updatedCustomer = await stripe.customers.update(customer.id, {
        metadata: {
          ...customer.metadata,
          clerk_user_id: user.id
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Customer metadata updated',
        customer: {
          id: updatedCustomer.id,
          metadata: updatedCustomer.metadata
        }
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Error in debug POST:', error)
    return NextResponse.json(
      { error: 'Action failed', details: error },
      { status: 500 }
    )
  }
}
