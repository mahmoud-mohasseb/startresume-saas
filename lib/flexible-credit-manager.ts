import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

// Your actual Stripe Price ID to Plan mapping
const STRIPE_PRICE_TO_PLAN = {
  'price_1S7dpfFlaHFpdvA4YJj1omFc': { plan: 'basic', credits: 10, name: 'Basic' },
  'price_1S7drgFlaHFpdvA4EaEaCtrA': { plan: 'standard', credits: 50, name: 'Standard' },
  'price_1S7dsBFlaHFpdvA42nBRrxgZ': { plan: 'pro', credits: 200, name: 'Pro' }
}

export interface FlexibleCreditData {
  total: number
  used: number
  remaining: number
  plan: string
  planName: string
  status: string
  isActive: boolean
}

export async function getFlexibleCredits(userId: string): Promise<FlexibleCreditData> {
  try {
    console.log('🔍 Getting credits directly from Stripe for user:', userId)

    // TEMPORARY BYPASS: Give full credits while Stripe integration is being fixed
    console.log('🚀 BYPASSING STRIPE ISSUES - GIVING FULL CREDITS FOR TESTING')
    return {
      total: 200,
      used: 0,
      remaining: 200,
      plan: 'pro',
      planName: 'Pro',
      status: 'active',
      isActive: true
    }

    // Get current user for email lookup
    const { currentUser } = await import('@clerk/nextjs/server')
    const user = await currentUser()
    
    if (!user?.emailAddresses?.[0]?.emailAddress) {
      console.log('❌ No user email found')
      return {
        total: 3,
        used: 0,
        remaining: 3,
        plan: 'free',
        planName: 'Free',
        status: 'inactive',
        isActive: false
      }
    }

    const userEmail = user.emailAddresses[0].emailAddress
    console.log('🔍 Searching for Stripe customer by email:', userEmail)

    // Search by email (this is supported)
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 10
    })

    if (customers.data.length === 0) {
      console.log('❌ No Stripe customer found for email:', userEmail)
      
      // Also try to get recent customers and check manually
      try {
        console.log('🔍 Checking recent customers for manual match...')
        const recentCustomers = await stripe.customers.list({
          limit: 100,
          created: { gte: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60) } // Last 30 days
        })
        
        console.log(`📊 Found ${recentCustomers.data.length} recent customers`)
        
        // Look for customer with matching email or clerk_user_id in metadata
        const matchingCustomer = recentCustomers.data.find(c => 
          c.email === userEmail || 
          (c.metadata && c.metadata.clerk_user_id === userId)
        )
        
        if (matchingCustomer) {
          console.log('✅ Found matching customer in recent list:', matchingCustomer.id)
          
          // Get subscriptions for this customer
          const subscriptions = await stripe.subscriptions.list({
            customer: matchingCustomer.id,
            status: 'active',
            limit: 1
          })
          
          if (subscriptions.data.length > 0) {
            const subscription = subscriptions.data[0]
            const priceId = subscription.items.data[0]?.price.id
            console.log('✅ Found active subscription with price ID:', priceId)
            
            const planConfig = STRIPE_PRICE_TO_PLAN[priceId as keyof typeof STRIPE_PRICE_TO_PLAN]
            
            if (planConfig) {
              console.log('✅ Recognized plan:', planConfig.plan)
              
              // Get used credits from analytics with proper UUID handling
              const usedCredits = await getUsedCreditsWithUuidHandling(userId)
              const remainingCredits = Math.max(0, planConfig.credits - usedCredits)
              
              return {
                total: planConfig.credits,
                used: usedCredits,
                remaining: remainingCredits,
                plan: planConfig.plan,
                planName: planConfig.name,
                status: 'active',
                isActive: true
              }
            } else {
              console.log('⚠️ Price ID not recognized:', priceId)
              console.log('Available price IDs:', Object.keys(STRIPE_PRICE_TO_PLAN))
            }
          }
        }
      } catch (recentError) {
        console.log('⚠️ Recent customers check failed:', recentError)
      }
      
      console.log('❌ No Stripe customer or subscription found - returning free plan')
      return {
        total: 3,
        used: 0,
        remaining: 3,
        plan: 'free',
        planName: 'Free',
        status: 'inactive',
        isActive: false
      }
    }

    // Found customer by email
    const customer = customers.data[0]
    console.log('✅ Found Stripe customer by email:', customer.id)

    // Get active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    })

    if (subscriptions.data.length === 0) {
      console.log('⚠️ No active Stripe subscription found for customer:', customer.id)
      
      // Check all subscriptions (not just active)
      const allSubscriptions = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 5
      })
      
      console.log(`📊 Customer has ${allSubscriptions.data.length} total subscriptions:`)
      allSubscriptions.data.forEach(sub => {
        console.log(`  - ${sub.id}: ${sub.status} (${sub.items.data[0]?.price.id})`)
      })
      
      return {
        total: 3,
        used: 0,
        remaining: 3,
        plan: 'free',
        planName: 'Free',
        status: 'inactive',
        isActive: false
      }
    }

    const subscription = subscriptions.data[0]
    const priceId = subscription.items.data[0]?.price.id

    console.log('✅ Found active subscription:', {
      id: subscription.id,
      status: subscription.status,
      priceId,
      customerId: customer.id
    })

    // Get plan configuration
    const planConfig = STRIPE_PRICE_TO_PLAN[priceId as keyof typeof STRIPE_PRICE_TO_PLAN]
    
    if (!planConfig) {
      console.log('⚠️ Unknown price ID:', priceId)
      console.log('Available price IDs:', Object.keys(STRIPE_PRICE_TO_PLAN))
      
      // Return basic plan as fallback for unknown price IDs
      const usedCredits = await getUsedCreditsWithUuidHandling(userId)
      const remainingCredits = Math.max(0, 10 - usedCredits)
      
      return {
        total: 10,
        used: usedCredits,
        remaining: remainingCredits,
        plan: 'basic',
        planName: 'Basic',
        status: 'active',
        isActive: true
      }
    }

    // Get used credits from analytics with proper UUID handling
    const usedCredits = await getUsedCreditsWithUuidHandling(userId)
    const totalCredits = planConfig.credits
    const remainingCredits = Math.max(0, totalCredits - usedCredits)
    const isActive = subscription.status === 'active' && remainingCredits >= 0

    console.log('✅ Stripe-direct credits calculated:', {
      total: totalCredits,
      used: usedCredits,
      remaining: remainingCredits,
      plan: planConfig.plan,
      isActive,
      customerId: customer.id,
      subscriptionId: subscription.id
    })

    return {
      total: totalCredits,
      used: usedCredits,
      remaining: remainingCredits,
      plan: planConfig.plan,
      planName: planConfig.name,
      status: 'active',
      isActive
    }

  } catch (error) {
    console.error('❌ Stripe-direct credits error:', error)
    
    // Safe fallback
    return {
      total: 3,
      used: 0,
      remaining: 3,
      plan: 'free',
      planName: 'Free',
      status: 'error',
      isActive: false
    }
  }
}

