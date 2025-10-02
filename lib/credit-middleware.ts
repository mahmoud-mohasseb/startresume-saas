import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { checkAndConsumeStripeDirectCredits } from '@/lib/stripe-direct-credits'

export interface CreditCheckResult {
  success: boolean
  user: any
  creditResult?: any
  error?: string
}

/**
 * Middleware to check and consume credits for API routes
 */
export async function withCreditCheck(
  request: NextRequest,
  requiredCredits: number = 1,
  action: string = 'api_call'
): Promise<CreditCheckResult> {
  try {
    // Get current user
    const user = await currentUser()
    
    if (!user) {
      return {
        success: false,
        user: null,
        error: 'Authentication required'
      }
    }

    // Check and consume credits
    const creditResult = await checkAndConsumeStripeDirectCredits(
      user.id,
      requiredCredits,
      action
    )

    if (!creditResult.success) {
      return {
        success: false,
        user,
        creditResult,
        error: creditResult.message || 'Insufficient credits'
      }
    }

    return {
      success: true,
      user,
      creditResult
    }
  } catch (error) {
    console.error('Credit middleware error:', error)
    return {
      success: false,
      user: null,
      error: 'Credit check failed'
    }
  }
}

/**
 * Create error response for credit failures
 */
export function createCreditErrorResponse(result: CreditCheckResult): NextResponse {
  if (!result.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }

  if (result.creditResult) {
    return NextResponse.json({
      error: 'Insufficient credits',
      message: result.error,
      currentCredits: result.creditResult.currentCredits,
      requiredCredits: result.creditResult.requiredCredits,
      plan: result.creditResult.plan,
      planName: result.creditResult.planName
    }, { status: 402 }) // Payment Required
  }

  return NextResponse.json(
    { error: result.error || 'Credit check failed' },
    { status: 500 }
  )
}

/**
 * Higher-order function to wrap API routes with credit checking
 */
export function withCredits(
  handler: (request: NextRequest, context: any) => Promise<NextResponse>,
  requiredCredits: number = 1,
  action: string = 'api_call'
) {
  return async (request: NextRequest, context: any = {}) => {
    const creditCheck = await withCreditCheck(request, requiredCredits, action)
    
    if (!creditCheck.success) {
      return createCreditErrorResponse(creditCheck)
    }

    // Add user and credit info to context
    context.user = creditCheck.user
    context.creditResult = creditCheck.creditResult

    return handler(request, context)
  }
}
