import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getUserCreditInfo, getUserCredits, checkAndConsumeStripeDirectCredits } from '@/lib/credit-bypass'

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔍 Debug Credits Check for user:', user.id)

    // Get credit info from bypass system
    const creditInfo = getUserCreditInfo(user.id)
    const currentCredits = getUserCredits(user.id)

    // Check localStorage directly (client-side only)
    const debugInfo = {
      user_id: user.id,
      timestamp: new Date().toISOString(),
      credit_info: creditInfo,
      current_credits: currentCredits,
      localStorage_check: 'Server-side - cannot access localStorage',
      system_status: {
        bypass_active: true,
        persistent_storage: true,
        event_system: true
      }
    }

    console.log('📊 Debug Credits Info:', debugInfo)

    return NextResponse.json(debugInfo)

  } catch (error) {
    console.error('❌ Debug credits error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, amount = 1 } = await request.json()

    console.log(`🧪 Debug Credit Consumption: ${amount} credits for ${action}`)

    // Get initial state
    const initialCredits = getUserCredits(user.id)
    
    // Consume credits
    const result = await checkAndConsumeStripeDirectCredits(user.id, amount, action)
    
    // Get final state
    const finalCredits = getUserCredits(user.id)

    const debugResult = {
      user_id: user.id,
      action,
      amount,
      initial_credits: initialCredits,
      final_credits: finalCredits,
      credits_deducted: initialCredits - finalCredits,
      consumption_result: result,
      success: result.success,
      timestamp: new Date().toISOString()
    }

    console.log('🧪 Debug Credit Consumption Result:', debugResult)

    return NextResponse.json(debugResult)

  } catch (error) {
    console.error('❌ Debug credit consumption error:', error)
    return NextResponse.json({
      error: 'Debug consumption failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
