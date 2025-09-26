import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Plan configurations matching Stripe price IDs
export const STRIPE_PLANS = {
  'price_1S7dpfFlaHFpdvA4YJj1omFc': { // Basic
    id: 'basic',
    name: 'Basic',
    credits: 10,
    price: 9.99
  },
  'price_1S7drgFlaHFpdvA4EaEaCtrA': { // Standard
    id: 'standard', 
    name: 'Standard',
    credits: 50,
    price: 19.99
  },
  'price_1S7dsBFlaHFpdvA42nBRrxgZ': { // Pro
    id: 'pro',
    name: 'Pro', 
    credits: 200,
    price: 49.99
  }
}

export interface StripeDirectCreditData {
  credits: number
  usedCredits: number
  remainingCredits: number
  plan: string
  planName: string
  status: string
  isActive: boolean
  customerId?: string
  subscriptionId?: string
  currentPeriodEnd?: string
  currentPeriodStart?: string
  pricePerMonth: number
}

// In-memory credit usage tracking (in production, use Redis or database)
const creditUsage = new Map<string, { used: number, resetDate: string }>()

/**
 * Get credits directly from Stripe API with usage tracking
 */
export async function getStripeDirectCredits(clerkUserId: string): Promise<StripeDirectCreditData> {
  try {
    console.log('🔍 Getting Stripe-direct credits with usage tracking for user:', clerkUserId)
    
    // Special debug logging for ghareb4@gmail.com
    const isDebugUser = clerkUserId.includes('ghareb4') || clerkUserId === 'ghareb4@gmail.com'
    if (isDebugUser) {
      console.log('🐛 DEBUG USER DETECTED: ghareb4@gmail.com - Starting detailed logging')
    }
    
    // Search for customer by Clerk user ID in metadata
    const customers = await stripe.customers.search({
      query: `metadata['clerk_user_id']:'${clerkUserId}'`
    })
    
    console.log(`Found ${customers.data.length} customers for user ${clerkUserId}`)
    
    if (isDebugUser) {
      console.log('🐛 DEBUG - Customer search results:', {
        searchQuery: `metadata['clerk_user_id']:'${clerkUserId}'`,
        customersFound: customers.data.length,
        customerDetails: customers.data.map(c => ({
          id: c.id,
          email: c.email,
          metadata: c.metadata,
          created: new Date(c.created * 1000).toISOString()
        }))
      })
    }
    
    if (customers.data.length === 0) {
      console.log('❌ No Stripe customer found')
      
      if (isDebugUser) {
        console.log('🐛 DEBUG - No Stripe customer found. Checking alternative search methods...')
        
        // Try searching by email if the clerkUserId looks like an email
        if (clerkUserId.includes('@')) {
          console.log('🐛 DEBUG - Trying email search for:', clerkUserId)
          const emailCustomers = await stripe.customers.list({
            email: clerkUserId,
            limit: 10
          })
          console.log('🐛 DEBUG - Email search results:', {
            email: clerkUserId,
            customersFound: emailCustomers.data.length,
            customers: emailCustomers.data.map(c => ({
              id: c.id,
              email: c.email,
              metadata: c.metadata
            }))
          })
        }
        
        // Try searching all customers with ghareb4 in metadata
        const allCustomers = await stripe.customers.search({
          query: `metadata['clerk_user_id']:*ghareb4*`
        })
        console.log('🐛 DEBUG - Wildcard search for ghareb4:', {
          customersFound: allCustomers.data.length,
          customers: allCustomers.data.map(c => ({
            id: c.id,
            email: c.email,
            metadata: c.metadata
          }))
        })
      }
      
      return {
        credits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        plan: 'free',
        planName: 'Free',
        status: 'inactive',
        isActive: false,
        pricePerMonth: 0
      }
    }
    
    const customer = customers.data[0]
    console.log('✅ Found customer:', customer.id)
    
    if (isDebugUser) {
      console.log('🐛 DEBUG - Customer details:', {
        customerId: customer.id,
        email: customer.email,
        metadata: customer.metadata,
        created: new Date(customer.created * 1000).toISOString(),
        description: customer.description
      })
    }
    
    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10
    })
    
    console.log(`Found ${subscriptions.data.length} active subscriptions`)
    
    if (isDebugUser) {
      console.log('🐛 DEBUG - Subscription search results:', {
        customerId: customer.id,
        activeSubscriptions: subscriptions.data.length,
        subscriptions: subscriptions.data.map(s => ({
          id: s.id,
          status: s.status,
          priceId: s.items.data[0]?.price.id,
          currentPeriodStart: new Date(s.current_period_start * 1000).toISOString(),
          currentPeriodEnd: new Date(s.current_period_end * 1000).toISOString(),
          metadata: s.metadata
        }))
      })
      
      // Also check for all subscriptions (not just active)
      const allSubscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 10
      })
      console.log('🐛 DEBUG - All subscriptions (any status):', {
        totalSubscriptions: allSubscriptions.data.length,
        subscriptions: allSubscriptions.data.map(s => ({
          id: s.id,
          status: s.status,
          priceId: s.items.data[0]?.price.id,
          created: new Date(s.created * 1000).toISOString(),
          metadata: s.metadata
        }))
      })
    }
    
    if (subscriptions.data.length === 0) {
      console.log('❌ No active subscriptions found')
      
      if (isDebugUser) {
        console.log('🐛 DEBUG - No active subscriptions. User should see free plan with 0 credits.')
      }
      
      return {
        credits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        plan: 'free', 
        planName: 'Free',
        status: 'inactive',
        isActive: false,
        customerId: customer.id,
        pricePerMonth: 0
      }
    }
    
    const subscription = subscriptions.data[0]
    const priceId = subscription.items.data[0]?.price.id
    
    console.log('🎯 Active subscription found:', {
      subscriptionId: subscription.id,
      priceId: priceId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
    })
    
    const plan = STRIPE_PLANS[priceId as keyof typeof STRIPE_PLANS]
    
    if (isDebugUser) {
      console.log('🐛 DEBUG - Plan lookup:', {
        priceId,
        planFound: !!plan,
        planDetails: plan,
        availablePlans: Object.keys(STRIPE_PLANS)
      })
    }
    
    if (!plan) {
      console.log('❌ Unknown price ID:', priceId)
      
      if (isDebugUser) {
        console.log('🐛 DEBUG - Unknown price ID. Available price IDs:', Object.keys(STRIPE_PLANS))
      }
      
      return {
        credits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        plan: 'free',
        planName: 'Free', 
        status: 'inactive',
        isActive: false,
        customerId: customer.id,
        pricePerMonth: 0
      }
    }
    
    // Get current billing period
    const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString()
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString()
    
    // Check and reset credit usage if new billing period
    const userUsage = creditUsage.get(clerkUserId)
    const currentMonth = currentPeriodStart.substring(0, 7) // YYYY-MM format
    
    if (isDebugUser) {
      console.log('🐛 DEBUG - Credit usage tracking:', {
        clerkUserId,
        currentPeriodStart,
        currentPeriodEnd,
        currentMonth,
        existingUsage: userUsage,
        creditUsageMapSize: creditUsage.size,
        allUsageEntries: Array.from(creditUsage.entries())
      })
    }
    
    let usedCredits = 0
    if (userUsage && userUsage.resetDate === currentMonth) {
      usedCredits = userUsage.used
    } else {
      // Reset credits for new billing period
      creditUsage.set(clerkUserId, { used: 0, resetDate: currentMonth })
      console.log('🔄 Credits reset for new billing period:', currentMonth)
      
      if (isDebugUser) {
        console.log('🐛 DEBUG - Credits reset for new billing period')
      }
    }
    
    const remainingCredits = Math.max(0, plan.credits - usedCredits)
    
    const result = {
      credits: plan.credits,
      usedCredits,
      remainingCredits,
      plan: plan.id,
      planName: plan.name,
      status: subscription.status,
      isActive: subscription.status === 'active',
      customerId: customer.id,
      subscriptionId: subscription.id,
      currentPeriodEnd,
      currentPeriodStart,
      pricePerMonth: plan.price
    }
    
    console.log('✅ Plan found with usage tracking:', {
      planName: plan.name,
      totalCredits: plan.credits,
      usedCredits,
      remainingCredits
    })
    
    if (isDebugUser) {
      console.log('🐛 DEBUG - Final result for ghareb4@gmail.com:', result)
    }
    
    return result
    
  } catch (error) {
    console.error('❌ Error getting Stripe-direct credits:', error)
    
    if (clerkUserId.includes('ghareb4')) {
      console.log('🐛 DEBUG - Error details for ghareb4@gmail.com:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined
      })
    }
    
    return {
      credits: 0,
      usedCredits: 0,
      remainingCredits: 0,
      plan: 'free',
      planName: 'Free',
      status: 'error',
      isActive: false,
      pricePerMonth: 0
    }
  }
}

