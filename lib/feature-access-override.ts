// Temporary override for feature access to bypass subscription issues

export function canUseFeatureOverride(feature: string): boolean {
  // For now, allow all features since we have working credits
  console.log(`🔓 Feature access override: allowing ${feature}`)
  return true
}

export function hasFeatureAccessOverride(feature: string): boolean {
  // Allow all features temporarily
  console.log(`🔓 Feature access override: allowing ${feature}`)
  return true
}

// Feature mapping for different plans
export const FEATURE_PLAN_MAPPING = {
  'ai_suggestions': ['basic', 'standard', 'pro'],
  'resume_generation': ['basic', 'standard', 'pro'],
  'cover_letter_generation': ['basic', 'standard', 'pro'],
  'job_tailoring': ['basic', 'standard', 'pro'],
  'linkedin_optimization': ['standard', 'pro'],
  'salary_negotiation': ['standard', 'pro'],
  'personal_brand_strategy': ['pro'],
  'mock_interview': ['pro'],
  'resume_analysis': ['basic', 'standard', 'pro'],
  'keyword_optimization': ['basic', 'standard', 'pro']
}

export function checkFeatureAccess(feature: string, userPlan: string = 'standard'): boolean {
  const allowedPlans = FEATURE_PLAN_MAPPING[feature as keyof typeof FEATURE_PLAN_MAPPING]
  if (!allowedPlans) {
    console.log(`⚠️ Unknown feature: ${feature}, allowing by default`)
    return true
  }
  
  const hasAccess = allowedPlans.includes(userPlan)
  console.log(`🔍 Feature ${feature} access for ${userPlan} plan: ${hasAccess}`)
  return hasAccess
}
