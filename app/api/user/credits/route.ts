import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getStripeDirectCredits } from '@/lib/stripe-direct-credits'

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
      return [
        'Upgrade to access AI features',
        'Choose from Basic, Standard, or Pro plans',
        'All plans include professional templates',
        'Cancel anytime'
      ]
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // TEMPORARY FIX: Use simple credit system to bypass database schema issues
    console.log('🔧 Using temporary simple credit system due to database schema issues')
    
    const simpleResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/simple-credits`, {
      headers: {
        'Cookie': request.headers.get('Cookie') || ''
      }
    })
    
    if (simpleResponse.ok) {
      const simpleData = await simpleResponse.json()
      console.log('✅ Using simple credit system successfully')
      return NextResponse.json(simpleData)
    }

    // Fallback to original system if simple system fails
    console.log('⚠️ Simple system failed, trying original...')
    
    // Get actual subscription data from Stripe
    const stripeData = await getStripeDirectCredits(user.id)
    
    // Build response in the expected format
    const response = {
      subscription: {
        plan: stripeData.plan,
        planName: stripeData.planName,
        totalCredits: stripeData.credits,
        usedCredits: stripeData.usedCredits,
        remainingCredits: stripeData.remainingCredits,
        isActive: stripeData.isActive,
        status: stripeData.status,
        lastUpdated: new Date().toISOString(),
        stripeSubscription: stripeData.subscriptionId ? true : false,
        paymentCompleted: stripeData.isActive,
        currentPeriodStart: stripeData.currentPeriodStart,
        currentPeriodEnd: stripeData.currentPeriodEnd
      },
      plan: {
        name: stripeData.planName,
        price: stripeData.pricePerMonth,
        features: getFeaturesByPlan(stripeData.plan)
      },
      analytics: {
        totalUsed: stripeData.usedCredits,
        usageByAction: {},
        usageByDay: {},
        recentUsage: []
      }
    }


    console.log(`📊 Credits API response for ${user.id}:`, {
      plan: stripeData.plan,
      total: stripeData.credits,
      used: stripeData.usedCredits,
      remaining: stripeData.remainingCredits
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error in credits API:', error)
    
    // Return safe fallback for free users
    return NextResponse.json({
      subscription: {
        plan: 'free',
        planName: 'Free',
        totalCredits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        isActive: false,
        status: 'free',
        lastUpdated: new Date().toISOString(),
        stripeSubscription: false,
        paymentCompleted: false
      },
      plan: {
        name: 'Free',
        price: 0,
        features: getFeaturesByPlan('free')
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