/**
 * Check if user has enough credits and deduct them if successful
 */
export async function checkAndConsumeStripeDirectCredits(
  clerkUserId: string, 
  requiredCredits: number = 1,
  action: string = 'feature_usage'
): Promise<{
  hasCredits: boolean
  currentCredits: number
  remainingCredits: number
  requiredCredits: number
  plan: string
  planName: string
  success: boolean
}> {
  try {
    const creditData = await getStripeDirectCredits(clerkUserId)
    
    const hasCredits = creditData.isActive && creditData.remainingCredits >= requiredCredits
    
    if (hasCredits) {
      // Deduct credits
      const userUsage = creditUsage.get(clerkUserId)
      const currentMonth = creditData.currentPeriodStart?.substring(0, 7) || new Date().toISOString().substring(0, 7)
      
      const newUsedCredits = (userUsage?.used || 0) + requiredCredits
      creditUsage.set(clerkUserId, { used: newUsedCredits, resetDate: currentMonth })
      
      console.log(`💰 Consumed ${requiredCredits} credits for ${action}. New usage: ${newUsedCredits}/${creditData.credits}`)
      
      return {
        hasCredits: true,
        currentCredits: creditData.remainingCredits - requiredCredits,
        remainingCredits: creditData.remainingCredits - requiredCredits,
        requiredCredits,
        plan: creditData.plan,
        planName: creditData.planName,
        success: true
      }
    }
    
    console.log(`❌ Insufficient credits for ${action}:`, {
      required: requiredCredits,
      remaining: creditData.remainingCredits,
      plan: creditData.planName
    })
    
    return {
      hasCredits: false,
      currentCredits: creditData.remainingCredits,
      remainingCredits: creditData.remainingCredits,
      requiredCredits,
      plan: creditData.plan,
      planName: creditData.planName,
      success: false
    }
    
  } catch (error) {
    console.error('❌ Error checking and consuming Stripe-direct credits:', error)
    return {
      hasCredits: false,
      currentCredits: 0,
      remainingCredits: 0,
      requiredCredits,
      plan: 'free',
      planName: 'Free',
      success: false
    }
  }
}

