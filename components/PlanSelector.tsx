"use client"

import React, { useState } from 'react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { Check, Zap, Crown, Star } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Plan {
  id: string
  name: string
  price: number
  credits: number
  icon: React.ReactNode
  features: string[]
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 3,
    icon: <Star className="w-6 h-6" />,
    features: [
      '3 AI credits',
      'Basic resume templates',
      'PDF export',
      'Community support'
    ]
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    credits: 10,
    icon: <Zap className="w-6 h-6" />,
    features: [
      '10 AI credits',
      'All resume templates',
      'Cover letter generation',
      'Job tailoring',
      'Email support'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 19.99,
    credits: 50,
    icon: <Crown className="w-6 h-6" />,
    popular: true,
    features: [
      '50 AI credits',
      'Mock interview sessions',
      'LinkedIn optimization',
      'Salary negotiation tips',
      'Priority support',
      'Advanced analytics'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49.99,
    credits: 200,
    icon: <Crown className="w-6 h-6 text-purple-500" />,
    features: [
      '200 AI credits',
      'Personal brand strategy',
      'Unlimited templates',
      'Custom branding',
      'White-label exports',
      'Dedicated support'
    ]
  }
]

export function PlanSelector() {
  const { subscription, applySelectedPlan, processPayment, isLoading } = useSubscription()
  const [selectedPlanId, setSelectedPlanId] = useState<string>(subscription?.plan || 'free')
  const [applying, setApplying] = useState(false)

  const handlePlanSelect = async (planId: string) => {
    if (applying) return
    
    setApplying(true)
    try {
      console.log('🎯 Selecting plan:', planId)
      
      if (planId === 'free') {
        // Free plan - apply immediately
        await applySelectedPlan(planId)
        setSelectedPlanId(planId)
        
        toast.success(`✅ Free plan activated! You now have 3 credits.`)
      } else {
        // Paid plan - show payment options
        const selectedPlan = plans.find(p => p.id === planId)
        
        // For development, simulate payment
        if (process.env.NODE_ENV === 'development') {
          console.log('🧪 DEVELOPMENT: Simulating payment for', planId)
          
          // Apply plan immediately in development
          await applySelectedPlan(planId)
          setSelectedPlanId(planId)
          
          toast.success(`✅ ${selectedPlan?.name} plan activated! You now have ${selectedPlan?.credits} credits. (Development Mode)`)
        } else {
          // Production - redirect to Stripe checkout
          await processPayment(planId)
        }
      }
      
    } catch (error) {
      console.error('❌ Error applying plan:', error)
      toast.error('Failed to apply plan. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600 dark:text-gray-400">Loading plans...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Choose Your Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select a plan that fits your needs. You can change anytime.
        </p>
        
        {/* Development Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              🧪 <strong>Development Mode:</strong> Paid plans will be activated immediately without payment processing.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer ${
              selectedPlanId === plan.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-105'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-md'
            } ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
            )}

            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                selectedPlanId === plan.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {plan.icon}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {plan.name}
              </h3>

              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {plan.price === 0 ? 'Free' : `$${plan.price}`}
                </span>
                {plan.price > 0 && (
                  <span className="text-gray-500 dark:text-gray-400">/month</span>
                )}
              </div>

              <div className="mb-6">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {plan.credits} Credits
                </span>
              </div>

              <ul className="space-y-3 mb-6 text-left">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                disabled={applying}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                  selectedPlanId === plan.id
                    ? 'bg-green-500 text-white cursor-default'
                    : applying
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : plan.id === 'free'
                    ? 'bg-gray-500 hover:bg-gray-600 text-white hover:shadow-lg'
                    : 'bg-blue-500 hover:bg-blue-600 text-white hover:shadow-lg'
                }`}
              >
                {applying ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {plan.id === 'free' ? 'Applying...' : 'Processing...'}
                  </div>
                ) : selectedPlanId === plan.id ? (
                  <div className="flex items-center justify-center">
                    <Check className="w-4 h-4 mr-2" />
                    Current Plan
                  </div>
                ) : plan.id === 'free' ? (
                  'Select Free Plan'
                ) : process.env.NODE_ENV === 'development' ? (
                  `Select ${plan.name} (Dev)`
                ) : (
                  `Subscribe for $${plan.price}/mo`
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Current Plan Status */}
      {subscription && (
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Current Plan: {subscription.planName}
                {subscription.stripeSubscription && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Paid
                  </span>
                )}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {subscription.remainingCredits} of {subscription.credits} credits remaining
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {subscription.remainingCredits}
              </div>
              <div className="text-sm text-gray-500">credits left</div>
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(subscription.remainingCredits / subscription.credits) * 100}%` 
                }}
              ></div>
            </div>
          </div>
          
          {/* Usage Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {subscription.credits}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600">
                {subscription.usedCredits}
              </div>
              <div className="text-xs text-gray-500">Used</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">
                {subscription.remainingCredits}
              </div>
              <div className="text-xs text-gray-500">Remaining</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