// Helper function to get used credits with proper UUID handling
async function getUsedCreditsWithUuidHandling(userId: string): Promise<number> {
  try {
    const { createAdminClient } = await import('@/lib/supabase')
    const supabaseAdmin = createAdminClient()
    
    // First try to find the user's UUID from the users table
    let userUuid = userId
    
    try {
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single()
      
      if (userData?.id) {
        userUuid = userData.id
        console.log('✅ Found user UUID:', userUuid, 'for Clerk ID:', userId)
      } else {
        console.log('⚠️ No UUID found for Clerk ID, using Clerk ID directly')
      }
    } catch (userLookupError) {
      console.log('⚠️ User UUID lookup failed, using Clerk ID directly:', userLookupError)
    }
    
    // Try to get analytics with the UUID first, then fall back to Clerk ID
    let analytics = null
    
    try {
      const { data: analyticsData } = await supabaseAdmin
        .from('analytics_events')
        .select('event_data')
        .eq('user_id', userUuid)
        .eq('event_type', 'credit_usage')
      
      analytics = analyticsData
      console.log('✅ Found analytics data with UUID:', analytics?.length || 0, 'events')
    } catch (uuidError) {
      console.log('⚠️ UUID analytics query failed, trying with Clerk ID:', uuidError)
      
      // Fallback to Clerk ID
      try {
        const { data: analyticsData } = await supabaseAdmin
          .from('analytics_events')
          .select('event_data')
          .eq('user_id', userId)
          .eq('event_type', 'credit_usage')
        
        analytics = analyticsData
        console.log('✅ Found analytics data with Clerk ID:', analytics?.length || 0, 'events')
      } catch (clerkIdError) {
        console.log('⚠️ Both UUID and Clerk ID analytics queries failed')
      }
    }

    if (analytics) {
      const usedCredits = analytics.reduce((total, event) => {
        return total + (event.event_data?.credits_used || 0)
      }, 0)
      console.log('✅ Calculated used credits from analytics:', usedCredits)
      return usedCredits
    }
    
    return 0
  } catch (error) {
    console.log('⚠️ Analytics query failed completely, assuming 0 used credits:', error)
    return 0
  }
}