/**
 * Check if user has enough credits (Stripe-direct) - READ ONLY
 */
export async function checkStripeDirectCredits(clerkUserId: string, requiredCredits: number = 1): Promise<{
  hasCredits: boolean
  currentCredits: number
  requiredCredits: number
  plan: string
  planName: string
}> {
  try {
    const creditData = await getStripeDirectCredits(clerkUserId)
    
    const result = {
      hasCredits: creditData.isActive && creditData.remainingCredits >= requiredCredits,
      currentCredits: creditData.remainingCredits,
      requiredCredits,
      plan: creditData.plan,
      planName: creditData.planName
    }
    
    console.log('💳 Stripe-direct credit check (read-only):', result)
    return result
    
  } catch (error) {
    console.error('❌ Error checking Stripe-direct credits:', error)
    return {
      hasCredits: false,
      currentCredits: 0,
      requiredCredits,
      plan: 'free',
      planName: 'Free'
    }
  }
}

/**
 * Get current user's Stripe-direct credits
 */
export async function getCurrentUserStripeCredits(): Promise<StripeDirectCreditData | null> {
  try {
    const user = await currentUser()
    if (!user) return null
    
    return await getStripeDirectCredits(user.id)
  } catch (error) {
    console.error('❌ Error getting current user Stripe credits:', error)
    return null
  }
}

/**
 * Create Stripe customer with proper metadata
 */
export async function createStripeCustomer(clerkUserId: string, email: string): Promise<string> {
  try {
    console.log('🆕 Creating Stripe customer for:', clerkUserId, email)
    
    const customer = await stripe.customers.create({
      email,
      metadata: {
        clerk_user_id: clerkUserId
      }
    })
    
    console.log('✅ Created Stripe customer:', customer.id)
    return customer.id
    
  } catch (error) {
    console.error('❌ Error creating Stripe customer:', error)
    throw error
  }
}

/**
 * Find or create Stripe customer
 */
export async function findOrCreateStripeCustomer(clerkUserId: string, email: string): Promise<string> {
  try {
    // First try to find existing customer
    const customers = await stripe.customers.search({
      query: `metadata['clerk_user_id']:'${clerkUserId}'`
    })
    
    if (customers.data.length > 0) {
      console.log('✅ Found existing Stripe customer:', customers.data[0].id)
      return customers.data[0].id
    }
    
    // Create new customer if not found
    return await createStripeCustomer(clerkUserId, email)
    
  } catch (error) {
    console.error('❌ Error finding/creating Stripe customer:', error)
    throw error
  }
}

/**
 * Validate Stripe webhook signature
 */
export function validateStripeWebhook(body: string, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  return stripe.webhooks.constructEvent(body, signature, webhookSecret)
}

/**
 * Get plan details by price ID
 */
export function getPlanByPriceId(priceId: string) {
  return STRIPE_PLANS[priceId as keyof typeof STRIPE_PLANS] || null
}

/**
 * Format credits for display
 */
export function formatCredits(credits: number): string {
  return credits.toLocaleString()
}

/**
 * Check if plan is active
 */
export function isPlanActive(status: string): boolean {
  return status === 'active'
}
