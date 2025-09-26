import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Plan definitions with usage limits
export const PLAN_LIMITS = {
  free: {
    name: 'Free Plan',
    monthlyLimit: 3, // 3 AI generations per month
    features: ['resume_generation', 'cover_letter_generation'],
    price: 0,
    priceId: null
  },
  basic: {
    name: 'Basic Plan',
    monthlyLimit: 25, // 25 AI generations per month
    features: ['resume_generation', 'job_tailoring', 'cover_letter_generation', 'salary_research'],
    price: 9.99,
    priceId: 'price_1S7dpfFlaHFpdvA4YJj1omFc'
  },
  standard: {
    name: 'Standard Plan', 
    monthlyLimit: 100, // 100 AI generations per month
    features: ['resume_generation', 'job_tailoring', 'cover_letter_generation', 'salary_research', 'linkedin_optimization', 'mock_interview'],
    price: 19.99,
    priceId: 'price_1S7drgFlaHFpdvA4EaEaCtrA'
  },
  pro: {
    name: 'Pro Plan',
    monthlyLimit: -1, // Unlimited usage
    features: ['resume_generation', 'job_tailoring', 'cover_letter_generation', 'salary_research', 'linkedin_optimization', 'mock_interview', 'personal_brand_strategy'],
    price: 49.99,
    priceId: 'price_1S7dsBFlaHFpdvA42nBRrxgZ'
  }
}

export interface UserPlanStatus {
  plan: keyof typeof PLAN_LIMITS
  planName: string
  isActive: boolean
  monthlyUsage: number
  monthlyLimit: number
  remainingUsage: number
  currentPeriodStart: string
  currentPeriodEnd: string
  customerId?: string
  subscriptionId?: string
  canUseFeature: (feature: string) => boolean
  isUnlimited: boolean
}

export interface UsageRecord {
  userId: string
  feature: string
  timestamp: string
  billingPeriodStart: string
  billingPeriodEnd: string
}

// In-memory usage tracking (in production, use Redis or database)
const usageTracker = new Map<string, UsageRecord[]>()

export async function getUserPlanStatus(userId: string): Promise<UserPlanStatus> {
  try {
    console.log('🔍 Getting plan status for user:', userId)
    
    // Find Stripe customer by Clerk user ID
    const customers = await stripe.customers.search({
      query: `metadata['clerk_user_id']:'${userId}'`,
      limit: 1
    })

    if (customers.data.length === 0) {
      console.log('👤 No Stripe customer found, returning free plan')
      return createFreePlanStatus(userId)
    }

    const customer = customers.data[0]
    console.log('👤 Found Stripe customer:', customer.id)

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      console.log('📋 No active subscription found, returning free plan')
      return createFreePlanStatus(userId)
    }

    const subscription = subscriptions.data[0]
    const priceId = subscription.items.data[0]?.price.id

    // Map price ID to plan
    const plan = Object.entries(PLAN_LIMITS).find(([_, planData]) => 
      planData.priceId === priceId
    )?.[0] as keyof typeof PLAN_LIMITS || 'free'

    const planData = PLAN_LIMITS[plan]
    const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString()
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()

    // Get usage for current billing period
    const monthlyUsage = getCurrentPeriodUsage(userId, currentPeriodStart, currentPeriodEnd)
    const remainingUsage = planData.monthlyLimit === -1 ? -1 : Math.max(0, planData.monthlyLimit - monthlyUsage)

    return {
      plan,
      planName: planData.name,
      isActive: true,
      monthlyUsage,
      monthlyLimit: planData.monthlyLimit,
      remainingUsage,
      currentPeriodStart,
      currentPeriodEnd,
      customerId: customer.id,
      subscriptionId: subscription.id,
      isUnlimited: planData.monthlyLimit === -1,
      canUseFeature: (feature: string) => {
        // Check if feature is included in plan
        if (!planData.features.includes(feature)) {
          return false
        }
        // Check usage limits
        if (planData.monthlyLimit === -1) {
          return true // Unlimited
        }
        return monthlyUsage < planData.monthlyLimit
      }
    }

  } catch (error) {
    console.error('❌ Error getting plan status:', error)
    return createFreePlanStatus(userId)
  }
}

