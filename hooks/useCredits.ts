"use client"

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import { useUser } from '@clerk/nextjs'

interface CreditsData {
  subscription: {
    plan: string
    planName: string
    status: string
    totalCredits: number
    usedCredits: number
    remainingCredits: number
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }
  analytics: {
    totalUsed: number
    usageByAction: Record<string, number>
    usageByDay: Record<string, number>
    recentUsage: Array<{
      action: string
      credits_used: number
      timestamp: string
      metadata?: any
    }>
  }
  plan?: {
    id: string
    name: string
    credits: number
    price: number
    creditCost: number
    features: string[]
    popular?: boolean
  }
}

interface CreditsContextType {
  creditsData: CreditsData | null
  isLoading: boolean
  error: string | null
  refreshCredits: () => Promise<void>
  consumeCredits: (action: string, amount: number, metadata?: any) => Promise<boolean>
  checkCanPerform: (action: string, amount: number) => boolean
  showUpgradeModal: () => void
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined)

export function useCredits() {
  const context = useContext(CreditsContext)
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider')
  }
  return context
}

export function useCreditsData() {
  const { user, isLoaded } = useUser()
  const [creditsData, setCreditsData] = useState<CreditsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = useCallback(async () => {
    if (!user || !isLoaded) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/credits')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch credits: ${response.status}`)
      }

      const data = await response.json()
      console.log('Credits fetched:', {
        plan: data.subscription?.plan,
        totalCredits: data.subscription?.totalCredits,
        remainingCredits: data.subscription?.remainingCredits
      })
      
      setCreditsData(data)
    } catch (err) {
      console.error('Error fetching credits:', err)
      setError(err instanceof Error ? err.message : 'Failed to load credits')
    } finally {
      setIsLoading(false)
    }
  }, [user, isLoaded])

  const consumeCredits = useCallback(async (action: string, amount: number, metadata?: any): Promise<boolean> => {
    if (!user) return false

    try {
      const response = await fetch('/api/user/credits/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          credits: amount,
          metadata
        })
      })

      const result = await response.json()
      
      if (result.success) {
        // Refresh credits data after consumption
        await fetchCredits()
        return true
      } else {
        console.error('Credit consumption failed:', result.message)
        return false
      }
    } catch (error) {
      console.error('Error consuming credits:', error)
      return false
    }
  }, [user, fetchCredits])

  const checkCanPerform = useCallback((action: string, amount: number): boolean => {
    if (!creditsData?.subscription) return false
    return creditsData.subscription.remainingCredits >= amount
  }, [creditsData])

  const showUpgradeModal = useCallback(() => {
    // Trigger upgrade modal
    const event = new CustomEvent('show-upgrade-modal')
    window.dispatchEvent(event)
  }, [])

  useEffect(() => {
    if (isLoaded && user) {
      fetchCredits()
    }
  }, [isLoaded, user, fetchCredits])

  return {
    creditsData,
    isLoading,
    error,
    refreshCredits: fetchCredits,
    consumeCredits,
    checkCanPerform,
    showUpgradeModal
  }
}
