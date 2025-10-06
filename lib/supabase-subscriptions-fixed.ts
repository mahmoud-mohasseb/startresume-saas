import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Types that match the actual database schema
interface Subscription {
  id: string
  user_id: string // This might be UUID or TEXT depending on your schema
  plan: string
  credits: number
  status: string
  stripe_subscription_id?: string
  stripe_customer_id?: string
  current_period_start?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

interface CreditHistory {
  id: string
  user_id: string
  action: string
  credits_used: number
  remaining_credits: number
  description?: string
  created_at: string
}

const PLAN_CONFIGS = {
  basic: { credits: 10, name: 'Basic' },
  standard: { credits: 50, name: 'Standard' },
  pro: { credits: 200, name: 'Pro' }
}

// Get subscription - works with current schema
export async function getSubscription(clerkUserId: string): Promise<Subscription | null> {
  try {
    console.log('Getting subscription for user:', clerkUserId)
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', clerkUserId)
      .eq('status', 'active')
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

// Create subscription - works without credits_used column
export async function createSubscription(
  clerkUserId: string,
  plan: 'basic' | 'standard' | 'pro',
  stripeSubscriptionId?: string,
  stripeCustomerId?: string
): Promise<Subscription | null> {
  try {
    const planConfig = PLAN_CONFIGS[plan]
    
    console.log('📝 Creating database subscription for user:', clerkUserId)
    
    const subscriptionData = {
      user_id: clerkUserId,
      plan: plan,
      credits: planConfig.credits,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_customer_id: stripeCustomerId,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(subscriptionData, {
        onConflict: 'user_id'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating subscription:', error)
      return null
    }

    console.log('✅ Subscription created successfully:', data.id)
    return data
  } catch (error) {
    console.error('Error creating subscription:', error)
    return null
  }
}

// Deduct credits - use credit_history table for tracking usage
export async function deductCredits(
  clerkUserId: string,
  creditsToDeduct: number,
  action: string,
  description?: string
): Promise<{ success: boolean; remainingCredits: number }> {
  try {
    console.log(`Deducting ${creditsToDeduct} credits for user: ${clerkUserId}, action: ${action}`)

    // Get current subscription
    const subscription = await getSubscription(clerkUserId)
    if (!subscription) {
      console.error('No subscription found for user:', clerkUserId)
      return { success: false, remainingCredits: 0 }
    }

    // Calculate used credits from credit_history
    const { data: creditHistory, error: historyError } = await supabase
      .from('credit_history')
      .select('credits_used')
      .eq('user_id', clerkUserId)

    let totalUsed = 0
    if (!historyError && creditHistory) {
      totalUsed = creditHistory.reduce((sum, record) => sum + record.credits_used, 0)
    }

    const remainingCredits = subscription.credits - totalUsed
    
    // Check if user has enough credits
    if (remainingCredits < creditsToDeduct) {
      console.error('Insufficient credits for user:', clerkUserId, 'required:', creditsToDeduct, 'available:', remainingCredits)
      return { success: false, remainingCredits: remainingCredits }
    }

    // Log credit usage
    const { error: logError } = await supabase
      .from('credit_history')
      .insert({
        user_id: clerkUserId,
        action: action,
        credits_used: creditsToDeduct,
        remaining_credits: remainingCredits - creditsToDeduct,
        description: description || `Used ${creditsToDeduct} credits for ${action}`
      })

    if (logError) {
      console.error('Error logging credit usage:', logError)
      return { success: false, remainingCredits: remainingCredits }
    }

    const newRemainingCredits = remainingCredits - creditsToDeduct
    console.log(`✅ Credits deducted successfully: ${remainingCredits} → ${newRemainingCredits} for user ${clerkUserId}`)
    return { success: true, remainingCredits: newRemainingCredits }
  } catch (error) {
    console.error('Error deducting credits:', error)
    return { success: false, remainingCredits: 0 }
  }
}

// Get credit usage from history
export async function getCreditUsage(clerkUserId: string): Promise<{ totalCredits: number; usedCredits: number; remainingCredits: number }> {
  try {
    // Get subscription
    const subscription = await getSubscription(clerkUserId)
    if (!subscription) {
      return { totalCredits: 0, usedCredits: 0, remainingCredits: 0 }
    }

    // Calculate used credits from credit_history
    const { data: creditHistory, error: historyError } = await supabase
      .from('credit_history')
      .select('credits_used')
      .eq('user_id', clerkUserId)

    let totalUsed = 0
    if (!historyError && creditHistory) {
      totalUsed = creditHistory.reduce((sum, record) => sum + record.credits_used, 0)
    }

    return {
      totalCredits: subscription.credits,
      usedCredits: totalUsed,
      remainingCredits: subscription.credits - totalUsed
    }
  } catch (error) {
    console.error('Error getting credit usage:', error)
    return { totalCredits: 0, usedCredits: 0, remainingCredits: 0 }
  }
}

// Update subscription credits (for plan upgrades)
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

// Refresh monthly credits (reset usage)
export async function refreshMonthlyCredits(clerkUserId: string): Promise<boolean> {
  try {
    // For monthly refresh, we could either:
    // 1. Clear credit_history (if you want to reset usage)
    // 2. Add a "monthly_refresh" entry to credit_history
    // 3. Update subscription with new period dates
    
    const subscription = await getSubscription(clerkUserId)
    if (!subscription) {
      return false
    }

    // Update subscription period
    const { error } = await supabase
      .from('subscriptions')
      .update({
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', clerkUserId)

    if (error) {
      console.error('Error refreshing monthly credits:', error)
      return false
    }

    // Log the refresh
    await supabase
      .from('credit_history')
      .insert({
        user_id: clerkUserId,
        action: 'monthly_refresh',
        credits_used: -subscription.credits, // Negative to indicate credit addition
        remaining_credits: subscription.credits,
        description: 'Monthly credit refresh'
      })

    console.log(`✅ Monthly credits refreshed for user: ${clerkUserId}`)
    return true
  } catch (error) {
    console.error('Error refreshing monthly credits:', error)
    return false
  }
}
