'use client'

import { Check, Zap } from 'lucide-react'

export function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: 0,
      credits: 3,
      description: 'Perfect for trying out our AI features',
      features: [
        '3 AI credits',
        'Basic resume builder',
        'Limited AI features',
        'Community support'
      ],
      buttonText: 'Get Started Free',
      popular: false
    },
    {
      name: 'Basic',
      price: 9.99,
      credits: 25,
      description: 'Great for job seekers who need regular AI assistance',
      features: [
        '25 AI credits per month',
        'All AI features (1 credit each)',
        'Unlimited resumes',
        'PDF export',
        'Email support'
      ],
      buttonText: 'Start Basic Plan',
      popular: false
    },
    {
      name: 'Pro',
      price: 19.99,
      credits: 100,
      description: 'Perfect for active job seekers and career changers',
      features: [
        '100 AI credits per month',
        'All AI features (1 credit each)',
        'Priority support',
        'Advanced templates',
        'DOCX export',
        'Job tailoring',
        'Salary coaching'
      ],
      buttonText: 'Start Pro Plan',
      popular: true
    },
    {
      name: 'Premium',
      price: 39.99,
      credits: 300,
      description: 'For professionals who want unlimited access',
      features: [
        '300 AI credits per month',
        'All AI features (1 credit each)',
        'Custom branding',
        'Team collaboration',
        '24/7 priority support',
        'Advanced analytics',
        'Personal brand strategy'
      ],
      buttonText: 'Start Premium Plan',
      popular: false
    }
  ]

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            All AI features cost just 1 credit each. Choose the plan that fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={plan.name} 
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border ${
                plan.popular 
                  ? 'border-2 border-blue-500 shadow-2xl scale-105' 
                  : 'border border-gray-200 dark:border-gray-700'
              } hover:shadow-xl transition-all duration-300`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              {/* Header */}
              <div className="text-center p-6 pb-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {plan.description}
                </p>
                <div className="mt-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-500 dark:text-gray-400 ml-1">/month</span>
                    )}
                  </div>
                  <div className="flex items-center justify-center mt-2 text-blue-600 dark:text-blue-400">
                    <Zap className="w-4 h-4 mr-1" />
                    <span className="font-medium">{plan.credits} AI Credits</span>
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="px-6 pb-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Footer */}
              <div className="p-6 pt-0">
                <button 
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white'
                      : 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    if (plan.price === 0) {
                      window.location.href = '/sign-up'
                    } else {
                      window.location.href = '/billing'
                    }
                  }}
                >
                  {plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">What can you do with your credits?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Resume Generation</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">1 credit each</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Job Tailoring</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">1 credit each</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">Cover Letters</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">1 credit each</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <h4 className="font-semibold mb-1 text-gray-900 dark:text-white">All AI Features</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">1 credit each</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
