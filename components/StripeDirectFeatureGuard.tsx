"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Zap, CreditCard, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface StripeDirectFeatureGuardProps {
  children: React.ReactNode
  featureName: string
  requiredCredits?: number
  description?: string
  className?: string
}

interface CreditStatus {
  hasCredits: boolean
  currentCredits: number
  plan: string
  planName: string
  isActive: boolean
  customerId?: string
}

export default function StripeDirectFeatureGuard({
  children,
  featureName,
  requiredCredits = 1,
  description,
  className = ""
}: StripeDirectFeatureGuardProps) {
  const { user, isLoaded } = useUser()
  const [creditStatus, setCreditStatus] = useState<CreditStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (isLoaded && user) {
      checkCredits()
    } else if (isLoaded && !user) {
      setIsLoading(false)
    }
  }, [isLoaded, user])

  const checkCredits = async () => {
    try {
      setIsLoading(true)
      console.log(`🔒 StripeDirectFeatureGuard: Checking credits for ${featureName}`)
      
      const response = await fetch('/api/user/credits')
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }
      
      const data = await response.json()
      console.log(`🔒 StripeDirectFeatureGuard: Credit data for ${featureName}:`, data)
      
      const hasCredits = data.subscription.isActive && data.subscription.remainingCredits >= requiredCredits
      
      setCreditStatus({
        hasCredits,
        currentCredits: data.subscription.remainingCredits,
        plan: data.subscription.plan,
        planName: data.subscription.planName,
        isActive: data.subscription.isActive,
        customerId: data.subscription.customerId
      })
      
      console.log(`🔒 StripeDirectFeatureGuard: ${featureName} access:`, hasCredits ? 'GRANTED' : 'DENIED')
      
    } catch (error) {
      console.error(`🔒 StripeDirectFeatureGuard: Error checking credits for ${featureName}:`, error)
      
      // Default to no access on error
      setCreditStatus({
        hasCredits: false,
        currentCredits: 0,
        plan: 'free',
        planName: 'Free',
        isActive: false
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true)
  }

  const redirectToBilling = () => {
    window.location.href = '/billing'
  }

  // Show loading state
  if (isLoading || !isLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center z-10">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading feature access...</span>
          </div>
        </div>
        <div className="opacity-30 pointer-events-none">
          {children}
        </div>
      </div>
    )
  }

  // Show login required if no user
  if (!user) {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center z-10 border-2 border-dashed border-blue-300 dark:border-gray-600">
          <div className="text-center p-6">
            <Lock className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Sign In Required
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Please sign in to access {featureName}
            </p>
            <button
              onClick={() => window.location.href = '/sign-in'}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
        <div className="opacity-20 pointer-events-none">
          {children}
        </div>
      </div>
    )
  }

  // Grant access if user has credits
  if (creditStatus?.hasCredits) {
    return <div className={className}>{children}</div>
  }

  // Show upgrade prompt if no credits or inactive plan
  const isFreePlan = creditStatus?.plan === 'free' || !creditStatus?.isActive
  
  return (
    <>
      <div className={`relative ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center z-10 border-2 border-dashed border-orange-300 dark:border-gray-600">
          <div className="text-center p-6 max-w-md">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {isFreePlan ? 'Subscription Required' : 'Not Enough Credits'}
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {isFreePlan 
                ? `Subscribe to access ${featureName} and unlock AI-powered career tools.`
                : `You need ${requiredCredits} credits but only have ${creditStatus?.currentCredits || 0}.`
              }
            </p>

            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 italic">
                {description}
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={handleUpgradeClick}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isFreePlan ? 'Choose Plan' : 'Upgrade Plan'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>

            {/* Current Plan Info */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Current Plan:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {creditStatus?.planName || 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-gray-500">Credits Available:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {creditStatus?.currentCredits || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="opacity-20 pointer-events-none">
          {children}
        </div>
      </div>

      {/* Upgrade Modal */}
      <AnimatePresence>
        {showUpgradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUpgradeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full">
                    <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Unlock {featureName}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {isFreePlan 
                    ? 'Choose a subscription plan to access AI-powered career tools and unlock your potential.'
                    : 'Upgrade your plan to get more credits and access premium features.'
                  }
                </p>

                {/* Feature Benefits */}
                <div className="text-left mb-6 space-y-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    What you'll get:
                  </h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>AI-powered resume generation</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Job-specific tailoring</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Cover letter creation</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Career coaching tools</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowUpgradeModal(false)}
                    className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Maybe Later
                  </button>
                  <button
                    onClick={redirectToBilling}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium"
                  >
                    {isFreePlan ? 'View Plans' : 'Upgrade Now'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
