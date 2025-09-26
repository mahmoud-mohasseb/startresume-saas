import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types
export interface Subscription {
  id: string
  user_id: string
  clerk_user_id: string
  plan: 'basic' | 'standard' | 'pro'
  credits: number
  stripe_subscription_id?: string
  stripe_customer_id?: string
  status: 'active' | 'canceled' | 'past_due'
  current_period_start?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

export interface CreditHistory {
  id: string
  user_id: string
  clerk_user_id: string
  action: string
  credits_used: number
  credits_remaining: number
  description?: string
  created_at: string
}

export interface User {
  id: string
  clerk_user_id: string
  email: string
  created_at: string
  updated_at: string
}

// Plan configurations
export const PLAN_CONFIGS = {
  basic: { credits: 10, price: 9.99 },
  standard: { credits: 50, price: 19.99 },
  pro: { credits: 200, price: 49.99 }
}

// User Management
export async function createUser(clerkUserId: string, email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          clerk_user_id: clerkUserId,
          email: email
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating user:', error)
    return null
  }
}

export async function getUser(clerkUserId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error) {
      console.error('Error getting user:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// Subscription Management
export async function createSubscription(
  clerkUserId: string,
  plan: 'basic' | 'standard' | 'pro',
  stripeSubscriptionId?: string,
  stripeCustomerId?: string
): Promise<Subscription | null> {
  try {
    // First ensure user exists
    let user = await getUser(clerkUserId)
    if (!user) {
      // Create user if doesn't exist
      user = await createUser(clerkUserId, `${clerkUserId}@temp.com`)
      if (!user) {
        throw new Error('Failed to create user')
      }
    }

    const planConfig = PLAN_CONFIGS[plan]
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([
        {
          user_id: user.id,
          clerk_user_id: clerkUserId,
          plan: plan,
          credits: planConfig.credits,
          stripe_subscription_id: stripeSubscriptionId,
          stripe_customer_id: stripeCustomerId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error creating subscription:', error)
    return null
  }
}

export async function getSubscription(clerkUserId: string): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error getting subscription:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error getting subscription:', error)
    return null
  }
}

export async function updateSubscriptionCredits(
  clerkUserId: string,
  credits: number
): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ 
        credits: credits,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', clerkUserId)
      .eq('status', 'active')
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription credits:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating subscription credits:', error)
    return null
  }
}

// Credit Management
export async function deductCredits(
  clerkUserId: string,
  action: string,
  creditsToDeduct: number = 1,
  description?: string
): Promise<{ success: boolean; remainingCredits: number }> {
  try {
    // Get current subscription
    const subscription = await getSubscription(clerkUserId)
    if (!subscription) {
      return { success: false, remainingCredits: 0 }
    }

    // Check if user has enough credits
    if (subscription.credits < creditsToDeduct) {
      return { success: false, remainingCredits: subscription.credits }
    }

    // Deduct credits
    const newCredits = subscription.credits - creditsToDeduct
    const updatedSubscription = await updateSubscriptionCredits(clerkUserId, newCredits)
    
    if (!updatedSubscription) {
      return { success: false, remainingCredits: subscription.credits }
    }

    // Log credit usage
    await logCreditUsage(clerkUserId, action, creditsToDeduct, newCredits, description)

    return { success: true, remainingCredits: newCredits }
  } catch (error) {
    console.error('Error deducting credits:', error)
    return { success: false, remainingCredits: 0 }
  }
}

export async function logCreditUsage(
  clerkUserId: string,
  action: string,
  creditsUsed: number,
  creditsRemaining: number,
  description?: string
): Promise<CreditHistory | null> {
  try {
    // Get user
    const user = await getUser(clerkUserId)
    if (!user) {
      return null
    }

    const { data, error } = await supabase
      .from('credit_history')
      .insert([
        {
          user_id: user.id,
          clerk_user_id: clerkUserId,
          action: action,
          credits_used: creditsUsed,
          credits_remaining: creditsRemaining,
          description: description || `Used ${creditsUsed} credits for ${action}`
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Error logging credit usage:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error logging credit usage:', error)
    return null
  }
}

export async function getCreditHistory(
  clerkUserId: string,
  limit: number = 50
): Promise<CreditHistory[]> {
  try {
    const { data, error } = await supabase
      .from('credit_history')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error getting credit history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error getting credit history:', error)
    return []
  }
}

// Monthly credit refresh (to be called by cron job or webhook)
export async function refreshMonthlyCredits(clerkUserId: string): Promise<boolean> {
  try {
    const subscription = await getSubscription(clerkUserId)
    if (!subscription) {
      return false
    }

    const planConfig = PLAN_CONFIGS[subscription.plan]
    const updatedSubscription = await updateSubscriptionCredits(clerkUserId, planConfig.credits)
    
    if (updatedSubscription) {
      // Log the credit refresh
      await logCreditUsage(
        clerkUserId,
        'monthly_refresh',
        0,
        planConfig.credits,
        `Monthly credits refreshed for ${subscription.plan} plan`
      )
      return true
    }

    return false
  } catch (error) {
    console.error('Error refreshing monthly credits:', error)
    return false
  }
}
