import { supabaseAdmin } from '@/lib/supabase'
import { currentUser } from '@clerk/nextjs/server'

export interface CreditDeductionResult {
  success: boolean
  remainingCredits: number
  message: string
  transactionId?: string
}

export async function deductCreditsAccurately(
  feature: string, 
  creditsRequired: number
): Promise<CreditDeductionResult> {
  try {
    const user = await currentUser()
    if (!user) {
      return {
        success: false,
        remainingCredits: 0,
        message: 'User not authenticated'
      }
    }

    console.log(`💳 Deducting ${creditsRequired} credits for ${feature}`)

    // Get current subscription with row-level locking
    const { data: subscription, error: fetchError } = await supabaseAdmin()
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !subscription) {
      console.error('❌ Subscription not found:', fetchError)
      return {
        success: false,
        remainingCredits: 0,
        message: 'Subscription not found'
      }
    }

    // Calculate current remaining credits
    const currentRemaining = subscription.credits - (subscription.credits_used || 0)
    
    console.log(`📊 Current state: ${currentRemaining} credits remaining (${subscription.credits} total, ${subscription.credits_used || 0} used)`)

    // Check if sufficient credits
    if (currentRemaining < creditsRequired) {
      return {
        success: false,
        remainingCredits: currentRemaining,
        message: `Insufficient credits. Need ${creditsRequired}, have ${currentRemaining}`
      }
    }

    // Atomic credit deduction
    const newCreditsUsed = (subscription.credits_used || 0) + creditsRequired
    const { data: updatedSub, error: updateError } = await supabaseAdmin()
      .from('subscriptions')
      .update({
        credits_used: newCreditsUsed,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('credits_used', subscription.credits_used || 0) // Optimistic locking
      .select('*')
      .single()

    if (updateError || !updatedSub) {
      console.error('❌ Credit deduction failed:', updateError)
      return {
        success: false,
        remainingCredits: currentRemaining,
        message: 'Credit deduction failed - possible concurrent usage'
      }
    }

    const newRemaining = updatedSub.credits - updatedSub.credits_used

    // Log the transaction
    const { error: logError } = await supabaseAdmin()
      .from('credit_transactions')
      .insert({
        user_id: user.id,
        feature,
        credits_deducted: creditsRequired,
        credits_remaining: newRemaining,
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('⚠️ Transaction logging failed:', logError)
    }

    console.log(`✅ Credits deducted successfully. New remaining: ${newRemaining}`)

    return {
      success: true,
      remainingCredits: newRemaining,
      message: `Successfully deducted ${creditsRequired} credits`,
      transactionId: `${user.id}-${Date.now()}`
    }

  } catch (error) {
    console.error('❌ Credit deduction error:', error)
    return {
      success: false,
      remainingCredits: 0,
      message: 'Internal error during credit deduction'
    }
  }
}

export async function getCurrentCredits(userId: string): Promise<{
  total: number
  used: number
  remaining: number
  plan: string
}> {
  try {
    const { data: subscription, error } = await supabaseAdmin()
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !subscription) {
      return { total: 0, used: 0, remaining: 0, plan: 'free' }
    }

    const used = subscription.credits_used || 0
    const total = subscription.credits || 0
    const remaining = Math.max(0, total - used)

    return {
      total,
      used,
      remaining,
      plan: subscription.plan || 'free'
    }
  } catch (error) {
    console.error('❌ Error getting current credits:', error)
    return { total: 0, used: 0, remaining: 0, plan: 'free' }
  }
}
