import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSubscription, deductCredits } from '@/lib/supabase-subscriptions'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { feature, amount = 1 } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
    }

    console.log(`💳 Consuming ${amount} credits for ${feature} by user ${user.id}`)

    // Get current subscription from database
    const subscription = await getSubscription(user.id)
    
    if (!subscription) {
      return NextResponse.json({
        success: false,
        error: 'No active subscription found',
        currentCredits: 0,
        requiredCredits: amount
      }, { status: 402 })
    }
    
    if (subscription.credits < amount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        currentCredits: subscription.credits,
        requiredCredits: amount
      }, { status: 402 })
    }

    // Deduct credits using database
    const deductResult = await deductCredits(
      user.id,
      feature,
      amount,
      `Consumed ${amount} credits for ${feature}`
    )

    if (!deductResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to consume credits',
        currentCredits: deductResult.remainingCredits,
        requiredCredits: amount
      }, { status: 500 })
    }

    console.log(`✅ Credits consumed: ${subscription.credits} → ${deductResult.remainingCredits} for user ${user.id}`)

    // Return subscription format that matches SubscriptionContext expectations
    return NextResponse.json({
      success: true,
      message: `Consumed ${amount} credits for ${feature}`,
      subscription: {
        planName: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1),
        plan: subscription.plan,
        isActive: subscription.status === 'active',
        totalCredits: subscription.credits + amount, // Original total before deduction
        usedCredits: (subscription.credits + amount) - deductResult.remainingCredits,
        remainingCredits: deductResult.remainingCredits
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
