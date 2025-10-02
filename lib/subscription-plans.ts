// Subscription plans configuration
export const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    credits: 10,
    creditCost: 0.99,
    features: [
      'Resume Generation',
      'AI Suggestions', 
      'Basic Templates',
      'PDF Export',
      'Email Support'
    ],
    popular: false,
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic'
  },
  {
    id: 'standard', 
    name: 'Standard',
    price: 19.99,
    credits: 50,
    creditCost: 0.40,
    features: [
      'Everything in Basic',
      'Job Tailoring',
      'Cover Letter Generation', 
      'Premium Templates',
      'ATS Optimization',
      'Priority Support'
    ],
    popular: true,
    stripePriceId: process.env.STRIPE_STANDARD_PRICE_ID || 'price_standard'
  },
  {
    id: 'pro',
    name: 'Pro', 
    price: 49.99,
    credits: 200,
    creditCost: 0.25,
    features: [
      'Everything in Standard',
      'Personal Brand Strategy',
      'Mock Interview Practice',
      'LinkedIn Optimization',
      'Salary Negotiation Tools',
      'Unlimited Templates',
      'White-glove Support'
    ],
    popular: false,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro'
  }
]

export type SubscriptionPlan = typeof SUBSCRIPTION_PLANS[0]

export function getPlanById(planId: string): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.id === planId) || null
}

export function getPlanByPrice(price: number): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find(plan => plan.price === price) || null
}
