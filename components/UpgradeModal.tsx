'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Check, Star, CreditCard, Loader2 } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-manager'
import { useUser } from '@clerk/nextjs'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  currentPlan?: string
  currentCredits?: number
  requiredCredits?: number
  action?: string
  onUpgradeSuccess?: () => void
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlan = 'free',
  currentCredits = 0,
  requiredCredits = 0,
  action = '',
  onUpgradeSuccess
}: UpgradeModalProps) {
  const { user } = useUser()
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  // Auto-select the best plan based on required credits
  useEffect(() => {
    if (requiredCredits > 0 && !selectedPlan) {
      const suitablePlan = SUBSCRIPTION_PLANS.find(plan => 
        plan.credits >= requiredCredits && plan.id !== currentPlan
      )
      if (suitablePlan) {
        setSelectedPlan(suitablePlan.id)
      } else {
        setSelectedPlan('standard') // Default fallback
      }
    }
  }, [requiredCredits, currentPlan, selectedPlan])

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      setError('Please sign in to upgrade your plan')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          userId: user.id,
          userEmail: user.emailAddresses[0]?.emailAddress,
          successUrl: `${window.location.origin}/dashboard?upgrade=success`,
          cancelUrl: `${window.location.origin}/dashboard?upgrade=cancelled`
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (error: any) {
      console.error('Upgrade error:', error)
      setError(error.message || 'Failed to start upgrade process')
    } finally {
      setIsLoading(false)
    }
  }

  const getActionMessage = () => {
    if (!action || !requiredCredits) return null

    const actionNames: Record<string, string> = {
      resume_generation: 'generate a resume',
      cover_letter: 'create a cover letter',
      job_tailoring: 'tailor your resume',
      salary_negotiation: 'get salary negotiation tips',
      linkedin_optimization: 'optimize your LinkedIn profile',
      personal_brand_strategy: 'develop your personal brand',
      mock_interview: 'practice mock interviews',
      ai_suggestions: 'get AI suggestions'
    }

    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-red-800">
          <Zap className="h-5 w-5" />
          <span className="font-medium">Insufficient Credits</span>
        </div>
        <p className="text-red-700 mt-1">
          You need {requiredCredits} credits to {actionNames[action] || action}, 
          but you only have {currentCredits} credits remaining.
        </p>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Upgrade Your Plan
                </h2>
                <p className="text-gray-600 mt-1">
                  Choose a plan that fits your career goals
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {getActionMessage()}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              {/* Plans Grid */}
              <div className="grid md:grid-cols-3 gap-6">
                {SUBSCRIPTION_PLANS.map((plan) => {
                  const isCurrentPlan = plan.id === currentPlan
                  const isSelected = plan.id === selectedPlan
                  const isRecommended = plan.popular

                  return (
                    <motion.div
                      key={plan.id}
                      className={`relative rounded-xl border-2 p-6 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : isCurrentPlan
                          ? 'border-gray-300 bg-gray-50 opacity-60'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => !isCurrentPlan && setSelectedPlan(plan.id)}
                      whileHover={!isCurrentPlan ? { scale: 1.02 } : {}}
                      whileTap={!isCurrentPlan ? { scale: 0.98 } : {}}
                    >
                      {isRecommended && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Most Popular
                          </div>
                        </div>
                      )}

                      {isCurrentPlan && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Current Plan
                          </div>
                        </div>
                      )}

                      <div className="text-center">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {plan.name}
                        </h3>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-gray-900">
                            ${plan.price}
                          </span>
                          <span className="text-gray-600">/month</span>
                        </div>
                        <div className="mb-4">
                          <div className="text-2xl font-bold text-blue-600 mb-1">
                            {plan.credits} Credits
                          </div>
                          <div className="text-sm text-gray-600">
                            ${plan.creditCost} per credit
                          </div>
                        </div>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {!isCurrentPlan && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUpgrade(plan.id)
                          }}
                          disabled={isLoading}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                            isSelected
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CreditCard className="h-4 w-4" />
                              Upgrade to {plan.name}
                            </>
                          )}
                        </button>
                      )}
                    </motion.div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="mt-8 text-center text-sm text-gray-600">
                <p>
                  All plans include a 30-day money-back guarantee. 
                  You can cancel or change your plan anytime.
                </p>
                <p className="mt-2">
                  Need help choosing? <a href="mailto:support@startresume.io" className="text-blue-600 hover:underline">Contact our support team</a>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
