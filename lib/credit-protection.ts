"use client"

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { UNIFIED_CREDIT_COST } from './unified-credit-system'

export interface CreditCheck {
  hasCredits: boolean
  remainingCredits: number
  requiredCredits: number
  plan: string | null
  status: string
  canAccess: boolean
  message: string
}

export interface FeatureAccess {
  isLoading: boolean
  canAccess: boolean
  creditCheck: CreditCheck | null
  error: string | null
  checkCredits: () => Promise<void>
}

/**
 * Hook to check if user has enough credits for a specific feature
 * Updated to use unified credit system (1 credit per feature)
 */
export function useFeatureAccess(feature: string): FeatureAccess {
  const { user, isLoaded } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [creditCheck, setCreditCheck] = useState<CreditCheck | null>(null)
  const [error, setError] = useState<string | null>(null)

  const requiredCredits = UNIFIED_CREDIT_COST // Always 1 credit per feature

  const checkCredits = async () => {
    if (!isLoaded || !user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/credits')
      
      if (!response.ok) {
        throw new Error('Failed to fetch credits')
      }

      const data = await response.json()
      const { credits } = data

      const hasCredits = credits >= requiredCredits
      
      // CRITICAL: Enhanced access logic - be more restrictive
      let canAccess = false
      
      if (hasCredits) {
        canAccess = true
      }

      console.log('Credit check result:', {
        credits,
        requiredCredits,
        hasCredits,
        canAccess
      })

      const check: CreditCheck = {
        hasCredits,
        remainingCredits: credits,
        requiredCredits,
        plan: null,
        status: null,
        canAccess,
        message: getAccessMessage(credits, requiredCredits, hasCredits)
      }

      setCreditCheck(check)
    } catch (err) {
      console.error('Error checking credits:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkCredits()
    
    // Listen for credits updates with more aggressive refresh
    const handleCreditsUpdate = () => {
      console.log('💳 FeatureGuard: Credits updated, refreshing...')
      checkCredits()
    }
    
    // Listen to multiple events
    window.addEventListener('credits-updated', handleCreditsUpdate)
    
    // Also refresh periodically if we don't have access
    const interval = setInterval(() => {
      if (!(creditCheck?.canAccess) && !isLoading) {
        console.log('🔄 FeatureGuard: Periodic refresh check...')
        checkCredits()
      }
    }, 10000) // Check every 10 seconds if blocked
    
    return () => {
      window.removeEventListener('credits-updated', handleCreditsUpdate)
      clearInterval(interval)
    }
  }, [isLoaded, user, creditCheck?.canAccess, isLoading])

  return {
    isLoading,
    canAccess: creditCheck?.canAccess || false,
    creditCheck,
    error,
    checkCredits
  }
}

function getAccessMessage(credits: number, requiredCredits: number, hasCredits: boolean): string {
  if (!hasCredits) {
    return `This feature requires ${requiredCredits} credits. You have ${credits} credits remaining. Please upgrade your plan or wait for your next billing cycle.`
  }
  
  return `You have ${credits} credits remaining. This feature will use ${requiredCredits} credits.`
}
