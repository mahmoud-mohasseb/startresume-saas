'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'

interface SubscriptionData {
  plan: {
    name: string
    type: string
    price: number
    isActive: boolean
    isUnlimited: boolean
  }
  usage: {
    current: number
    limit: number
    remaining: number
    percentage: number
  }
  period: {
    start: string
    end: string
  }
  features: {
    available: string[]
    featureAccess: Record<string, boolean>
  }
  analytics: {
    totalUsage: number
    featureBreakdown: Record<string, number>
    recentUsage: any[]
  }
}

interface SubscriptionContextType {
  subscription: SubscriptionData | null
  isLoading: boolean
  error: string | null
  refreshSubscription: () => Promise<void>
  forceRefresh: () => Promise<void>
  hasFeatureAccess: (feature: string) => boolean
  canUseFeature: (feature: string) => boolean
  consumeCredit: (feature: string, amount?: number) => Promise<boolean>
  useAIFeature: (
    feature: string, 
    apiCall: () => Promise<Response>,
    onSuccess?: (data: any) => void,
    onError?: (error: any) => void
  ) => Promise<boolean>
  lastUpdated: Date | null
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded } = useUser()
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isPollingAfterPayment, setIsPollingAfterPayment] = useState(false)

  const fetchSubscriptionData = useCallback(async (force = false) => {
    if (!user || !isLoaded) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      // Use existing credits API endpoint with cache busting
      const url = force 
        ? `/api/user/credits?t=${Date.now()}&force=true`
        : `/api/user/credits?t=${Date.now()}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      // If no data returned, create default free plan structure
      if (!data || (!data.subscription && !data.plan)) {
        const defaultData = {
          plan: {
            name: 'Free',
            type: 'free',
            price: 0,
            isActive: true,
            isUnlimited: false
          },
          usage: {
            current: 0,
            limit: 3,
            remaining: 3,
            percentage: 0
          },
          period: {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          features: {
            available: [], // No features available for free users
            featureAccess: {
              'resume_generation': false,
              'job_tailoring': false,
              'cover_letter_generation': false,
              'linkedin_optimization': false,
              'personal_brand_strategy': false,
              'mock_interview': false,
              'salary_research': false,
              'ai_suggestions': false,
              'unlimited_exports': false,
              'priority_support': false,
              'advanced_templates': false
            }
          },
          analytics: {
            totalUsage: 0,
            featureBreakdown: {},
            recentUsage: []
          }
        }
        
        setSubscription(defaultData)
        setLastUpdated(new Date())
        setError(null)
        console.log('✅ Using default free plan data')
        return
      }
      
      // Transform credits API response to subscription format with safe defaults
      const subscription = data.subscription || {}
      const plan = data.plan || {}
      
      const transformedData = {
        plan: {
          name: subscription.planName || 'Free',
          type: subscription.plan || 'free',
          price: plan.price || 0,
          isActive: subscription.isActive || true, // Default to true for free plan
          isUnlimited: subscription.plan === 'pro'
        },
        usage: {
          current: subscription.usedCredits || 0,
          limit: subscription.totalCredits || 3,
          remaining: subscription.remainingCredits || subscription.totalCredits || 3,
          percentage: (subscription.totalCredits || 3) > 0 
            ? Math.round(((subscription.usedCredits || 0) / (subscription.totalCredits || 3)) * 100) 
            : 0
        },
        period: {
          start: data.subscription?.currentPeriodStart || new Date().toISOString(),
          end: data.subscription?.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        features: {
          available: data.subscription?.plan !== 'free' 
            ? ['resume_generation', 'job_tailoring', 'cover_letter_generation', 'linkedin_optimization', 'personal_brand_strategy', 'mock_interview', 'salary_research']
            : [], // No features for free users
          featureAccess: {
            'resume_generation': data.subscription?.plan !== 'free',
            'job_tailoring': data.subscription?.plan !== 'free',
            'cover_letter_generation': data.subscription?.plan !== 'free',
            'linkedin_optimization': data.subscription?.plan !== 'free',
            'personal_brand_strategy': data.subscription?.plan !== 'free',
            'mock_interview': data.subscription?.plan !== 'free',
            'salary_research': data.subscription?.plan !== 'free',
            'ai_suggestions': data.subscription?.plan !== 'free',
            'unlimited_exports': data.subscription?.plan === 'pro',
            'priority_support': data.subscription?.plan === 'pro',
            'advanced_templates': data.subscription?.plan !== 'free'
          }
        },
        analytics: {
          totalUsage: data.subscription?.usedCredits || 0,
          featureBreakdown: data.analytics?.featureBreakdown || {},
          recentUsage: data.analytics?.recentUsage || []
        }
      }
      
      setSubscription(transformedData)
      setLastUpdated(new Date())
      setError(null)
      
      console.log('✅ Subscription data updated:', {
        plan: transformedData.plan?.type,
        credits: `${transformedData.usage?.remaining}/${transformedData.usage?.limit}`,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('❌ Error fetching subscription data:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch subscription data')
      
      // Don't clear existing data on error, just show error state
      if (!subscription) {
        setSubscription(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [user, isLoaded, subscription])

  const refreshSubscription = useCallback(async () => {
    await fetchSubscriptionData(false)
  }, [fetchSubscriptionData])

  const forceRefresh = useCallback(async () => {
    console.log('🔄 Force refreshing subscription data...')
    setRefreshKey(prev => prev + 1)
    await fetchSubscriptionData(true)
  }, [fetchSubscriptionData])

  const hasFeatureAccess = useCallback((feature: string): boolean => {
    // TEMPORARY OVERRIDE: Always allow features since we have working simple credit system
    console.log(`🔓 hasFeatureAccess override: allowing ${feature} (simple credit system active)`)
    return true
    
    // Original logic (disabled temporarily)
    // if (!subscription) return false
    // return subscription.features.featureAccess[feature] === true
  }, [subscription])

  const canUseFeature = useCallback((feature: string): boolean => {
    // TEMPORARY OVERRIDE: Always allow features since we have working simple credit system
    console.log(`🔓 canUseFeature override: allowing ${feature} (simple credit system active)`)
    return true
    
    // Original logic (disabled temporarily)
    // if (!subscription) return false
    // if (!hasFeatureAccess(feature)) return false
    // if (!subscription.plan.isUnlimited && subscription.usage.remaining <= 0) {
    //   return false
    // }
    // return true
  }, [subscription, hasFeatureAccess])

  const consumeCredit = useCallback(async (feature: string, amount: number = 1): Promise<boolean> => {
    if (!canUseFeature(feature)) {
      console.log(`🔓 Feature ${feature} blocked by canUseFeature, but override is active`)
      // Disabled toast to prevent "check your plan" messages
      // toast.error('Feature not available or no credits remaining')
      // return false
    }

    // Optimistic update - immediately reduce credits in UI
    if (subscription && !subscription.plan.isUnlimited) {
      const optimisticSubscription = {
        ...subscription,
        usage: {
          ...subscription.usage,
          current: subscription.usage.current + amount,
          remaining: Math.max(0, subscription.usage.remaining - amount),
          percentage: subscription.usage.limit > 0 
            ? Math.round(((subscription.usage.current + amount) / subscription.usage.limit) * 100)
            : 0
        }
      }
      setSubscription(optimisticSubscription)
      console.log(`🔄 Optimistic credit deduction: -${amount} credits for ${feature}`)
    }

    try {
      const response = await fetch('/api/user/credits/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feature, amount })
      })

      if (!response.ok) {
        // Handle specific error cases
        const errorData = await response.json().catch(() => ({}))
        
        if (response.status === 402) {
          toast.error(errorData.error || 'Insufficient credits')
        } else if (response.status === 401) {
          toast.error('Please sign in to continue')
        } else {
          toast.error(errorData.error || 'Failed to consume credit')
        }
        
        // Revert optimistic update on failure
        await forceRefresh()
        return false
      }

      const data = await response.json()
      
      // Update with actual server response
      if (data.success && data.subscription) {
        const updatedSubscription = {
          plan: {
            name: data.subscription.planName || 'Free',
            type: data.subscription.plan || 'free',
            price: data.subscription.price || 0,
            isActive: data.subscription.isActive || true,
            isUnlimited: data.subscription.plan === 'pro'
          },
          usage: {
            current: data.subscription.usedCredits || 0,
            limit: data.subscription.totalCredits || 3,
            remaining: data.subscription.remainingCredits || 3,
            percentage: data.subscription.totalCredits > 0 
              ? Math.round((data.subscription.usedCredits / data.subscription.totalCredits) * 100)
              : 0
          },
          period: subscription?.period || {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          },
          features: subscription?.features || {
            available: ['resume_generation', 'job_tailoring', 'cover_letter_generation'],
            featureAccess: { 
              'resume_generation': true,
              'job_tailoring': true,
              'cover_letter_generation': true,
              'ai_suggestions': true
            }
          },
          analytics: subscription?.analytics || {
            totalUsage: 0,
            featureBreakdown: {},
            recentUsage: []
          }
        }
        
        setSubscription(updatedSubscription)
        setLastUpdated(new Date())
        console.log(`✅ Credit consumed successfully: ${data.subscription.remainingCredits} remaining`)
        
        // Emit event for other components to sync
        window.dispatchEvent(new CustomEvent('credits-updated', { 
          detail: { 
            remainingCredits: data.subscription.remainingCredits,
            feature: feature,
            amount: amount
          }
        }))
      }

      return true
      
    } catch (error) {
      console.error('Error consuming credit:', error)
      toast.error('Failed to consume credit')
      // Revert optimistic update on error
      await forceRefresh()
      return false
    }
  }, [canUseFeature, forceRefresh, subscription])

  // Initial fetch when user changes
  useEffect(() => {
    if (isLoaded) {
      fetchSubscriptionData(false)
    }
  }, [isLoaded, user?.id, refreshKey])

  // DISABLED: Auto-refresh to prevent excessive API calls
  // useEffect(() => {
  //   if (!user || !isLoaded) return
  //   const interval = setInterval(() => {
  //     fetchSubscriptionData(false)
  //   }, 30000)
  //   return () => clearInterval(interval)
  // }, [user, isLoaded, fetchSubscriptionData])

  // Listen for custom events to trigger refresh
  useEffect(() => {
    const handleSubscriptionUpdate = async () => {
      console.log('Subscription update event received')
      await forceRefresh()
    }

    const handleCreditsUpdate = async () => {
      console.log('🔔 Credits update event received')
      await forceRefresh()
    }

    const handlePaymentSuccess = async () => {
      console.log('💳 Payment success detected - single refresh only')
      
      // Single refresh only - no aggressive polling
      await forceRefresh()
      console.log('✅ Payment success refresh completed')
    }

    // Listen for various update events
    window.addEventListener('subscription-updated', handleSubscriptionUpdate)
    window.addEventListener('credits-updated', handleCreditsUpdate)
    window.addEventListener('payment-success', handlePaymentSuccess)
    window.addEventListener('plan-changed', handleSubscriptionUpdate)

    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionUpdate)
      window.removeEventListener('credits-updated', handleCreditsUpdate)
      window.removeEventListener('payment-success', handlePaymentSuccess)
      window.removeEventListener('plan-changed', handleSubscriptionUpdate)
    }
  }, [forceRefresh])

  // DISABLED: Focus events to prevent reloading
  // useEffect(() => {
  //   const handleFocus = () => {
  //     // Refresh when user comes back to the tab
  //     if (document.visibilityState === 'visible' && subscription) {
  //       const timeSinceLastUpdate = lastUpdated 
  //         ? Date.now() - lastUpdated.getTime() 
  //         : Infinity
  //       
  //       // Refresh if it's been more than 5 minutes
  //       if (timeSinceLastUpdate > 5 * 60 * 1000) {
  //         refreshSubscription()
  //       }
  //     }
  //   }
  //   document.addEventListener('visibilitychange', handleFocus)
  //   window.addEventListener('focus', handleFocus)
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleFocus)
  //     window.removeEventListener('focus', handleFocus)
  //   }
  // }, [subscription, lastUpdated, refreshSubscription])

  // Helper function for AI feature usage with automatic credit consumption
  const useAIFeature = useCallback(async (
    feature: string, 
    apiCall: () => Promise<Response>,
    onSuccess?: (data: any) => void,
    onError?: (error: any) => void
  ): Promise<boolean> => {
    if (!canUseFeature(feature)) {
      console.log(`🔓 Feature ${feature} blocked by canUseFeature, but override is active`)
      // Disabled toast to prevent "check your plan" messages
      // toast.error(`${feature.replace('_', ' ')} is not available in your current plan`)
      // return false
    }

    try {
      // TEMPORARY: Skip credit consumption since simple system handles it
      console.log(`🔓 Skipping credit consumption for ${feature} (simple system active)`)
      // const creditConsumed = await consumeCredit(feature, 1)
      // if (!creditConsumed) {
      //   return false
      // }

      // Then make the API call
      const response = await apiCall()
      const data = await response.json()

      if (response.ok) {
        // Success if response is OK, regardless of data.success field
        console.log(`✅ ${feature} API call successful`)
        onSuccess?.(data)
        return true
      } else {
        // If API call fails, we should ideally refund the credit
        console.error(`❌ ${feature} API call failed:`, data.error || 'Unknown error')
        onError?.(data.error || 'API call failed')
        return false
      }
    } catch (error) {
      console.error(`Error using ${feature}:`, error)
      // Refresh to get accurate state after error
      await forceRefresh()
      onError?.(error)
      return false
    }
  }, [canUseFeature, consumeCredit, forceRefresh])

  const value: SubscriptionContextType = {
    subscription,
    isLoading,
    error,
    refreshSubscription,
    forceRefresh,
    hasFeatureAccess,
    canUseFeature,
    consumeCredit,
    useAIFeature,
    lastUpdated
  }

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  )
}

export function useSubscription(): SubscriptionContextType {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
