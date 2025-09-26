"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Check, 
  Zap, 
  Crown, 
  Rocket, 
  CreditCard, 
  ArrowLeft,
  Loader2,
  Star
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  price: number
  credits: number
  creditCost: number
  features: string[]
  popular?: boolean
  stripePriceId: string
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    credits: 10,
    creditCost: 0.99,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || 'price_basic_monthly',
    features: [
      '10 credits per month',
      'AI Resume Generation',
      'Cover Letter Generation',
      'Job Tailoring',
      'Basic Templates',
      'PDF Export',
      'Email Support'
    ]
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 19.99,
    credits: 50,
    creditCost: 0.40,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID || 'price_standard_monthly',
    popular: true,
    features: [
      '50 credits per month',
      'All Basic features',
      'Salary Negotiation',
      'LinkedIn Optimization',
      'Premium Templates',
      'PDF & DOCX Export',
      'Priority Support',
      'Resume Analytics'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49.99,
    credits: 200,
    creditCost: 0.25,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
    features: [
      '200 credits per month',
      'All Standard features',
      'Personal Brand Strategy',
      'Mock Interview Practice',
      'Advanced Analytics',
      'Executive Templates',
      'Personal Branding Consultation',
      'Career Strategy Planning',
      'White-label Resumes',
      'Dedicated Support'
    ]
  }
]

export default function BillingPage() {
  const { user, isLoaded } = useUser()
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isLoaded && user) {
      fetchCurrentSubscription()
    } else if (isLoaded && !user) {
      setIsLoading(false)
    }
  }, [isLoaded, user])

  const fetchCurrentSubscription = async () => {
    try {
      const response = await fetch('/api/user/credits')
      if (response.ok) {
        const data = await response.json()
        setCurrentSubscription(data)
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async (planId: string) => {
    if (!user) return

    setUpgradeLoading(planId)
    
    try {
      const plan = PLANS.find(p => p.id === planId)
      if (!plan) return

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          successUrl: `${window.location.origin}/dashboard?upgrade=success`,
          cancelUrl: `${window.location.origin}/billing?upgrade=cancelled`,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setUpgradeLoading(null)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to view billing information.</p>
          <Link
            href="/sign-in"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const currentPlan = currentSubscription?.plan?.id || 'basic'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Plans</h1>
            <p className="text-gray-600">Choose the perfect plan for your career goals</p>
          </div>
        </div>

        {/* Current Subscription Info */}
        {currentSubscription && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Subscription</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">Plan</div>
                <div className="text-lg font-bold text-blue-900">
                  {currentSubscription.plan?.name || 'Basic'}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">Credits Remaining</div>
                <div className="text-lg font-bold text-green-900">
                  {currentSubscription.subscription?.remainingCredits || 0}
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">Monthly Credits</div>
                <div className="text-lg font-bold text-purple-900">
                  {currentSubscription.plan?.credits || 0}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              className={`relative bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border p-8 ${
                plan.popular 
                  ? 'border-blue-500 ring-2 ring-blue-500/20' 
                  : 'border-white/20'
              } ${
                currentPlan === plan.id 
                  ? 'ring-2 ring-green-500/50 border-green-500' 
                  : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              {currentPlan === plan.id && (
                <div className="absolute -top-4 right-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </div>
                </div>
              )}

              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  {plan.id === 'basic' && <Zap className="h-8 w-8 text-blue-500" />}
                  {plan.id === 'standard' && <Rocket className="h-8 w-8 text-purple-500" />}
                  {plan.id === 'pro' && <Crown className="h-8 w-8 text-yellow-500" />}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  ${plan.price}
                  <span className="text-lg text-gray-600 font-normal">/month</span>
                </div>
                <div className="text-sm text-gray-600">
                  ${plan.creditCost.toFixed(2)} per credit
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleUpgrade(plan.id)}
                disabled={upgradeLoading === plan.id}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {upgradeLoading === plan.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Upgrade to {plan.name}
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Credit Usage Info */}
        <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How Credits Work</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Credit Costs</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>AI Resume Generation</span>
                  <span className="font-medium">5 credits</span>
                </div>
                <div className="flex justify-between">
                  <span>Cover Letter Generation</span>
                  <span className="font-medium">3 credits</span>
                </div>
                <div className="flex justify-between">
                  <span>Job Tailoring</span>
                  <span className="font-medium">3 credits</span>
                </div>
                <div className="flex justify-between">
                  <span>AI Suggestions</span>
                  <span className="font-medium">1 credit</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Benefits</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Credits never expire
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Unused credits roll over
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Cancel anytime
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  Secure payments via Stripe
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
