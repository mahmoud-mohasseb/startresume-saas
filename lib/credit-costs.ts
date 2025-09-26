// Credit costs for different services - 1 credit per use for all services
export const CREDIT_COSTS = {
  // All services cost 1 credit for simplicity and fairness
  resume_generation: 1,        // Create Resume
  job_tailoring: 1,           // Job Tailoring
  cover_letter_generation: 1, // Cover Letter
  personal_brand_strategy: 1,  // Personal Brand
  mock_interview: 1,          // Mock Interview
  linkedin_optimization: 1,   // LinkedIn Optimizer
  salary_negotiation: 1,      // Salary Coach
  
  // AI features (still free for better UX in create resume)
  ai_suggestions: 0,          // AI Suggestions (free)
} as const

export type CreditFeature = keyof typeof CREDIT_COSTS

// Helper function to get credit cost for a feature
export function getCreditCost(feature: CreditFeature): number {
  return CREDIT_COSTS[feature]
}

// Helper function to check if user has enough credits
export function hasEnoughCredits(userCredits: number, feature: CreditFeature): boolean {
  return userCredits >= getCreditCost(feature)
}

// Feature descriptions for UI
export const FEATURE_DESCRIPTIONS = {
  resume_generation: 'AI-powered resume creation with templates',
  job_tailoring: 'Customize resume for specific job applications',
  cover_letter_generation: 'Generate personalized cover letters',
  personal_brand_strategy: 'Comprehensive personal branding strategy',
  mock_interview: 'AI-powered interview practice and feedback',
  linkedin_optimization: 'Optimize LinkedIn profile and content',
  salary_negotiation: 'Salary research and negotiation strategies',
  ai_suggestions: 'AI writing suggestions and improvements (Free)',
} as const

// Plan value calculations
export const PLAN_VALUE = {
  basic: {
    credits: 10,
    price: 9.99,
    costPerCredit: 0.999, // $0.999 per credit
    services: 10 // Can use 10 services
  },
  standard: {
    credits: 50, 
    price: 19.99,
    costPerCredit: 0.3998, // $0.40 per credit (60% savings)
    services: 50 // Can use 50 services
  },
  pro: {
    credits: 200,
    price: 49.99, 
    costPerCredit: 0.24995, // $0.25 per credit (75% savings)
    services: 200 // Can use 200 services
  }
}
