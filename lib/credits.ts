import { supabaseAdmin } from './supabase';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  credits: number;
  credits_used: number;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export const PLAN_CREDITS = {
  'free': 3,
  'basic': 10,
  'standard': 50,
  'pro': 200
};

export const CREDIT_COSTS = {
  resume_generation: 5,
  cover_letter_generation: 3,
  job_tailoring: 3,
  salary_negotiation: 2,
  linkedin_optimization: 4,
  personal_brand_strategy: 8,
  mock_interview: 6,
  ai_suggestions: 1
};

/**
 * Get database user ID from Clerk ID
 */
async function getDbUserId(clerkId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin()
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();

    if (error) {
      console.error('Error getting database user ID:', error);
      return null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error in getDbUserId:', error);
    return null;
  }
}

/**
 * Get user's current subscription and credit balance
 */
export async function getUserSubscription(clerkId: string): Promise<UserSubscription | null> {
  try {
    const dbUserId = await getDbUserId(clerkId);
    if (!dbUserId) {
      return null;
    }

    const { data, error } = await supabaseAdmin()
      .from('subscriptions')
      .select('*')
      .eq('user_id', dbUserId)
      .single();

    if (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    return null;
  }
}

/**
 * Create default subscription for new user
 */
export async function createDefaultSubscription(clerkId: string): Promise<UserSubscription | null> {
  try {
    const dbUserId = await getDbUserId(clerkId);
    if (!dbUserId) {
      return null;
    }

    const { data, error } = await supabaseAdmin()
      .from('subscriptions')
      .insert({
        user_id: dbUserId,
        plan: 'basic',
        credits: PLAN_CREDITS.basic,
        credits_used: 0,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating default subscription:', error);
      return null;
    }

    // Log analytics event
    await supabaseAdmin()
      .from('analytics_events')
      .insert({
        user_id: dbUserId,
        event_type: 'subscription_created',
        event_data: {
          plan: 'basic',
          credits: PLAN_CREDITS.basic,
          type: 'default'
        }
      });

    return data;
  } catch (error) {
    console.error('Error in createDefaultSubscription:', error);
    return null;
  }
}

/**
 * Check if user has enough credits for an action
 */
export async function hasEnoughCredits(
  clerkId: string, 
  action: keyof typeof CREDIT_COSTS
): Promise<{ hasCredits: boolean; currentCredits: number; requiredCredits: number }> {
  const subscription = await getUserSubscription(clerkId);
  const requiredCredits = CREDIT_COSTS[action] || 0;
  
  if (!subscription) {
    return {
      hasCredits: false,
      currentCredits: 0,
      requiredCredits
    };
  }

  const availableCredits = subscription.credits - (subscription.credits_used || 0);

  return {
    hasCredits: availableCredits >= requiredCredits,
    currentCredits: availableCredits,
    requiredCredits
  };
}

/**
 * Consume credits for an action
 */
export async function consumeCredits(
  clerkId: string,
  action: keyof typeof CREDIT_COSTS,
  metadata?: Record<string, any>
): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
  const creditCost = CREDIT_COSTS[action] || 0;
  
  if (creditCost === 0) {
    return { success: true, remainingCredits: 0 };
  }

  try {
    const dbUserId = await getDbUserId(clerkId);
    if (!dbUserId) {
      return {
        success: false,
        remainingCredits: 0,
        error: 'User not found'
      };
    }

    // Get current subscription
    const subscription = await getUserSubscription(clerkId);
    
    if (!subscription) {
      return {
        success: false,
        remainingCredits: 0,
        error: 'No active subscription found'
      };
    }

    const currentCreditsUsed = subscription.credits_used || 0;
    const availableCredits = subscription.credits - currentCreditsUsed;

    if (availableCredits < creditCost) {
      return {
        success: false,
        remainingCredits: availableCredits,
        error: 'Insufficient credits'
      };
    }

    const newCreditsUsed = currentCreditsUsed + creditCost;

    // Update credits
    const { error: updateError } = await supabaseAdmin()
      .from('subscriptions')
      .update({
        credits_used: newCreditsUsed,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', dbUserId);

    if (updateError) {
      console.error('Error updating credits:', updateError);
      return {
        success: false,
        remainingCredits: availableCredits,
        error: 'Failed to update credits'
      };
    }

    // Log credit usage
    await logCreditUsage(dbUserId, action, creditCost, metadata);

    return {
      success: true,
      remainingCredits: subscription.credits - newCreditsUsed
    };

  } catch (error) {
    console.error('Error consuming credits:', error);
    return {
      success: false,
      remainingCredits: 0,
      error: 'Internal error'
    };
  }
}

/**
 * Get credit usage history for a user
 */
export async function getCreditUsageHistory(
  clerkId: string,
  limit: number = 50
): Promise<Array<{
  action: string;
  credits_used: number;
  timestamp: string;
  metadata?: Record<string, any>;
}>> {
  try {
    const dbUserId = await getDbUserId(clerkId);
    if (!dbUserId) {
      return [];
    }

    const { data, error } = await supabaseAdmin()
      .from('analytics_events')
      .select('event_data, created_at')
      .eq('user_id', dbUserId)
      .eq('event_type', 'credit_usage')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching credit usage history:', error);
      return [];
    }

    return data.map(item => ({
      action: item.event_data.action,
      credits_used: item.event_data.credits_used,
      timestamp: item.created_at,
      metadata: item.event_data
    }));
  } catch (error) {
    console.error('Error in getCreditUsageHistory:', error);
    return [];
  }
}

/**
 * Refresh credits for a subscription (called monthly)
 */
export async function refreshSubscriptionCredits(clerkId: string): Promise<boolean> {
  try {
    const dbUserId = await getDbUserId(clerkId);
    if (!dbUserId) {
      return false;
    }

    const subscription = await getUserSubscription(clerkId);
    
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const planCredits = PLAN_CREDITS[subscription.plan];
    
    const { error } = await supabaseAdmin()
      .from('subscriptions')
      .update({
        credits: planCredits,
        credits_used: 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', dbUserId);

    if (error) {
      console.error('Error refreshing credits:', error);
      return false;
    }

    // Log analytics event
    await supabaseAdmin()
      .from('analytics_events')
      .insert({
        user_id: dbUserId,
        event_type: 'credits_refreshed',
        event_data: {
          plan: subscription.plan,
          credits: planCredits,
          type: 'monthly_refresh'
        }
      });

    return true;
  } catch (error) {
    console.error('Error in refreshSubscriptionCredits:', error);
    return false;
  }
}

/**
 * Log credit usage for analytics
 */
async function logCreditUsage(
  dbUserId: string,
  action: string,
  creditsUsed: number,
  metadata?: Record<string, any>
) {
  try {
    await supabaseAdmin()
      .from('analytics_events')
      .insert({
        user_id: dbUserId,
        event_type: 'credit_usage',
        event_data: {
          action,
          credits_used: creditsUsed,
          timestamp: new Date().toISOString(),
          ...metadata
        }
      });
  } catch (error) {
    console.error('Error logging credit usage:', error);
  }
}

/**
 * Get subscription analytics for admin dashboard
 */
export async function getSubscriptionAnalytics(): Promise<{
  totalSubscriptions: number;
  activeSubscriptions: number;
  planDistribution: Record<string, number>;
  totalCreditsUsed: number;
  revenueMetrics: {
    basic: number;
    standard: number;
    pro: number;
  };
}> {
  try {
    // Get subscription counts
    const { data: subscriptions } = await supabaseAdmin()
      .from('subscriptions')
      .select('plan, status, credits_used');

    const totalSubscriptions = subscriptions?.length || 0;
    const activeSubscriptions = subscriptions?.filter(s => s.status === 'active').length || 0;

    // Plan distribution
    const planDistribution = subscriptions?.reduce((acc, sub) => {
      acc[sub.plan] = (acc[sub.plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Total credits used
    const totalCreditsUsed = subscriptions?.reduce((sum, sub) => sum + (sub.credits_used || 0), 0) || 0;

    // Revenue metrics (approximate)
    const revenueMetrics = {
      basic: (planDistribution.basic || 0) * 9.99,
      standard: (planDistribution.standard || 0) * 19.99,
      pro: (planDistribution.pro || 0) * 49.99
    };

    return {
      totalSubscriptions,
      activeSubscriptions,
      planDistribution,
      totalCreditsUsed,
      revenueMetrics
    };
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    return {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      planDistribution: {},
      totalCreditsUsed: 0,
      revenueMetrics: { basic: 0, standard: 0, pro: 0 }
    };
  }
}