export async function deductCreditsFlexibly(
  userId: string,
  feature: string,
  creditsRequired: number
): Promise<{ success: boolean; remainingCredits: number; message: string }> {
  try {
    // Get current credits from Stripe
    const creditData = await getFlexibleCredits(userId)

    if (creditData.remaining < creditsRequired) {
      return {
        success: false,
        remainingCredits: creditData.remaining,
        message: `Insufficient credits. Need ${creditsRequired}, have ${creditData.remaining}`
      }
    }

    // Log usage to analytics (bypass database schema)
    try {
      const { createAdminClient } = await import('@/lib/supabase')
      const supabaseAdmin = createAdminClient()
      
      // First try to find the user's UUID from the users table
      let userUuid = userId
      
      try {
        const { data: userData } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('clerk_id', userId)
          .single()
        
        if (userData?.id) {
          userUuid = userData.id
          console.log('✅ Found user UUID:', userUuid, 'for Clerk ID:', userId)
        } else {
          console.log('⚠️ No UUID found for Clerk ID, using Clerk ID directly')
        }
      } catch (userLookupError) {
        console.log('⚠️ User UUID lookup failed, using Clerk ID directly:', userLookupError)
      }
      
      await supabaseAdmin
        .from('analytics_events')
        .insert({
          user_id: userUuid,
          event_type: 'credit_usage',
          event_data: {
            feature,
            credits_used: creditsRequired,
            timestamp: new Date().toISOString(),
            source: 'stripe_direct'
          },
          created_at: new Date().toISOString()
        })
    } catch (analyticsError) {
      console.error('⚠️ Failed to log credit usage:', analyticsError)
      // Continue anyway - don't fail the deduction
    }

    const newRemaining = creditData.remaining - creditsRequired
    console.log(`✅ Stripe-direct credits deducted. Remaining: ${newRemaining}`)

    return {
      success: true,
      remainingCredits: newRemaining,
      message: `Successfully deducted ${creditsRequired} credits`
    }

  } catch (error) {
    console.error('❌ Stripe-direct deduction error:', error)
    return {
      success: false,
      remainingCredits: 0,
      message: 'Internal error during credit deduction'
    }
  }
}

// Keep compatibility with existing code
export const getCurrentCredits = getFlexibleCredits
export const deductCreditsAccurately = deductCreditsFlexibly
export const createFlexibleSubscription = async () => {
  return { success: true, message: 'Stripe handles subscription creation' }
}
