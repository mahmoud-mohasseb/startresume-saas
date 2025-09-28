'use client';

import { useUser } from '@clerk/nextjs';
import { useState } from 'react';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-manager';
import { CreditCard, Crown, Zap, Star, ArrowRight, Check, X, Loader2 } from 'lucide-react';

// Use SUBSCRIPTION_PLANS as PLANS for consistency
const PLANS = SUBSCRIPTION_PLANS;

export default function BillingPage() {
  const { user } = useUser();
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: string) => {
    try {
      setUpgradeLoading(planId)
      console.log('Starting checkout for plan:', planId)
      
      const plan = PLANS.find(p => p.id === planId)
      if (!plan) {
        throw new Error('Plan not found')
      }

      console.log('Plan details:', plan)
      console.log('Stripe Price ID:', plan.stripePriceId)

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          successUrl: `${window.location.origin}/dashboard?success=true&plan=${planId}`,
          cancelUrl: `${window.location.origin}/billing?canceled=true`
        })
      })

      console.log('API Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.text()
        console.error('API Error:', errorData)
        throw new Error(`HTTP ${response.status}: ${errorData}`)
      }

      const data = await response.json()
      console.log('Checkout session data:', data)
      
      if (!data.url) {
        throw new Error('No checkout URL received')
      }

      console.log('Redirecting to:', data.url)
      window.location.href = data.url
      
    } catch (error) {
      console.error('Checkout Error Details:', error)
      
      // Show more specific error messages
      let errorMessage = 'Failed to start checkout. '
      
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage += 'Please sign in and try again.'
        } else if (error.message.includes('400')) {
          errorMessage += 'Invalid plan selected.'
        } else if (error.message.includes('500')) {
          errorMessage += 'Server error. Please check your Stripe configuration.'
        } else {
          errorMessage += error.message
        }
      }
      
      alert(errorMessage)
    } finally {
      setUpgradeLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Upgrade to unlock powerful AI features for your career
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 transition-all duration-300 hover:shadow-2xl ${
                plan.popular 
                  ? 'border-blue-500 scale-105' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
                    ${plan.price}
                    <span className="text-lg text-gray-500 dark:text-gray-400">/month</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {plan.credits} credits per month
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={upgradeLoading === plan.id}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600'
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {upgradeLoading === plan.id ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Get Started
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </div>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
