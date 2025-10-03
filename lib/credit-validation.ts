import { getSubscription } from './supabase-subscriptions'

export interface CreditValidationResult {
  isValid: boolean
  remainingCredits: number
  reason?: string
  subscriptionStatus?: string
}

/**
 * Validate if user has sufficient credits and active subscription
 */
export async function validateCredits(
  clerkUserId: string,
  requiredCredits: number = 1
): Promise<CreditValidationResult> {
  try {
    const subscription = await getSubscription(clerkUserId)
    
    if (!subscription) {
      return {
        isValid: false,
        remainingCredits: 0,
        reason: 'No active subscription found',
        subscriptionStatus: 'none'
      }
    }

    if (subscription.status !== 'active') {
      return {
        isValid: false,
        remainingCredits: subscription.credits,
        reason: `Subscription is ${subscription.status}`,
        subscriptionStatus: subscription.status
      }
    }

    if (subscription.credits < requiredCredits) {
      return {
        isValid: false,
        remainingCredits: subscription.credits,
        reason: `Insufficient credits. Required: ${requiredCredits}, Available: ${subscription.credits}`,
        subscriptionStatus: subscription.status
      }
    }

    return {
      isValid: true,
      remainingCredits: subscription.credits,
      subscriptionStatus: subscription.status
    }
  } catch (error) {
    console.error('Error validating credits:', error)
    return {
      isValid: false,
      remainingCredits: 0,
      reason: 'Credit validation failed',
      subscriptionStatus: 'error'
    }
  }
}

/**
 * Prevent data actions that could cause credit issues
 */
export async function preventCreditIssues(
  clerkUserId: string,
  action: string,
  requiredCredits: number = 1
): Promise<{ allowed: boolean; message?: string }> {
  const validation = await validateCredits(clerkUserId, requiredCredits)
  
  if (!validation.isValid) {
    console.warn(`❌ Action "${action}" blocked for user ${clerkUserId}: ${validation.reason}`)
    
    return {
      allowed: false,
      message: validation.reason
    }
  }

  console.log(`✅ Action "${action}" allowed for user ${clerkUserId}. Credits: ${validation.remainingCredits}`)
  
  return {
    allowed: true
  }
}

/**
 * Check if user can perform multiple actions
 */
export async function validateBulkActions(
  clerkUserId: string,
  actions: Array<{ name: string; credits: number }>
): Promise<{
  canPerformAll: boolean
  totalCreditsRequired: number
  availableCredits: number
  blockedActions: string[]
}> {
  const totalRequired = actions.reduce((sum, action) => sum + action.credits, 0)
  const validation = await validateCredits(clerkUserId, totalRequired)
  
  if (validation.isValid) {
    return {
      canPerformAll: true,
      totalCreditsRequired: totalRequired,
      availableCredits: validation.remainingCredits,
      blockedActions: []
    }
  }

  // Find which actions can be performed with available credits
  const blockedActions: string[] = []
  let runningTotal = 0
  
  for (const action of actions) {
    if (runningTotal + action.credits > validation.remainingCredits) {
      blockedActions.push(action.name)
    } else {
      runningTotal += action.credits
    }
  }

  return {
    canPerformAll: false,
    totalCreditsRequired: totalRequired,
    availableCredits: validation.remainingCredits,
    blockedActions
  }
}
