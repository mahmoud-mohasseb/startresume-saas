import { createAdminClient } from '@/lib/supabase'
import { currentUser } from '@clerk/nextjs/server'

// Lazy initialization of Supabase admin client
const getSupabaseAdmin = () => createAdminClient()

export interface SubscriptionPlan {
  id: string
  name: string
  credits: number
  price: number
  stripeProductId: string
  stripePriceId: string
  features: string[]
  popular?: boolean
  creditCost: number // Cost per credit
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    credits: 3,
    price: 0,
    creditCost: 0,
    stripeProductId: '',
    stripePriceId: '',
    features: [
      '3 free credits to try',
      'Basic resume templates',
      'PDF export',
      'Community support'
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    credits: 10,
    price: 9.99,
    creditCost: 0.99,
    stripeProductId: 'prod_basic',
    stripePriceId: 'price_1S7dpfFlaHFpdvA4YJj1omFc',
    features: [
      '10 credits per month',
      'AI resume generation (5 credits)',
      'Cover letter generation (3 credits)',
      'Job tailoring (3 credits)',
      'Basic templates',
      'PDF export',
      'Email support'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 50,
    price: 19.99,
    creditCost: 0.40,
    stripeProductId: 'prod_standard',
    stripePriceId: 'price_1S7drgFlaHFpdvA4EaEaCtrA',
    features: [
      '50 credits per month',
      'AI resume generation (5 credits)',
      'Cover letter generation (3 credits)',
      'Job tailoring (3 credits)',
      'Salary negotiation (2 credits)',
      'LinkedIn optimization (4 credits)',
      'Premium templates',
      'PDF & DOCX export',
      'Priority support',
      'Resume analytics'
    ],
    popular: true
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 200,
    price: 49.99,
    creditCost: 0.25,
    stripeProductId: 'prod_pro',
    stripePriceId: 'price_1S7dsBFlaHFpdvA42nBRrxgZ',
    features: [
      '200 credits per month',
      'All Standard features',
      'Personal brand strategy (8 credits)',
      'Mock interview practice (6 credits)',
      'Advanced analytics',
      'Executive templates',
      'Personal branding consultation',
      'Career strategy planning',
      'White-label resumes',
      'Dedicated support'
    ]
  }
]

// Credit costs for different actions
export const CREDIT_COSTS = {
  resume_generation: 5,
  cover_letter: 3,
  job_tailoring: 3,
  salary_negotiation: 2,
  linkedin_optimization: 4,
  personal_brand_strategy: 8,
  mock_interview: 6,
  ai_suggestions: 1 // For smaller AI features
}

export interface UserSubscription {
  id: string
  user_id: string
  plan: string | null
  status: 'active' | 'canceled' | 'past_due' | 'inactive'
  credits: number
  stripe_customer_id?: string
  stripe_subscription_id?: string
  created_at: string
  updated_at: string
}

/**
 * Get or create user subscription with better error handling
 */
export async function getOrCreateUserSubscription(clerkId: string): Promise<UserSubscription> {
  try {
    console.log('Getting subscription for user:', clerkId)
    
    // First, try to get existing subscription
    const { data: existing, error: fetchError } = await getSupabaseAdmin()
      .from('subscriptions')
      .select('*')
      .eq('user_id', clerkId)
      .single()

    if (existing && !fetchError) {
      console.log('Found existing subscription:', existing.id)
      return existing
    }

    // If not found and error is not "not found", there might be a real issue
    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching subscription:', fetchError)
    }

    console.log('Creating new subscription for user:', clerkId)
    
    // Try to create user record first if it doesn't exist
    await ensureUserExists(clerkId)
    
    // Create default subscription if none exists - ROBUST APPROACH
    const defaultSubscription = {
      user_id: clerkId,
      plan: 'basic', // Use 'basic' instead of 'free' to avoid constraint issues
      credits: 10,   // Give 10 credits instead of 3
      credits_used: 0,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    console.log('Inserting subscription data:', defaultSubscription)

    const { data: newSubscription, error: insertError } = await getSupabaseAdmin()
      .from('subscriptions')
      .insert(defaultSubscription)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating subscription:', insertError)
      
      // If it's a UUID error, the user_id field expects UUID but we're giving Clerk ID
      if (insertError.code === '22P02') {
        console.log('UUID error detected, trying alternative approach...')
        
        // Try to find existing user record and use its UUID
        const { data: existingUser } = await getSupabaseAdmin()
          .from('users')
          .select('id')
          .eq('clerk_id', clerkId)
          .single()
        
        if (existingUser) {
          const altSubscription = {
            ...defaultSubscription,
            user_id: existingUser.id // Use database UUID instead
          }
          
          const { data: altResult, error: altError } = await getSupabaseAdmin()
            .from('subscriptions')
            .insert(altSubscription)
            .select()
            .single()
          
          if (altError) {
            console.error('Alternative subscription creation failed:', altError)
            // Return a temporary subscription object to prevent crashes
            return {
              id: `temp-${Date.now()}`,
              user_id: clerkId,
              plan: null,
              credits: 0,
              status: 'inactive',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
          
          return altResult
        }
      }
      
      // Return a temporary subscription object to prevent crashes
      return {
        id: `temp-${Date.now()}`,
        user_id: clerkId,
        plan: null,
        credits: 0,
        status: 'inactive',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }

    console.log('Successfully created subscription:', newSubscription.id)
    return newSubscription
  } catch (error) {
    console.error('Error in getOrCreateUserSubscription:', error)
    
    // Fallback: return a default subscription object for display purposes
    return {
      id: 'temp-' + Date.now(),
      user_id: clerkId,
      plan: null, // No plan assigned
      status: 'inactive',
      credits: 0, // Start with 0 credits
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }
}

/**
 * Ensure user exists in the users table
 */
async function ensureUserExists(clerkId: string): Promise<void> {
  try {
    const { data: userExists, error: userError } = await getSupabaseAdmin()
      .from('users')
      .select('id, clerk_id')
      .eq('clerk_id', clerkId)
      .single()

    if (!userExists && userError?.code === 'PGRST116') {
      // User doesn't exist, create one
      console.log('Creating user record for:', clerkId)
      const { error: createUserError } = await getSupabaseAdmin()
        .from('users')
        .insert({
          clerk_id: clerkId,
          email: 'user@example.com', // Will be updated later
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (createUserError) {
        console.error('Error creating user:', createUserError)
      } else {
        console.log('Successfully created user record')
      }
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error)
  }
}

/**
 * Alternative subscription creation method
 */
async function createSubscriptionWithUserRecord(clerkId: string): Promise<UserSubscription> {
  try {
    // Get user UUID if it exists
    const { data: user, error: userError } = await getSupabaseAdmin()
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()

    const userIdToUse = user?.id || clerkId

    const subscriptionData = {
      user_id: userIdToUse,
      plan: 'free',
      status: 'active' as const,
      credits: SUBSCRIPTION_PLANS[0].credits // 3 credits from FREE plan
    }

    const { data: newSubscription, error: createError } = await getSupabaseAdmin()
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single()

    if (createError) {
      throw createError
    }

    return newSubscription
  } catch (error) {
    console.error('Alternative subscription creation failed:', error)
    throw error
  }
}

/**
 * Update user subscription
 */
export async function updateUserSubscription(clerkId: string, planId: string, stripeData?: any): Promise<UserSubscription> {
  console.log('=== UPDATING USER SUBSCRIPTION ===')
  console.log('Clerk ID:', clerkId)
  console.log('Plan ID:', planId)
  console.log('Stripe Data:', stripeData)
  
  const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId)
  if (!plan) {
    console.error('❌ Invalid plan ID:', planId)
    throw new Error(`Invalid plan ID: ${planId}`)
  }

  console.log('✅ Found plan:', plan.name, 'with', plan.credits, 'credits')

  // CRITICAL FIX: Ensure user and subscription exist first
  await ensureUserExists(clerkId)
  
  // Check if subscription exists
  const { data: existingSub } = await getSupabaseAdmin()
    .from('subscriptions')
    .select('id')
    .eq('user_id', clerkId)
    .single()

  const updateData = {
    user_id: clerkId, // Include user_id for upsert
    plan: planId,
    credits: plan.credits,
    credits_used: 0, // CRITICAL: Reset credits used on plan change
    status: 'active', // CRITICAL: Ensure status is active
    ...(stripeData && {
      stripe_customer_id: stripeData.customerId,
      stripe_subscription_id: stripeData.subscriptionId,
      current_period_start: stripeData.currentPeriodStart,
      current_period_end: stripeData.currentPeriodEnd
    }),
    updated_at: new Date().toISOString()
  }

  console.log('📝 Update data:', updateData)

  let data, error

  if (existingSub) {
    // Update existing subscription
    console.log('🔄 Updating existing subscription:', existingSub.id)
    const result = await getSupabaseAdmin()
      .from('subscriptions')
      .update(updateData)
      .eq('user_id', clerkId)
      .select()
      .single()
    
    data = result.data
    error = result.error
  } else {
    // Create new subscription
    console.log('🆕 Creating new subscription')
    const result = await getSupabaseAdmin()
      .from('subscriptions')
      .insert(updateData)
      .select()
      .single()
    
    data = result.data
    error = result.error
  }

  if (error) {
    console.error('❌ Database operation error:', error)
    throw error
  }

  console.log('✅ Database operation successful:', {
    id: data.id,
    plan: data.plan,
    credits: data.credits,
    credits_used: data.credits_used,
    status: data.status
  })

  return data
}

/**
 * Check if user can perform an action
 */
export async function canUserPerformAction(clerkId: string, action: string, requiredCredits: number): Promise<{
  canPerform: boolean
  currentCredits: number
  requiredCredits: number
  plan: string
  message?: string
}> {
  try {
    const subscription = await getOrCreateUserSubscription(clerkId)
    const usedCredits = await getUsedCreditsThisMonth(clerkId)
    const remainingCredits = subscription.credits - usedCredits

    const canPerform = remainingCredits >= requiredCredits

    return {
      canPerform,
      currentCredits: remainingCredits,
      requiredCredits,
      plan: subscription.plan,
      message: canPerform ? undefined : `Insufficient credits. You need ${requiredCredits} credits but only have ${remainingCredits} remaining.`
    }
  } catch (error) {
    console.error('Error checking user action capability:', error)
    return {
      canPerform: false,
      currentCredits: 0,
      requiredCredits,
      plan: 'basic',
      message: 'Unable to check credit balance. Please try again.'
    }
  }
}

/**
 * Consume user credits
 */
export async function consumeUserCredits(clerkId: string, action: string, creditsToConsume: number, metadata?: any): Promise<{
  success: boolean
  remainingCredits: number
  message?: string
}> {
  try {
    const canPerform = await canUserPerformAction(clerkId, action, creditsToConsume)
    
    if (!canPerform.canPerform) {
      return {
        success: false,
        remainingCredits: canPerform.currentCredits,
        message: canPerform.message
      }
    }

    // Log the credit usage
    await logCreditUsage(clerkId, action, creditsToConsume, metadata)

    return {
      success: true,
      remainingCredits: canPerform.currentCredits - creditsToConsume
    }
  } catch (error) {
    console.error('Error consuming user credits:', error)
    return {
      success: false,
      remainingCredits: 0,
      message: 'Failed to consume credits. Please try again.'
    }
  }
}

/**
 * Log credit usage to analytics
 */
export async function logCreditUsage(clerkId: string, action: string, creditsUsed: number, metadata?: any): Promise<void> {
  try {
    await getSupabaseAdmin()
      .from('analytics_events')
      .insert({
        user_id: clerkId,
        event_type: 'credit_usage',
        event_data: {
          action,
          credits_used: creditsUsed,
          metadata
        },
        created_at: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error logging credit usage:', error)
  }
}

/**
 * Get used credits this month
 */
async function getUsedCreditsThisMonth(clerkId: string): Promise<number> {
  try {
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data, error } = await getSupabaseAdmin()
      .from('analytics_events')
      .select('event_data')
      .eq('user_id', clerkId)
      .eq('event_type', 'credit_usage')
      .gte('created_at', startOfMonth.toISOString())

    if (error) {
      console.error('Error getting used credits:', error)
      return 0
    }

    return data?.reduce((total, event) => {
      return total + (event.event_data?.credits_used || 0)
    }, 0) || 0
  } catch (error) {
    console.error('Error calculating used credits:', error)
    return 0
  }
}

/**
 * Get user credit analytics
 */
export async function getUserCreditAnalytics(clerkId: string, days: number = 30, offset: number = 0): Promise<{
  totalUsed: number
  usageByAction: Record<string, number>
  usageByDay: Record<string, number>
  recentUsage: Array<{
    action: string
    credits_used: number
    timestamp: string
    metadata?: any
  }>
}> {
  try {
    const endDate = new Date()
    endDate.setDate(endDate.getDate() - offset)
    
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await getSupabaseAdmin()
      .from('analytics_events')
      .select('event_data, created_at')
      .eq('user_id', clerkId)
      .eq('event_type', 'credit_usage')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting credit analytics:', error)
      return {
        totalUsed: 0,
        usageByAction: {},
        usageByDay: {},
        recentUsage: []
      }
    }

    const usageByAction: Record<string, number> = {}
    const usageByDay: Record<string, number> = {}
    const recentUsage: Array<any> = []
    let totalUsed = 0

    data?.forEach(event => {
      const eventData = event.event_data
      const creditsUsed = eventData?.credits_used || 0
      const action = eventData?.action || 'unknown'
      
      totalUsed += creditsUsed
      
      // Group by action
      usageByAction[action] = (usageByAction[action] || 0) + creditsUsed
      
      // Group by day
      const day = event.created_at.split('T')[0]
      usageByDay[day] = (usageByDay[day] || 0) + creditsUsed
      
      // Recent usage
      recentUsage.push({
        action,
        credits_used: creditsUsed,
        timestamp: event.created_at,
        metadata: eventData?.metadata
      })
    })

    return {
      totalUsed,
      usageByAction,
      usageByDay,
      recentUsage: recentUsage.slice(0, 20)
    }
  } catch (error) {
    console.error('Error getting user credit analytics:', error)
    return {
      totalUsed: 0,
      usageByAction: {},
      usageByDay: {},
      recentUsage: []
    }
  }
}

/**
 * Log subscription events for analytics
 */
export async function logSubscriptionEvent(clerkId: string, eventType: string, eventData: any): Promise<void> {
  try {
    console.log(`Logging subscription event: ${eventType} for user ${clerkId}`)
    
    await getSupabaseAdmin()
      .from('analytics_events')
      .insert({
        user_id: clerkId,
        event_type: eventType,
        event_data: eventData,
        created_at: new Date().toISOString()
      })
    
    console.log(`Successfully logged ${eventType} event`)
  } catch (error) {
    console.error('Error logging subscription event:', error)
  }
}

/**
 * Refresh monthly credits for a user
 */
export async function refreshMonthlyCredits(clerkId: string): Promise<void> {
  try {
    console.log(`Refreshing monthly credits for user: ${clerkId}`)
    
    const subscription = await getOrCreateUserSubscription(clerkId)
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === subscription.plan)
    
    if (!plan) {
      console.error('No plan found for subscription:', subscription.plan)
      return
    }
    
    // Reset credits to plan amount and clear used credits
    const { error } = await getSupabaseAdmin()
      .from('subscriptions')
      .update({
        credits: plan.credits,
        credits_used: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', clerkId)
    
    if (error) {
      console.error('Error refreshing credits:', error)
      return
    }
    
    await logSubscriptionEvent(clerkId, 'credits_refreshed', {
      planId: plan.id,
      creditsGranted: plan.credits,
      refreshDate: new Date().toISOString()
    })
    
    console.log(`Successfully refreshed ${plan.credits} credits for user ${clerkId}`)
  } catch (error) {
    console.error('Error refreshing monthly credits:', error)
  }
}

/**
 * Get current user subscription status with Stripe fallback
 */
export async function getCurrentUserSubscription(): Promise<UserSubscription | null> {
  try {
    const user = await currentUser()
    if (!user) return null
    
    return await getOrCreateUserSubscription(user.id)
  } catch (error) {
    console.error('Error getting current user subscription:', error)
    return null
  }
}

/**
 * Stripe-direct credit check (bypasses database issues)
 */
export async function getStripeDirectCredits(clerkId: string): Promise<{
  credits: number
  plan: string
  status: string
}> {
  try {
    // First try database
    const subscription = await getOrCreateUserSubscription(clerkId)
    
    if (subscription.stripe_customer_id) {
      // Verify with Stripe directly
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      
      const customer = await stripe.customers.retrieve(subscription.stripe_customer_id)
      const subscriptions = await stripe.subscriptions.list({
        customer: subscription.stripe_customer_id,
        status: 'active'
      })
      
      if (subscriptions.data.length > 0) {
        const activeSubscription = subscriptions.data[0]
        const priceId = activeSubscription.items.data[0]?.price.id
        
        // Find plan by price ID
        const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === priceId)
        
        if (plan) {
          console.log(`Stripe-direct: User ${clerkId} has active ${plan.name} plan with ${plan.credits} credits`)
          
          // Update database with Stripe data
          await updateUserSubscription(clerkId, plan.id, {
            customerId: subscription.stripe_customer_id,
            subscriptionId: activeSubscription.id,
            currentPeriodStart: new Date(activeSubscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000).toISOString()
          })
          
          return {
            credits: plan.credits,
            plan: plan.id,
            status: 'active'
          }
        }
      }
    }
    
    // Fallback to database
    const usedCredits = await getUsedCreditsThisMonth(clerkId)
    const remainingCredits = Math.max(0, subscription.credits - usedCredits)
    
    return {
      credits: remainingCredits,
      plan: subscription.plan || 'basic',
      status: subscription.status
    }
  } catch (error) {
    console.error('Error getting Stripe-direct credits:', error)
    return {
      credits: 0,
      plan: 'basic',
      status: 'inactive'
    }
  }
}

/**
 * Force sync user subscription with Stripe
 */
export async function forceSyncWithStripe(clerkId: string): Promise<boolean> {
  try {
    console.log(`Force syncing user ${clerkId} with Stripe`)
    
    const subscription = await getOrCreateUserSubscription(clerkId)
    
    if (!subscription.stripe_customer_id) {
      console.log('No Stripe customer ID found')
      return false
    }
    
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
    
    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: subscription.stripe_customer_id,
      limit: 10
    })
    
    console.log(`Found ${subscriptions.data.length} Stripe subscriptions`)
    
    // Find active subscription
    const activeSubscription = subscriptions.data.find(sub => sub.status === 'active')
    
    if (activeSubscription) {
      const priceId = activeSubscription.items.data[0]?.price.id
      const plan = SUBSCRIPTION_PLANS.find(p => p.stripePriceId === priceId)
      
      if (plan) {
        console.log(`Syncing to ${plan.name} plan with ${plan.credits} credits`)
        
        await updateUserSubscription(clerkId, plan.id, {
          customerId: subscription.stripe_customer_id,
          subscriptionId: activeSubscription.id,
          currentPeriodStart: new Date(activeSubscription.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(activeSubscription.current_period_end * 1000).toISOString()
        })
        
        await logSubscriptionEvent(clerkId, 'stripe_sync_completed', {
          planId: plan.id,
          planName: plan.name,
          credits: plan.credits,
          stripeSubscriptionId: activeSubscription.id
        })
        
        return true
      }
    }
    
    return false
  } catch (error) {
    console.error('Error force syncing with Stripe:', error)
    return false
  }
}
