import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSubscription, deductCredits } from '@/lib/supabase-subscriptions'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { credits, feature = 'general_usage' } = await request.json()

    if (!credits || credits <= 0) {
      return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
    }

    console.log(`💳 Consuming ${credits} credits for user ${user.id}`)

    // Get current subscription from database
    const subscription = await getSubscription(user.id)
    
    if (!subscription) {
      return NextResponse.json({
        success: false,
        error: 'No active subscription found',
        currentCredits: 0,
        requiredCredits: credits
      }, { status: 402 })
    }
    
    if (subscription.credits < credits) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        currentCredits: subscription.credits,
        requiredCredits: credits
      }, { status: 402 })
    }

    // Actually deduct the credits using database
    const deductResult = await deductCredits(
      user.id,
      feature,
      credits,
      `Consumed ${credits} credits for ${feature}`
    )

    if (!deductResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to consume credits',
        currentCredits: deductResult.remainingCredits,
        requiredCredits: credits
      }, { status: 500 })
    }

    console.log(`✅ Credits updated: ${subscription.credits} → ${deductResult.remainingCredits} for user ${user.id}`)

    return NextResponse.json({
      success: true,
      message: `Consumed ${credits} credits`,
      subscription: {
        remainingCredits: deductResult.remainingCredits,
        creditsUsed: credits
      }
    })

  } catch (error) {
    console.error('❌ Error consuming credits:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to retrieve current credits
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get current subscription from database
    const subscription = await getSubscription(user.id)
    
    const currentCredits = subscription?.credits || 0

    return NextResponse.json({
      success: true,
      credits: currentCredits,
      userId: user.id,
      subscription: subscription ? {
        plan: subscription.plan,
        status: subscription.status,
        remainingCredits: subscription.credits
      } : null
    })

  } catch (error) {
    console.error('❌ Error getting credits:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
