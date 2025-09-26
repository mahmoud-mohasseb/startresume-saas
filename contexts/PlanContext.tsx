'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'

interface PlanStatus {
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

interface PlanContextType {
  planStatus: PlanStatus | null
  isLoading: boolean
  refreshPlanStatus: () => Promise<void>
  hasFeatureAccess: (feature: string) => boolean
  canUseFeature: (feature: string) => boolean
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

export function PlanProvider({ children }: { children: ReactNode }) {
  const { user } = useUser()
  const [planStatus, setPlanStatus] = useState<PlanStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchPlanStatus = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch('/api/user/plan-status')
      
      if (response.ok) {
        const data = await response.json()
        setPlanStatus(data)
      } else {
        console.error('Failed to fetch plan status')
        setPlanStatus(null)
      }
    } catch (error) {
      console.error('Error fetching plan status:', error)
      setPlanStatus(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshPlanStatus = async () => {
    await fetchPlanStatus()
  }

  const hasFeatureAccess = (feature: string): boolean => {
    if (!planStatus) return false
    return planStatus.features.featureAccess[feature] === true
  }

  const canUseFeature = (feature: string): boolean => {
    if (!planStatus) return false
    
    // Check if feature is available in plan
    if (!hasFeatureAccess(feature)) return false
    
    // Check if user has remaining usage (for non-unlimited plans)
    if (!planStatus.plan.isUnlimited && planStatus.usage.remaining <= 0) {
      return false
    }
    
    return true
  }

  // Initial fetch when user changes
  useEffect(() => {
    fetchPlanStatus()
  }, [user])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return

    const interval = setInterval(() => {
      fetchPlanStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [user])

  const value: PlanContextType = {
    planStatus,
    isLoading,
    refreshPlanStatus,
    hasFeatureAccess,
    canUseFeature
  }

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  )
}

export function usePlan(): PlanContextType {
  const context = useContext(PlanContext)
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider')
  }
  return context
}
