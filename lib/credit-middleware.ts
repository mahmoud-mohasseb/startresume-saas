import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getOrCreateUserSubscription, CREDIT_COSTS, consumeCredits } from './subscription-manager'

export interface CreditMiddlewareOptions {
  feature: keyof typeof CREDIT_COSTS
  skipCreditCheck?: boolean
  customErrorMessage?: string
}

/**
 * Middleware to protect API routes with credit checking and consumption
 */
export function withCreditsCheck(options: CreditMiddlewareOptions) {
  return function <T extends any[]>(
    handler: (request: NextRequest, ...args: T) => Promise<NextResponse>
  ) {
    return async function (request: NextRequest, ...args: T): Promise<NextResponse> {
      try {
        // Get current user
        const user = await currentUser()
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          )
        }

        // Skip credit check if specified (for free features)
        if (options.skipCreditCheck) {
          return handler(request, ...args)
        }

        // Get user subscription and check credits
        const subscription = await getOrCreateUserSubscription(user.id)
        const requiredCredits = CREDIT_COSTS[options.feature]

        // Check if user has active subscription
        if (subscription.status !== 'active') {
          return NextResponse.json(
            { 
              error: 'Active subscription required',
              message: options.customErrorMessage || 'You need an active subscription to use this feature. Please upgrade your plan.',
              requiredCredits,
              currentCredits: 0,
              subscriptionStatus: subscription.status
            },
            { status: 402 } // Payment Required
          )
        }

        // Check if user has enough credits
        if (subscription.credits < requiredCredits) {
          return NextResponse.json(
            { 
              error: 'Insufficient credits',
              message: options.customErrorMessage || `This feature requires ${requiredCredits} credits. You have ${subscription.credits} credits remaining. Please upgrade your plan or wait for your next billing cycle.`,
              requiredCredits,
              currentCredits: subscription.credits,
              subscriptionStatus: subscription.status
            },
            { status: 402 } // Payment Required
          )
        }

        // Execute the handler first
        const response = await handler(request, ...args)

        // Only consume credits if the request was successful (2xx status)
        if (response.status >= 200 && response.status < 300) {
          try {
            await consumeCredits(user.id, options.feature, {
              feature: options.feature,
              credits_used: requiredCredits,
              metadata: {
                endpoint: request.url,
                method: request.method,
                timestamp: new Date().toISOString(),
                success: true
              }
            })
            
            console.log(`Credits consumed: ${requiredCredits} for feature: ${options.feature}, user: ${user.id}`)
          } catch (creditError) {
            console.error('Failed to consume credits:', creditError)
            // Don't fail the request if credit consumption fails, just log it
          }
        }

        return response

      } catch (error) {
        console.error('Credit middleware error:', error)
        return NextResponse.json(
          { 
            error: 'Internal server error',
            message: 'An error occurred while processing your request. Please try again.'
          },
          { status: 500 }
        )
      }
    }
  }
}

/**
 * Helper function to create protected API route handlers
 */
export function createCreditsProtectedHandler<T extends any[]>(
  feature: keyof typeof CREDIT_COSTS,
  handler: (request: NextRequest, ...args: T) => Promise<NextResponse>,
  options?: Partial<CreditMiddlewareOptions>
) {
  return withCreditsCheck({
    feature,
    ...options
  })(handler)
}