function createFreePlanStatus(userId: string): UserPlanStatus {
  const planData = PLAN_LIMITS.free
  const now = new Date()
  const currentPeriodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const currentPeriodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()
  
  const monthlyUsage = getCurrentPeriodUsage(userId, currentPeriodStart, currentPeriodEnd)
  const remainingUsage = Math.max(0, planData.monthlyLimit - monthlyUsage)

  return {
    plan: 'free',
    planName: planData.name,
    isActive: true,
    monthlyUsage,
    monthlyLimit: planData.monthlyLimit,
    remainingUsage,
    currentPeriodStart,
    currentPeriodEnd,
    isUnlimited: false,
    canUseFeature: (feature: string) => {
      if (!planData.features.includes(feature)) {
        return false
      }
      return monthlyUsage < planData.monthlyLimit
    }
  }
}

export async function checkAndRecordUsage(
  userId: string, 
  feature: string
): Promise<{
  success: boolean
  planStatus: UserPlanStatus
  message?: string
}> {
  try {
    console.log(`🔒 Checking plan access for ${feature} - User: ${userId}`)
    
    const planStatus = await getUserPlanStatus(userId)
    
    // Check if user can use this feature
    if (!planStatus.canUseFeature(feature)) {
      const planData = PLAN_LIMITS[planStatus.plan]
      
      if (!planData.features.includes(feature)) {
        return {
          success: false,
          planStatus,
          message: `${feature} is not included in your ${planStatus.planName}. Please upgrade to access this feature.`
        }
      }
      
      if (planStatus.remainingUsage <= 0) {
        return {
          success: false,
          planStatus,
          message: `You've reached your monthly limit of ${planStatus.monthlyLimit} AI generations. Please upgrade or wait for next billing cycle.`
        }
      }
    }

    // Record usage
    recordUsage(userId, feature, planStatus.currentPeriodStart, planStatus.currentPeriodEnd)
    
    // Get updated status after recording usage
    const updatedStatus = await getUserPlanStatus(userId)
    
    console.log(`✅ Usage recorded for ${feature}. Remaining: ${updatedStatus.remainingUsage}`)
    
    return {
      success: true,
      planStatus: updatedStatus
    }

  } catch (error) {
    console.error('❌ Error checking plan access:', error)
    const planStatus = await getUserPlanStatus(userId)
    return {
      success: false,
      planStatus,
      message: 'Error checking plan access. Please try again.'
    }
  }
}

function getCurrentPeriodUsage(userId: string, periodStart: string, periodEnd: string): number {
  const userUsage = usageTracker.get(userId) || []
  return userUsage.filter(record => 
    record.billingPeriodStart === periodStart && 
    record.billingPeriodEnd === periodEnd
  ).length
}

function recordUsage(userId: string, feature: string, periodStart: string, periodEnd: string): void {
  const userUsage = usageTracker.get(userId) || []
  
  const usageRecord: UsageRecord = {
    userId,
    feature,
    timestamp: new Date().toISOString(),
    billingPeriodStart: periodStart,
    billingPeriodEnd: periodEnd
  }
  
  userUsage.push(usageRecord)
  usageTracker.set(userId, userUsage)
  
  console.log(`📊 Recorded usage: ${feature} for user ${userId}`)
}

export function getUserUsageAnalytics(userId: string, periodStart: string, periodEnd: string) {
  const userUsage = usageTracker.get(userId) || []
  const periodUsage = userUsage.filter(record => 
    record.billingPeriodStart === periodStart && 
    record.billingPeriodEnd === periodEnd
  )

  const featureBreakdown = periodUsage.reduce((acc, record) => {
    acc[record.feature] = (acc[record.feature] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    totalUsage: periodUsage.length,
    featureBreakdown,
    usageHistory: periodUsage.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }
}
