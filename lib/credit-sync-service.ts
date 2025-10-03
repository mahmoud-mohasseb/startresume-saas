import { getSubscription, syncCreditsWithStripe } from './supabase-subscriptions'
import { getStripeDirectCredits } from './stripe-direct-credits'

export interface SyncResult {
  success: boolean
  message: string
  beforeSync: {
    database: number
    stripe: number
  }
  afterSync: {
    database: number
    stripe: number
  }
  discrepancyFound: boolean
}

/**
 * Comprehensive credit synchronization service
 */
export class CreditSyncService {
  
  /**
   * Sync credits between Stripe and Database for a user
   */
  static async syncUserCredits(clerkUserId: string, forceSync: boolean = false): Promise<SyncResult> {
    try {
      console.log(`🔄 Starting credit sync for user: ${clerkUserId}`)
      
      // Get current state from both systems
      const [dbSubscription, stripeData] = await Promise.all([
        getSubscription(clerkUserId),
        getStripeDirectCredits(clerkUserId)
      ])

      const dbCredits = dbSubscription?.credits || 0
      const stripeCredits = stripeData.remainingCredits || 0
      
      const beforeSync = {
        database: dbCredits,
        stripe: stripeCredits
      }

      console.log(`📊 Credit comparison - DB: ${dbCredits}, Stripe: ${stripeCredits}`)

      // Check for discrepancy
      const discrepancyFound = dbCredits !== stripeCredits
      
      if (!discrepancyFound && !forceSync) {
        return {
          success: true,
          message: 'Credits already in sync',
          beforeSync,
          afterSync: beforeSync,
          discrepancyFound: false
        }
      }

      // Determine which source is authoritative
      // Stripe is generally the source of truth for subscription data
      const authoritativeCredits = stripeCredits
      
      if (discrepancyFound || forceSync) {
        console.log(`🔧 Syncing credits: ${dbCredits} → ${authoritativeCredits}`)
        
        const syncSuccess = await syncCreditsWithStripe(
          clerkUserId, 
          authoritativeCredits, 
          forceSync
        )

        if (!syncSuccess) {
          return {
            success: false,
            message: 'Failed to sync credits with database',
            beforeSync,
            afterSync: beforeSync,
            discrepancyFound
          }
        }

        return {
          success: true,
          message: `Credits synced successfully: ${dbCredits} → ${authoritativeCredits}`,
          beforeSync,
          afterSync: {
            database: authoritativeCredits,
            stripe: authoritativeCredits
          },
          discrepancyFound
        }
      }

      return {
        success: true,
        message: 'No sync needed',
        beforeSync,
        afterSync: beforeSync,
        discrepancyFound: false
      }

    } catch (error) {
      console.error('❌ Credit sync failed:', error)
      return {
        success: false,
        message: `Credit sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        beforeSync: { database: 0, stripe: 0 },
        afterSync: { database: 0, stripe: 0 },
        discrepancyFound: true
      }
    }
  }

  /**
   * Validate credit consistency across systems
   */
  static async validateCreditConsistency(clerkUserId: string): Promise<{
    isConsistent: boolean
    issues: string[]
    recommendations: string[]
  }> {
    try {
      const [dbSubscription, stripeData] = await Promise.all([
        getSubscription(clerkUserId),
        getStripeDirectCredits(clerkUserId)
      ])

      const issues: string[] = []
      const recommendations: string[] = []

      // Check if subscription exists in database
      if (!dbSubscription) {
        issues.push('No subscription found in database')
        recommendations.push('Create subscription record in database')
      }

      // Check if Stripe subscription is active
      if (!stripeData.isActive) {
        issues.push('Stripe subscription is not active')
        recommendations.push('Check Stripe subscription status')
      }

      // Check credit consistency
      const dbCredits = dbSubscription?.credits || 0
      const stripeCredits = stripeData.remainingCredits || 0

      if (dbCredits !== stripeCredits) {
        issues.push(`Credit mismatch: DB=${dbCredits}, Stripe=${stripeCredits}`)
        recommendations.push('Run credit synchronization')
      }

      // Check subscription status consistency
      if (dbSubscription && dbSubscription.status !== 'active' && stripeData.isActive) {
        issues.push('Database subscription status does not match Stripe')
        recommendations.push('Update database subscription status')
      }

      return {
        isConsistent: issues.length === 0,
        issues,
        recommendations
      }

    } catch (error) {
      return {
        isConsistent: false,
        issues: [`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        recommendations: ['Check system connectivity and try again']
      }
    }
  }

  /**
   * Emergency credit recovery - attempt to restore credits from multiple sources
   */
  static async emergencyCreditRecovery(clerkUserId: string): Promise<{
    success: boolean
    recoveredCredits: number
    source: 'stripe' | 'database' | 'none'
    message: string
  }> {
    try {
      console.log(`🚨 Emergency credit recovery for user: ${clerkUserId}`)

      // Try to get credits from Stripe first (most authoritative)
      const stripeData = await getStripeDirectCredits(clerkUserId)
      
      if (stripeData.isActive && stripeData.remainingCredits > 0) {
        await syncCreditsWithStripe(clerkUserId, stripeData.remainingCredits, true)
        
        return {
          success: true,
          recoveredCredits: stripeData.remainingCredits,
          source: 'stripe',
          message: `Recovered ${stripeData.remainingCredits} credits from Stripe`
        }
      }

      // Fallback to database
      const dbSubscription = await getSubscription(clerkUserId)
      
      if (dbSubscription && dbSubscription.credits > 0) {
        return {
          success: true,
          recoveredCredits: dbSubscription.credits,
          source: 'database',
          message: `Found ${dbSubscription.credits} credits in database`
        }
      }

      return {
        success: false,
        recoveredCredits: 0,
        source: 'none',
        message: 'No credits found in any system'
      }

    } catch (error) {
      return {
        success: false,
        recoveredCredits: 0,
        source: 'none',
        message: `Recovery failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

/**
 * Utility function for quick credit sync
 */
export async function quickCreditSync(clerkUserId: string): Promise<boolean> {
  const result = await CreditSyncService.syncUserCredits(clerkUserId)
  return result.success
}

/**
 * Utility function to check if credits need syncing
 */
export async function needsCreditSync(clerkUserId: string): Promise<boolean> {
  const validation = await CreditSyncService.validateCreditConsistency(clerkUserId)
  return !validation.isConsistent
}
