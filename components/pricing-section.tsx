'use client'

import { useState } from 'react'
import { Check, Zap, Crown, Star } from 'lucide-react'

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    credits: 10,
    creditCost: 0.99,
    features: [
      '10 credits per month',
      'AI Resume Generation',
      'Cover Letter Generation',
      'Job Tailoring',
      'Basic Templates',
      'PDF Export',
      'Email Support'
    ],
    icon: Zap,
    color: 'blue'
  },
  {
    id: 'standard',
    name: 'Standard',
    price: 19.99,
    credits: 50,
    creditCost: 0.40,
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
    ],
    icon: Crown,
    color: 'primary'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49.99,
    credits: 200,
    creditCost: 0.25,
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
    ],
    icon: Star,
    color: 'teal'
  }
]

export function PricingSection() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    setLoading(planId)
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan: planId }),
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
      setLoading(null)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Choose Your <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Plan</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select the perfect plan for your career goals. All plans include AI-powered resume creation and career tools.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon
            return (
              <div
                key={plan.id}
                className={`relative bg-card rounded-2xl shadow-xl border-2 p-8 transition-all hover:shadow-2xl hover:-translate-y-1 ${
                  plan.popular 
                    ? 'border-primary ring-4 ring-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                    plan.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                    plan.color === 'primary' ? 'bg-primary/10' : 'bg-teal-100 dark:bg-teal-900/20'
                  }`}>
                    <Icon className={`h-8 w-8 ${
                      plan.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      plan.color === 'primary' ? 'text-primary' : 'text-teal-600 dark:text-teal-400'
                    }`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    ${plan.creditCost.toFixed(2)} per credit • {plan.credits} credits/month
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-card-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                    plan.popular
                      ? 'btn-primary'
                      : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                  } ${loading === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === plan.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-current/30 border-t-current rounded-full animate-spin"></div>
                      Processing...
                    </div>
                  ) : (
                    'Get Started'
                  )}
                </button>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All plans include a 7-day free trial • Cancel anytime • Secure payments via Stripe
          </p>
          <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              No setup fees
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              Cancel anytime
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              24/7 support
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
