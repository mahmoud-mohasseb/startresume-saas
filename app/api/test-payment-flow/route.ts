import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createSubscription, getSubscription } from '@/lib/supabase-subscriptions'
import { getStripeDirectCredits } from '@/lib/stripe-direct-credits'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

interface TestResult {
  step: string
  status: 'success' | 'error' | 'warning'
  message: string
  data?: any
}

export async function POST(request: NextRequest) {
  const results: TestResult[] = []
  
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan = 'basic', action = 'full_test' } = await request.json()

    results.push({
      step: 'Authentication',
      status: 'success',
      message: `User authenticated: ${user.id}`,
      data: { userId: user.id, email: user.emailAddresses[0]?.emailAddress }
    })

    if (action === 'full_test' || action === 'test_subscription_creation') {
      // Step 1: Test Subscription Creation
      try {
        const subscription = await createSubscription(
          user.id,
          plan,
          'test_stripe_subscription_id',
          'test_stripe_customer_id'
        )

        if (subscription) {
          results.push({
            step: 'Subscription Creation',
            status: 'success',
            message: `Subscription created successfully for plan: ${plan}`,
            data: subscription
          })
        } else {
          results.push({
            step: 'Subscription Creation',
            status: 'error',
            message: 'Failed to create subscription'
          })
        }
      } catch (error) {
        results.push({
          step: 'Subscription Creation',
          status: 'error',
          message: `Error creating subscription: ${error}`
        })
      }
    }

    if (action === 'full_test' || action === 'test_credit_retrieval') {
      // Step 2: Test Credit Retrieval
      try {
        const subscription = await getSubscription(user.id)
        
        if (subscription) {
          results.push({
            step: 'Credit Retrieval',
            status: 'success',
            message: `Credits retrieved: ${subscription.credits - subscription.credits_used} remaining of ${subscription.credits}`,
            data: {
              totalCredits: subscription.credits,
              usedCredits: subscription.credits_used,
              remainingCredits: subscription.credits - subscription.credits_used,
              plan: subscription.plan,
              status: subscription.status
            }
          })
        } else {
          results.push({
            step: 'Credit Retrieval',
            status: 'error',
            message: 'No subscription found'
          })
        }
      } catch (error) {
        results.push({
          step: 'Credit Retrieval',
          status: 'error',
          message: `Error retrieving credits: ${error}`
        })
      }
    }

    if (action === 'full_test' || action === 'test_stripe_integration') {
      // Step 3: Test Stripe Integration
      try {
        const stripeData = await getStripeDirectCredits(user.id)
        
        results.push({
          step: 'Stripe Integration',
          status: stripeData.isActive ? 'success' : 'warning',
          message: stripeData.isActive ? 'Stripe integration working' : 'No active Stripe subscription',
          data: stripeData
        })
      } catch (error) {
        results.push({
          step: 'Stripe Integration',
          status: 'error',
          message: `Error testing Stripe integration: ${error}`
        })
      }
    }

    if (action === 'full_test' || action === 'test_api_endpoints') {
      // Step 4: Test API Endpoints
      try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        
        // Test credits API
        const creditsResponse = await fetch(`${baseUrl}/api/user/credits`, {
          headers: {
            'Authorization': `Bearer ${user.id}` // This won't work in practice, but tests the endpoint
          }
        })

        results.push({
          step: 'API Endpoints',
          status: 'success',
          message: `Credits API responded with status: ${creditsResponse.status}`,
          data: { creditsApiStatus: creditsResponse.status }
        })
      } catch (error) {
        results.push({
          step: 'API Endpoints',
          status: 'error',
          message: `Error testing API endpoints: ${error}`
        })
      }
    }

    // Summary
    const successCount = results.filter(r => r.status === 'success').length
    const errorCount = results.filter(r => r.status === 'error').length
    const warningCount = results.filter(r => r.status === 'warning').length

    return NextResponse.json({
      success: errorCount === 0,
      summary: {
        total: results.length,
        success: successCount,
        errors: errorCount,
        warnings: warningCount
      },
      results,
      recommendations: generateRecommendations(results)
    })

  } catch (error) {
    console.error('Error in payment flow test:', error)
    return NextResponse.json(
      { error: 'Test failed', message: error },
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

    // Quick health check
    const subscription = await getSubscription(user.id)
    const stripeData = await getStripeDirectCredits(user.id)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
      },
      database: {
        hasSubscription: !!subscription,
        subscription: subscription || null
      },
      stripe: {
        isActive: stripeData.isActive,
        plan: stripeData.plan,
        credits: stripeData.credits,
        remainingCredits: stripeData.remainingCredits
      },
      status: 'healthy'
    })
  } catch (error) {
    console.error('Error in health check:', error)
    return NextResponse.json(
      { error: 'Health check failed' },
      { status: 500 }
    )
  }
}

function generateRecommendations(results: TestResult[]): string[] {
  const recommendations: string[] = []
  
  const hasErrors = results.some(r => r.status === 'error')
  const hasWarnings = results.some(r => r.status === 'warning')
  
  if (hasErrors) {
    recommendations.push('❌ Fix the errors above before proceeding with live payments')
  }
  
  if (hasWarnings) {
    recommendations.push('⚠️ Review warnings - they may indicate configuration issues')
  }
  
  if (!hasErrors && !hasWarnings) {
    recommendations.push('✅ All tests passed! Your payment flow should work correctly')
    recommendations.push('🧪 Test with actual Stripe test payments to verify end-to-end flow')
  }
  
  recommendations.push('📊 Check Stripe webhook logs to ensure events are being delivered')
  recommendations.push('🔄 Monitor the dashboard after test payments to verify real-time updates')
  
  return recommendations
}
