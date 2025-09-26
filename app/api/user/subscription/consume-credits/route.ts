import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

// Import the same storage from parent route
// In production, this would be in your database
declare global {
  var userCredits: Map<string, number> | undefined
}

// Use global storage to persist across API calls
const userCredits = globalThis.userCredits || new Map<string, number>()
globalThis.userCredits = userCredits

// Initialize user with default credits if not exists
function initializeUserCredits(userId: string): number {
  if (!userCredits.has(userId)) {
    userCredits.set(userId, 50) // Default 50 credits
  }
  return userCredits.get(userId)!
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { credits } = await request.json()

    if (!credits || credits <= 0) {
      return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
    }

    console.log(`💳 Consuming ${credits} credits for user ${user.id}`)

    // Get current user credits (initialize if first time)
    const currentCredits = initializeUserCredits(user.id)
    
    if (currentCredits < credits) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        currentCredits,
        requiredCredits: credits
      }, { status: 402 })
    }

    // Actually deduct the credits
    const newRemainingCredits = currentCredits - credits
    userCredits.set(user.id, newRemainingCredits)

    console.log(`✅ Credits updated: ${currentCredits} → ${newRemainingCredits} for user ${user.id}`)

    return NextResponse.json({
      success: true,
      message: `Consumed ${credits} credits`,
      subscription: {
        remainingCredits: newRemainingCredits,
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

// Export function to get current credits (for other APIs to use)
export function getCurrentUserCredits(userId: string): number {
  return initializeUserCredits(userId)
}
