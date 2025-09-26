import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { 
  canUserPerformAction,
  CREDIT_COSTS 
} from '@/lib/subscription-manager'

/**
 * Middleware to check credits before AI operations
 */
export async function withCreditsCheck(
  request: NextRequest,
  action: keyof typeof CREDIT_COSTS,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const requiredCredits = CREDIT_COSTS[action]
    if (!requiredCredits) {
      console.warn(`Unknown action: ${action}`)
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    // Check if user can perform this action
    const canPerform = await canUserPerformAction(user.id, action, requiredCredits)
    
    if (!canPerform.canPerform) {
      return NextResponse.json({
        error: 'insufficient_credits',
        message: canPerform.message,
        requiredCredits,
        currentCredits: canPerform.currentCredits,
        plan: canPerform.plan,
        action,
        upgradeUrl: '/pricing'
      }, { status: 402 }) // Payment Required
    }

    // Add credit info to request headers for the handler
    const modifiedRequest = new NextRequest(request.url, {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        'x-credits-available': canPerform.currentCredits.toString(),
        'x-credits-required': requiredCredits.toString(),
        'x-user-plan': canPerform.plan
      },
      body: request.body
    })

    // Proceed with the original handler
    return await handler(modifiedRequest)

  } catch (error) {
    console.error('Credits middleware error:', error)
    return NextResponse.json(
      { 
        error: 'credit_check_failed',
        message: 'Unable to verify credits. Please try again.'
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to create a credits-protected route handler
 */
export function createCreditsProtectedHandler(
  action: keyof typeof CREDIT_COSTS,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    return withCreditsCheck(request, action, handler)
  }
}

/**
 * Decorator for API routes that require credits
 */
export function requiresCredits(action: keyof typeof CREDIT_COSTS) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (request: NextRequest) {
      return withCreditsCheck(request, action, originalMethod.bind(this))
    }

    return descriptor
  }
}
