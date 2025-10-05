import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types
export interface Subscription {
  id: string
  user_id: string
  clerk_user_id?: string
  plan: 'basic' | 'standard' | 'pro'
  credits: number
  credits_used: number
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
      .eq('user_id', clerkUserId)
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
    const planConfig = PLAN_CONFIGS[plan]
    
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert([
        {
          user_id: clerkUserId, // Use clerkUserId directly as user_id
          plan: plan,
          credits: planConfig.credits,
          credits_used: 0, // Initialize with 0 used credits
          stripe_subscription_id: stripeSubscriptionId,
          stripe_customer_id: stripeCustomerId,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        }
      ], {
        onConflict: 'user_id'
      })
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
      .eq('user_id', clerkUserId) // Use user_id instead of clerk_user_id
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
        credits_used: 0, // Reset used credits when updating total credits
        updated_at: new Date().toISOString()
      })
      .eq('user_id', clerkUserId)
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
      console.error('No subscription found for user:', clerkUserId)
      return { success: false, remainingCredits: 0 }
    }

    // Check if subscription is active
    if (subscription.status !== 'active') {
      console.error('Subscription not active for user:', clerkUserId, 'status:', subscription.status)
      return { success: false, remainingCredits: subscription.credits }
    }

    // Calculate remaining credits
    const remainingCredits = subscription.credits - subscription.credits_used
    
    // Check if user has enough credits
    if (remainingCredits < creditsToDeduct) {
      console.error('Insufficient credits for user:', clerkUserId, 'required:', creditsToDeduct, 'available:', remainingCredits)
      return { success: false, remainingCredits: remainingCredits }
    }

    // Deduct credits by increasing credits_used
    const newCreditsUsed = subscription.credits_used + creditsToDeduct
    const newRemainingCredits = subscription.credits - newCreditsUsed
    
    // Use atomic update to prevent race conditions
    const { data: updatedSubscription, error } = await supabase
      .from('subscriptions')
      .update({ 
        credits_used: newCreditsUsed,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', clerkUserId)
      .eq('credits_used', subscription.credits_used) // Ensure credits_used hasn't changed since we read them
      .select()
      .single()
    
    if (error || !updatedSubscription) {
      console.error('Failed to update credits atomically:', error)
      return { success: false, remainingCredits: remainingCredits }
    }

    // Log credit usage
    await logCreditUsage(clerkUserId, action, creditsToDeduct, newRemainingCredits, description)

    console.log(`✅ Credits deducted successfully: ${remainingCredits} → ${newRemainingCredits} for user ${clerkUserId}`)
    return { success: true, remainingCredits: newRemainingCredits }
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
      .eq('user_id', clerkUserId)
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

// Update subscription status
export async function updateSubscriptionStatus(
  clerkUserId: string,
  status: 'active' | 'canceled' | 'past_due'
): Promise<Subscription | null> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', clerkUserId)
      .select()
      .single()

    if (error) {
      console.error('Error updating subscription status:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error updating subscription status:', error)
    return null
  }
}

// Cancel subscription
export async function cancelSubscription(clerkUserId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', clerkUserId)

    if (error) {
      console.error('Error canceling subscription:', error)
      return false
    }

    // Log the cancellation
    await logCreditUsage(
      clerkUserId,
      'subscription_canceled',
      0,
      0,
      'Subscription canceled'
    )

    return true
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return false
  }
}

// Prevent automatic subscription restart
export async function preventAutoRestart(clerkUserId: string): Promise<boolean> {
  try {
    // Add a flag to prevent auto-restart
    const { error } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', clerkUserId)
      .eq('status', 'active')

    if (error) {
      console.error('Error preventing auto-restart:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error preventing auto-restart:', error)
    return false
  }
}

// Monthly credit refresh (to be called by cron job or webhook)
export async function refreshMonthlyCredits(clerkUserId: string): Promise<boolean> {
  try {
    const subscription = await getSubscription(clerkUserId)
    if (!subscription) {
      return false
    }

    // Only refresh if subscription is active
    if (subscription.status !== 'active') {
      console.log('Subscription not active, skipping credit refresh')
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

// Sync credits between Stripe and database
export async function syncCreditsWithStripe(
  clerkUserId: string,
  stripeCredits: number,
  forceUpdate: boolean = false
): Promise<boolean> {
  try {
    const subscription = await getSubscription(clerkUserId)
    
    if (!subscription) {
      console.log('No subscription found for credit sync')
      return false
    }

    // Only sync if there's a discrepancy or force update
    if (subscription.credits !== stripeCredits || forceUpdate) {
      console.log(`Syncing credits: DB=${subscription.credits}, Stripe=${stripeCredits}`)
      
      const updated = await updateSubscriptionCredits(clerkUserId, stripeCredits)
      
      if (updated) {
        await logCreditUsage(
          clerkUserId,
          'credit_sync',
          0,
          stripeCredits,
          `Credits synced with Stripe: ${subscription.credits} → ${stripeCredits}`
        )
        return true
      }
    }

    return true
  } catch (error) {
    console.error('Error syncing credits with Stripe:', error)
    return false
  }
}
