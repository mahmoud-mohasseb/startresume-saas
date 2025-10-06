import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { feature, creditsRequired = 1, description } = await request.json()

    console.log(`🎯 Attempting to consume ${creditsRequired} credits for ${feature} by user ${user.id}`)

    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      console.error('No active subscription found:', subError)
      return NextResponse.json({
        success: false,
        error: 'No active subscription found',
        remainingCredits: 0
      }, { status: 403 })
    }

    console.log('📋 Found subscription:', {
      plan: subscription.plan,
      credits: subscription.credits,
      status: subscription.status
    })

    // Get credit usage from credit_history table
    const { data: creditHistory, error: historyError } = await supabase
      .from('credit_history')
      .select('credits_used')
      .eq('user_id', user.id)

    let totalUsed = 0
    if (!historyError && creditHistory) {
      totalUsed = creditHistory.reduce((sum: number, record: any) => sum + record.credits_used, 0)
    }

    const remainingCredits = subscription.credits - totalUsed
    
    console.log('💳 Credit calculation:', {
      totalCredits: subscription.credits,
      totalUsed: totalUsed,
      remainingCredits: remainingCredits,
      creditsRequired: creditsRequired
    })

    // Check if user has enough credits
    if (remainingCredits < creditsRequired) {
      console.error('❌ Insufficient credits:', { required: creditsRequired, available: remainingCredits })
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        remainingCredits: remainingCredits,
        required: creditsRequired
      }, { status: 403 })
    }

    // Log credit usage
    const { error: logError } = await supabase
      .from('credit_history')
      .insert({
        user_id: user.id,
        action: feature,
        credits_used: creditsRequired,
        remaining_credits: remainingCredits - creditsRequired,
        description: description || `Used ${creditsRequired} credits for ${feature}`,
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('❌ Error logging credit usage:', logError)
      
      // If credit_history table doesn't exist, try to create it
      if (logError.message?.includes('relation "credit_history" does not exist')) {
        console.log('🔧 Credit history table does not exist, using fallback method')
        
        // Fallback: Update subscription credits directly (not ideal but works)
        const newCredits = subscription.credits - creditsRequired
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({ 
            credits: newCredits,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('❌ Error updating subscription credits:', updateError)
          return NextResponse.json({
            success: false,
            error: 'Failed to deduct credits',
            details: updateError
          }, { status: 500 })
        }

        console.log('✅ Credits deducted using fallback method')
        return NextResponse.json({
          success: true,
          remainingCredits: newCredits,
          method: 'fallback_direct_update',
          message: 'Credits deducted successfully'
        })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to log credit usage',
        details: logError
      }, { status: 500 })
    }

    const newRemainingCredits = remainingCredits - creditsRequired
    console.log(`✅ Credits consumed successfully: ${remainingCredits} → ${newRemainingCredits}`)

    return NextResponse.json({
      success: true,
      remainingCredits: newRemainingCredits,
      creditsUsed: creditsRequired,
      feature: feature,
      method: 'credit_history',
      message: 'Credits consumed successfully'
    })

  } catch (error) {
    console.error('❌ Error consuming credits:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to consume credits',
      details: error
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check current credit status
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (subError || !subscription) {
      return NextResponse.json({
        hasCredits: false,
        totalCredits: 0,
        usedCredits: 0,
        remainingCredits: 0,
        plan: 'free'
      })
    }

    // Get usage from credit_history
    const { data: creditHistory, error: historyError } = await supabase
      .from('credit_history')
      .select('credits_used')
      .eq('user_id', user.id)

    let totalUsed = 0
    if (!historyError && creditHistory) {
      totalUsed = creditHistory.reduce((sum: number, record: any) => sum + record.credits_used, 0)
    }

    const remainingCredits = subscription.credits - totalUsed

    return NextResponse.json({
      hasCredits: remainingCredits > 0,
      totalCredits: subscription.credits,
      usedCredits: totalUsed,
      remainingCredits: remainingCredits,
      plan: subscription.plan,
      status: subscription.status
    })

  } catch (error) {
    console.error('Error checking credits:', error)
    return NextResponse.json({
      hasCredits: false,
      error: 'Failed to check credits'
    }, { status: 500 })
  }
}
