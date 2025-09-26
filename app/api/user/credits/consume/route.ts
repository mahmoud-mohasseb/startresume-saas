import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

// Simple in-memory storage for demo purposes
declare global {
  var userCredits: Map<string, number> | undefined
}

const userCredits = globalThis.userCredits || new Map<string, number>()
globalThis.userCredits = userCredits

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

    // Get current credits (default to 3 for free plan)
    const currentCredits = userCredits.get(user.id) || 3
    
    if (currentCredits < amount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        currentCredits,
        requiredCredits: amount
      }, { status: 402 })
    }

    // Deduct credits
    const newCredits = currentCredits - amount
    userCredits.set(user.id, newCredits)

    console.log(`✅ Credits consumed: ${currentCredits} → ${newCredits} for user ${user.id}`)

    // Return subscription format that matches SubscriptionContext expectations
    return NextResponse.json({
      success: true,
      message: `Consumed ${amount} credits for ${feature}`,
      subscription: {
        planName: 'Free',
        plan: 'free',
        isActive: true,
        totalCredits: 3,
        usedCredits: 3 - newCredits,
        remainingCredits: newCredits
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
