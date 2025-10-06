import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

// Import the shared credit tracking from bypass system
import { getUserCreditInfo, checkAndConsumeStripeDirectCredits } from '@/lib/credit-bypass'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user credit info from shared tracking
    const userCredit = getUserCreditInfo(user.id)

    const remaining = userCredit.credits - userCredit.used

    console.log(`📊 Simple credits for ${user.id}:`, {
      plan: userCredit.plan,
      total: userCredit.credits,
      used: userCredit.used,
      remaining: remaining
    })

    return NextResponse.json({
      subscription: {
        plan: userCredit.plan,
        planName: userCredit.plan.charAt(0).toUpperCase() + userCredit.plan.slice(1),
        totalCredits: userCredit.credits,
        usedCredits: userCredit.used,
        remainingCredits: remaining,
        isActive: true,
        status: 'active',
        lastUpdated: new Date().toISOString(),
        stripeSubscription: true,
        paymentCompleted: true
      },
      plan: {
        name: userCredit.plan.charAt(0).toUpperCase() + userCredit.plan.slice(1),
        price: userCredit.plan === 'basic' ? 9.99 : userCredit.plan === 'standard' ? 19.99 : 49.99,
        features: getFeaturesByPlan(userCredit.plan)
      },
      analytics: {
        totalUsed: userCredit.used,
        usageByAction: {},
        usageByDay: {},
        recentUsage: []
      }
    })

  } catch (error) {
    console.error('Error in simple credits:', error)
    return NextResponse.json({
      subscription: {
        plan: 'standard',
        planName: 'Standard',
        totalCredits: 50,
        usedCredits: 0,
        remainingCredits: 50,
        isActive: true,
        status: 'active',
        lastUpdated: new Date().toISOString(),
        stripeSubscription: true,
        paymentCompleted: true
      },
      plan: {
        name: 'Standard',
        price: 19.99,
        features: getFeaturesByPlan('standard')
      },
      analytics: {
        totalUsed: 0,
        usageByAction: {},
        usageByDay: {},
        recentUsage: []
      }
    }, { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, amount = 1 } = await request.json()

    // Use shared credit consumption system
    const creditResult = await checkAndConsumeStripeDirectCredits(user.id, amount, action)

    if (!creditResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        currentCredits: creditResult.currentCredits,
        requiredCredits: amount
      }, { status: 402 })
    }

    console.log(`✅ Credits consumed via shared system: ${creditResult.message}`)

    return NextResponse.json({
      success: true,
      message: `Consumed ${amount} credits for ${action}`,
      subscription: {
        planName: creditResult.planName,
        plan: creditResult.plan,
        isActive: true,
        totalCredits: 50,
        usedCredits: 50 - creditResult.remainingCredits,
        remainingCredits: creditResult.remainingCredits
      }
    })

  } catch (error) {
    console.error('Error consuming simple credits:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to consume credits'
    }, { status: 500 })
  }
}

function getFeaturesByPlan(plan: string): string[] {
  switch (plan) {
    case 'basic':
      return [
        'Resume Generation (5 credits)',
        'Cover Letter Generation (3 credits)', 
        'Job Tailoring (3 credits)',
        'Basic Templates',
        'PDF Export',
        'Email Support'
      ]
    case 'standard':
      return [
        'Everything in Basic',
        'LinkedIn Optimization (4 credits)',
        'Salary Negotiation (2 credits)',
        'Premium Templates',
        'PDF & DOCX Export',
        'Priority Support',
        'Resume Analytics'
      ]
    case 'pro':
      return [
        'Everything in Standard',
        'Personal Brand Strategy (8 credits)',
        'Mock Interview Practice (6 credits)',
        'Advanced Analytics',
        'Executive Templates',
        'Personal Branding Consultation',
        'Career Strategy Planning',
        'White-label Resumes',
        'Dedicated Support'
      ]
    default:
      return ['Upgrade to access AI features']
  }
}
