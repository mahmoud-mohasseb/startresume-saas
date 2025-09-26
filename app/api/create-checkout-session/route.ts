import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

// In production, you would use actual Stripe
// For now, we'll simulate the checkout process
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, userId, userEmail } = body

    console.log(`💳 Creating checkout session for plan: ${planId}, user: ${userId}`)

    // Plan configurations
    const planConfigs = {
      basic: { 
        name: 'Basic Plan', 
        price: 9.99, 
        credits: 10,
        priceId: 'price_basic_monthly' // Stripe price ID
      },
      standard: { 
        name: 'Standard Plan', 
        price: 19.99, 
        credits: 50,
        priceId: 'price_standard_monthly' // Stripe price ID
      },
      pro: { 
        name: 'Pro Plan', 
        price: 49.99, 
        credits: 200,
        priceId: 'price_pro_monthly' // Stripe price ID
      }
    }

    const selectedPlan = planConfigs[planId as keyof typeof planConfigs]
    if (!selectedPlan) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    // SIMULATION: In production, you would create actual Stripe checkout session
    // For development/testing, we'll simulate successful payment
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 DEVELOPMENT MODE: Simulating successful payment')
      
      // Simulate successful payment by immediately activating the plan
      const activatedPlan = {
        plan: planId,
        planName: selectedPlan.name,
        credits: selectedPlan.credits,
        usedCredits: 0,
        remainingCredits: selectedPlan.credits,
        status: 'active',
        isActive: true,
        lastUpdated: new Date().toISOString(),
        stripeSubscription: true,
        paymentCompleted: true
      }

      // Return success URL that will handle the plan activation
      const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/payment-success?plan=${planId}&credits=${selectedPlan.credits}`
      
      return NextResponse.json({
        success: true,
        checkoutUrl: successUrl,
        message: 'Checkout session created (simulated)',
        plan: activatedPlan
      })
    }

    // PRODUCTION: Actual Stripe integration
    // Uncomment and configure when ready for production
    /*
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/plans`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
        planId: planId,
        credits: selectedPlan.credits.toString()
      }
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    })
    */

    // Fallback for production without Stripe configured
    return NextResponse.json({
      success: false,
      error: 'Stripe not configured. Please set up Stripe integration.'
    }, { status: 500 })

  } catch (error) {
    console.error('❌ Checkout session creation error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
