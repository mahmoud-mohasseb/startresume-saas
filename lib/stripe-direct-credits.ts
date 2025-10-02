import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs/server'

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
      console.log('❌ No Stripe customer found')
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
    
    // For now, return plan data with no usage tracking
    return {
      credits: plan.credits,
      usedCredits: 0,
      remainingCredits: plan.credits,
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
    
    // For now, just return success without actually consuming credits
    // In a full implementation, you'd track usage in a database
    return {
      success: true,
      remainingCredits: creditData.remainingCredits - requiredCredits,
      currentCredits: creditData.remainingCredits,
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
