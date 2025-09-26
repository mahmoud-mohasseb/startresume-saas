import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

// Simple in-memory storage for demo purposes (same as consume endpoint)
declare global {
  var userCredits: Map<string, number> | undefined
}

const userCredits = globalThis.userCredits || new Map<string, number>()
globalThis.userCredits = userCredits

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }


    // Get current credits from in-memory storage (default to 3 for free plan)
    const currentCredits = userCredits.get(user.id) || 3
    const totalCredits = 3 // Free plan default
    const usedCredits = totalCredits - currentCredits

    // Build response in the expected format
    const response = {
      subscription: {
        plan: 'free',
        planName: 'Free',
        totalCredits: totalCredits,
        usedCredits: usedCredits,
        remainingCredits: currentCredits,
        isActive: true,
        status: 'free',
        lastUpdated: new Date().toISOString(),
        stripeSubscription: false,
        paymentCompleted: false
      },
      plan: {
        name: 'Free',
        price: 0,
        features: [
          'Resume Generation',
          'Job Tailoring',
          'Cover Letter Generation',
          'AI Suggestions (Limited)',
          'Basic Templates',
          'PDF Export'
        ]
      },
      analytics: {
        totalUsed: usedCredits,
        usageByAction: {},
        usageByDay: {},
        recentUsage: []
      }
    }

    console.log(`📊 Credits API response for ${user.id}:`, {
      total: totalCredits,
      used: usedCredits,
      remaining: currentCredits
    })

    return NextResponse.json(response)

  } catch (error) {
    console.error('❌ Error in credits API:', error)
    
    // Return safe fallback for free users
    return NextResponse.json({
      subscription: {
        plan: 'free',
        planName: 'Free',
        totalCredits: 3,
        usedCredits: 0,
        remainingCredits: 3,
        isActive: true,
        status: 'free',
        lastUpdated: new Date().toISOString(),
        stripeSubscription: false,
        paymentCompleted: false
      },
      plan: {
        name: 'Free',
        price: 0,
        features: [
          'Resume Generation',
          'Job Tailoring',
          'Cover Letter Generation',
          'AI Suggestions (Limited)',
          'Basic Templates',
          'PDF Export'
        ]
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
