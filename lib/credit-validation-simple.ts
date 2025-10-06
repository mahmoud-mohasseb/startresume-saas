// Simple credit validation that works with current database schema

export async function validateAndConsumeCredits(
  feature: string, 
  creditsRequired: number = 1,
  description?: string
): Promise<{ success: boolean; remainingCredits: number; error?: string }> {
  try {
    console.log(`🎯 Validating credits for ${feature}, required: ${creditsRequired}`)

    const response = await fetch('/api/consume-credit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        feature,
        creditsRequired,
        description
      }),
    })

    const data = await response.json()

    if (response.ok && data.success) {
      console.log(`✅ Credits validated and consumed for ${feature}`)
      return {
        success: true,
        remainingCredits: data.remainingCredits
      }
    } else {
      console.error(`❌ Credit validation failed for ${feature}:`, data.error)
      return {
        success: false,
        remainingCredits: data.remainingCredits || 0,
        error: data.error || 'Credit validation failed'
      }
    }
  } catch (error) {
    console.error('❌ Error validating credits:', error)
    return {
      success: false,
      remainingCredits: 0,
      error: 'Network error during credit validation'
    }
  }
}

export async function checkCreditStatus(): Promise<{
  hasCredits: boolean
  totalCredits: number
  usedCredits: number
  remainingCredits: number
  plan: string
}> {
  try {
    const response = await fetch('/api/consume-credit', {
      method: 'GET',
    })

    if (response.ok) {
      const data = await response.json()
      return {
        hasCredits: data.hasCredits,
        totalCredits: data.totalCredits,
        usedCredits: data.usedCredits,
        remainingCredits: data.remainingCredits,
        plan: data.plan
      }
    } else {
      throw new Error('Failed to check credit status')
    }
  } catch (error) {
    console.error('Error checking credit status:', error)
    return {
      hasCredits: false,
      totalCredits: 0,
      usedCredits: 0,
      remainingCredits: 0,
      plan: 'free'
    }
  }
}

// Credit requirements for different features
export const CREDIT_COSTS = {
  'resume-generation': 5,
  'cover-letter': 3,
  'job-tailoring': 3,
  'linkedin-optimization': 4,
  'salary-negotiation': 2,
  'personal-brand': 8,
  'mock-interview': 6,
  'ai-suggestions': 1,
  'resume-analysis': 2,
  'keyword-optimization': 1
} as const

export type FeatureType = keyof typeof CREDIT_COSTS

export function getCreditCost(feature: FeatureType): number {
  return CREDIT_COSTS[feature] || 1
}
