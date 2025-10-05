import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs/server'
import { getSubscription, deductCredits, createSubscription } from './supabase-subscriptions'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

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

export async function getStripeDirectCredits(clerkUserId: string): Promise<StripeDirectCreditData> {
  try {
    console.log('🔍 Getting Stripe-direct credits with usage tracking for user:', clerkUserId)
    
    // Search for customer by Clerk user ID in metadata
    const customers = await stripe.customers.search({
      query: `metadata['clerk_user_id']:'${clerkUserId}'`
    })
    
    console.log(`Found ${customers.data.length} customers for user ${clerkUserId}`)
    
    if (customers.data.length === 0) {
      console.log('❌ No Stripe customer found for user:', clerkUserId)
      console.log('🔧 This usually means:')
      console.log('   1. User has not completed a payment yet')
      console.log('   2. Customer was created without clerk_user_id metadata')
      console.log('   3. Webhook events are not being processed')
      
      // Try to find customer by email as fallback
      try {
        const user = await currentUser()
        if (user?.emailAddresses[0]?.emailAddress) {
          const customersByEmail = await stripe.customers.list({
            email: user.emailAddresses[0].emailAddress,
            limit: 1
          })
          
          if (customersByEmail.data.length > 0) {
            console.log('🔍 Found customer by email, updating with metadata')
            const customer = await stripe.customers.update(customersByEmail.data[0].id, {
              metadata: {
                ...customersByEmail.data[0].metadata,
                clerk_user_id: clerkUserId
              }
            })
            
            // Retry the original function with updated customer
            return await getStripeDirectCredits(clerkUserId)
          }
        }
      } catch (emailFallbackError) {
        console.error('Email fallback failed:', emailFallbackError)
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
    
    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10
    })
    
    console.log(`Found ${subscriptions.data.length} active subscriptions`)
    
    if (subscriptions.data.length === 0) {
      console.log('❌ No active subscriptions found')
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
    
    // Plan configurations matching Stripe price IDs
    const STRIPE_PLANS: Record<string, any> = {
      [process.env.STRIPE_BASIC_PRICE_ID!]: { // Basic
        id: 'basic',
        name: 'Basic',
        credits: 10,
        price: 9.99
      },
      [process.env.STRIPE_STANDARD_PRICE_ID!]: { // Standard
        id: 'standard', 
        name: 'Standard',
        credits: 50,
        price: 19.99
      },
      [process.env.STRIPE_PRO_PRICE_ID!]: { // Pro
        id: 'pro',
        name: 'Pro', 
        credits: 200,
        price: 49.99
      },
      // Fallback for hardcoded IDs (in case env vars aren't set)
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
    
    const plan = STRIPE_PLANS[priceId as string]
    
    console.log('🔍 Price ID lookup:', priceId, 'Found plan:', plan)
    console.log('🔍 Available price IDs:', Object.keys(STRIPE_PLANS))
    
    if (!plan) {
      console.log('❌ Unknown price ID:', priceId)
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
    
    // Get subscription from database to track actual usage
    let dbSubscription = await getSubscription(clerkUserId)
    
    // If no database subscription exists, create one
    if (!dbSubscription) {
      console.log('📝 Creating database subscription for user:', clerkUserId)
      dbSubscription = await createSubscription(
        clerkUserId,
        plan.id as 'basic' | 'standard' | 'pro',
        subscription.id,
        customer.id
      )
    }
    
    // Use database subscription data for accurate credit tracking
    const totalCredits = plan.credits
    const usedCredits = dbSubscription?.credits_used || 0
    const remainingCredits = totalCredits - usedCredits
    
    return {
      credits: totalCredits,
      usedCredits: usedCredits,
      remainingCredits: remainingCredits,
      plan: plan.id,
      planName: plan.name,
      status: subscription.status,
      isActive: subscription.status === 'active',
      customerId: customer.id,
      subscriptionId: subscription.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
      pricePerMonth: plan.price
    }
    
  } catch (error) {
    console.error('❌ Error getting Stripe-direct credits:', error)
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

export async function checkAndConsumeStripeDirectCredits(
  clerkUserId: string,
  requiredCredits: number = 1,
  action?: string
): Promise<{ 
  success: boolean; 
  remainingCredits: number; 
  currentCredits: number;
  requiredCredits: number;
  plan: string;
  planName: string;
  message?: string 
}> {
  try {
    const creditData = await getStripeDirectCredits(clerkUserId)
    
    if (!creditData.isActive) {
      return {
        success: false,
        remainingCredits: 0,
        currentCredits: 0,
        requiredCredits,
        plan: creditData.plan,
        planName: creditData.planName,
        message: 'No active subscription found'
      }
    }
    
    if (creditData.remainingCredits < requiredCredits) {
      return {
        success: false,
        remainingCredits: creditData.remainingCredits,
        currentCredits: creditData.remainingCredits,
        requiredCredits,
        plan: creditData.plan,
        planName: creditData.planName,
        message: `Insufficient credits. Required: ${requiredCredits}, Available: ${creditData.remainingCredits}`
      }
    }
    
    // Actually consume credits using database
    const deductResult = await deductCredits(
      clerkUserId,
      action || 'feature_usage',
      requiredCredits,
      `Consumed ${requiredCredits} credits for ${action || 'feature usage'}`
    )
    
    if (!deductResult.success) {
      return {
        success: false,
        remainingCredits: deductResult.remainingCredits,
        currentCredits: deductResult.remainingCredits,
        requiredCredits,
        plan: creditData.plan,
        planName: creditData.planName,
        message: 'Failed to consume credits'
      }
    }
    
    return {
      success: true,
      remainingCredits: deductResult.remainingCredits,
      currentCredits: deductResult.remainingCredits,
      requiredCredits,
      plan: creditData.plan,
      planName: creditData.planName
    }
    
  } catch (error) {
    console.error('Error checking/consuming credits:', error)
    return {
      success: false,
      remainingCredits: 0,
      currentCredits: 0,
      requiredCredits,
      plan: 'free',
      planName: 'Free',
      message: 'Error checking credit balance'
    }
  }
}

export async function findOrCreateStripeCustomer(clerkUserId: string, userEmail?: string): Promise<string> {
  try {
    // Search for existing customer
    const customers = await stripe.customers.search({
      query: `metadata['clerk_user_id']:'${clerkUserId}'`
    })
    
    if (customers.data.length > 0) {
      return customers.data[0].id
    }
    
    // Create new customer
    const customer = await stripe.customers.create({
      email: userEmail,
      metadata: {
        clerk_user_id: clerkUserId
      }
    })
    
    return customer.id
  } catch (error) {
    console.error('Error finding/creating Stripe customer:', error)
    throw error
  }
}
