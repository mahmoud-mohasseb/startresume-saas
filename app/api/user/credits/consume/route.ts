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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { feature, amount = 1 } = await request.json()

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
    }

    console.log(`💳 Consuming ${amount} credits for ${feature} by user ${user.id}`)

    // DIRECT BYPASS: Use credit bypass system directly for consistency
    console.log('🔧 Using direct credit bypass system for credit consumption')
    
    const { checkAndConsumeStripeDirectCredits } = await import('@/lib/credit-bypass')
    const creditResult = await checkAndConsumeStripeDirectCredits(user.id, amount, feature)
    
    if (creditResult.success) {
      console.log('✅ Direct credit consumption successful:', creditResult)
      return NextResponse.json({
        success: true,
        message: creditResult.message,
        subscription: {
          planName: creditResult.planName,
          plan: creditResult.plan,
          isActive: true,
          totalCredits: 50,
          usedCredits: 50 - creditResult.remainingCredits,
          remainingCredits: creditResult.remainingCredits
        }
      })
    } else {
      console.log('❌ Direct credit consumption failed:', creditResult)
      return NextResponse.json({
        success: false,
        error: creditResult.message,
        currentCredits: creditResult.currentCredits,
        requiredCredits: creditResult.requiredCredits
      }, { status: 402 })
    }

    // Get current subscription from database
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
        currentCredits: 0,
        requiredCredits: amount
      }, { status: 402 })
    }

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
      creditsRequired: amount
    })

    if (remainingCredits < amount) {
      return NextResponse.json({
        success: false,
        error: 'Insufficient credits',
        currentCredits: remainingCredits,
        requiredCredits: amount
      }, { status: 402 })
    }

    // Log credit usage in credit_history table
    const { error: logError } = await supabase
      .from('credit_history')
      .insert({
        user_id: user.id,
        action: feature,
        credits_used: amount,
        remaining_credits: remainingCredits - amount,
        description: `Consumed ${amount} credits for ${feature}`,
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('❌ Error logging credit usage:', logError)
      
      // If credit_history table doesn't exist, use fallback method
      if (logError.message?.includes('relation "credit_history" does not exist')) {
        console.log('🔧 Credit history table does not exist, using fallback method')
        
        // Fallback: Update subscription credits directly
        const newCredits = subscription.credits - amount
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
            error: 'Failed to consume credits',
            details: updateError
          }, { status: 500 })
        }

        console.log(`✅ Credits consumed using fallback: ${subscription.credits} → ${newCredits}`)
        
        return NextResponse.json({
          success: true,
          message: `Consumed ${amount} credits for ${feature}`,
          subscription: {
            planName: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1),
            plan: subscription.plan,
            isActive: subscription.status === 'active',
            totalCredits: subscription.credits, // Original total
            usedCredits: amount,
            remainingCredits: newCredits
          }
        })
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to log credit usage',
        details: logError
      }, { status: 500 })
    }

    const newRemainingCredits = remainingCredits - amount
    console.log(`✅ Credits consumed successfully: ${remainingCredits} → ${newRemainingCredits}`)

    // Return subscription format that matches SubscriptionContext expectations
    return NextResponse.json({
      success: true,
      message: `Consumed ${amount} credits for ${feature}`,
      subscription: {
        planName: subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1),
        plan: subscription.plan,
        isActive: subscription.status === 'active',
        totalCredits: subscription.credits,
        usedCredits: totalUsed + amount,
        remainingCredits: newRemainingCredits
      }
    })

  } catch (error) {
    console.error('❌ Error consuming credits:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
