import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { consumeCredits, hasEnoughCredits, getUserSubscription, getCreditUsageHistory } from './credits'

export interface AIEndpointConfig {
  action: keyof typeof import('./credits').CREDIT_COSTS
  requiresAuth?: boolean
  skipCreditsCheck?: boolean
}

/**
 * Middleware wrapper for AI endpoints to handle credits automatically
 * SERVER-SIDE ONLY - Do not import this in client components
 */
export function withCreditsMiddleware(
  config: AIEndpointConfig,
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Authentication check
      if (config.requiresAuth !== false) {
        const user = await currentUser()
        
        if (!user) {
          return NextResponse.json(
            { error: 'Authentication required' }, 
            { status: 401 }
          )
        }

        // Skip credits check if specified
        if (config.skipCreditsCheck) {
          return await handler(request, user)
        }

        // Check if user has enough credits
        const creditCheck = await hasEnoughCredits(user.id, config.action)
        
        if (!creditCheck.hasCredits) {
          return NextResponse.json({
            error: 'Insufficient credits',
            currentCredits: creditCheck.currentCredits,
            requiredCredits: creditCheck.requiredCredits,
            action: config.action
          }, { status: 402 }) // Payment Required
        }

        // Execute the handler
        const response = await handler(request, user)

        // If the response is successful, consume credits
        if (response.status >= 200 && response.status < 300) {
          const creditResult = await consumeCredits(user.id, config.action, {
            endpoint: request.url,
            timestamp: new Date().toISOString(),
            userAgent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
          })

          if (!creditResult.success) {
            console.error(`Failed to consume credits for ${config.action}:`, creditResult.error)
          }

          // Add credits info to response headers
          const responseHeaders = new Headers(response.headers)
          responseHeaders.set('X-Credits-Remaining', creditResult.remainingCredits.toString())
          responseHeaders.set('X-Credits-Used', creditCheck.requiredCredits.toString())
          responseHeaders.set('X-Action', config.action)

          return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders
          })
        }

        return response
      }

      // No auth required, just execute handler
      return await handler(request, null)
    } catch (error) {
      console.error(`Error in credits middleware for ${config.action}:`, error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Get user's current credits info - SERVER-SIDE ONLY
 */
export async function getUserCreditsInfo(clerkId: string) {
  try {
    const subscription = await getUserSubscription(clerkId)
    
    if (!subscription) {
      return {
        totalCredits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        plan: 'none',
        status: 'inactive'
      }
    }

    const remainingCredits = subscription.credits - (subscription.credits_used || 0)

    return {
      totalCredits: subscription.credits,
      usedCredits: subscription.credits_used || 0,
      remainingCredits: Math.max(0, remainingCredits),
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.current_period_end
    }
  } catch (error) {
    console.error('Error getting user credits info:', error)
    return {
      totalCredits: 0,
      usedCredits: 0,
      remainingCredits: 0,
      plan: 'none',
      status: 'error'
    }
  }
}

/**
 * Get credits usage analytics for a user - SERVER-SIDE ONLY
 */
export async function getUserCreditsAnalytics(clerkId: string, days: number = 30) {
  try {
    const history = await getCreditUsageHistory(clerkId, 100)
    
    // Filter by date range
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const recentHistory = history.filter(item => 
      new Date(item.timestamp) >= cutoffDate
    )

    // Group by action
    const usageByAction = recentHistory.reduce((acc, item) => {
      acc[item.action] = (acc[item.action] || 0) + item.credits_used
      return acc
    }, {} as Record<string, number>)

    // Group by day
    const usageByDay = recentHistory.reduce((acc, item) => {
      const day = item.timestamp.split('T')[0]
      acc[day] = (acc[day] || 0) + item.credits_used
      return acc
    }, {} as Record<string, number>)

    return {
      totalUsed: recentHistory.reduce((sum, item) => sum + item.credits_used, 0),
      usageByAction,
      usageByDay,
      recentHistory: recentHistory.slice(0, 20)
    }
  } catch (error) {
    console.error('Error getting user credits analytics:', error)
    return {
      totalUsed: 0,
      usageByAction: {},
      usageByDay: {},
      recentHistory: []
    }
  }
}
