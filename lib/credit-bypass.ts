// Universal credit bypass with persistent credit tracking

// Persistent credit tracking using localStorage
function getUserCreditsFromStorage(userId: string): number {
  if (typeof window === 'undefined') return 50 // Server-side default
  
  try {
    const stored = localStorage.getItem(`credits_${userId}`)
    const credits = stored ? parseInt(stored, 10) : 50
    console.log(`🔍 Reading credits from localStorage for ${userId}: ${credits}`)
    return credits
  } catch (error) {
    console.warn('Failed to read credits from localStorage:', error)
    return 50
  }
}

function setUserCreditsInStorage(userId: string, credits: number): void {
  if (typeof window === 'undefined') return // Server-side skip
  
  try {
    localStorage.setItem(`credits_${userId}`, credits.toString())
    console.log(`💾 Credits saved to localStorage: ${credits} for user ${userId}`)
  } catch (error) {
    console.warn('Failed to save credits to localStorage:', error)
  }
}

// Initialize user with 50 credits if not exists
function initializeUserCredits(userId: string): number {
  const credits = getUserCreditsFromStorage(userId)
  console.log(`🔍 Initialized credits for ${userId}: ${credits}`)
  return credits
}

export async function checkAndConsumeStripeDirectCredits(
  userId: string, 
  creditsRequired: number, 
  feature: string
) {
  console.log(`💳 TRACKING credits for ${feature} (${creditsRequired} credits) - user: ${userId}`)
  
  const currentCredits = initializeUserCredits(userId)
  
  if (currentCredits < creditsRequired) {
    console.log(`❌ Insufficient credits: ${currentCredits} < ${creditsRequired}`)
    return {
      success: false,
      currentCredits: currentCredits,
      remainingCredits: currentCredits,
      requiredCredits: creditsRequired,
      plan: 'standard',
      planName: 'Standard',
      message: `Insufficient credits. You have ${currentCredits}, but need ${creditsRequired}.`
    }
  }
  
  // Deduct credits
  const newCredits = currentCredits - creditsRequired
  setUserCreditsInStorage(userId, newCredits)
  
  console.log(`✅ Credits consumed: ${currentCredits} → ${newCredits} for ${feature}`)
  
  // Trigger credit update event
  triggerCreditUpdate(userId)
  
  return {
    success: true,
    currentCredits: currentCredits,
    remainingCredits: newCredits,
    requiredCredits: creditsRequired,
    plan: 'standard',
    planName: 'Standard',
    message: `Successfully consumed ${creditsRequired} credits for ${feature}`
  }
}

export async function checkAndRecordUsage(userId: string, feature: string) {
  console.log(`🔓 BYPASSING checkAndRecordUsage for ${feature}`)
  
  return {
    success: true,
    hasAccess: true, // For compatibility with different API expectations
    message: 'Plan access granted (bypassed)',
    reason: 'access_granted',
    planStatus: {
      planName: 'Standard',
      monthlyUsage: 1,
      monthlyLimit: 50,
      remainingUsage: 49,
      isUnlimited: false
    }
  }
}

// Export functions for shared credit tracking
export function getUserCredits(userId: string): number {
  return initializeUserCredits(userId)
}

export function setUserCredits(userId: string, credits: number): void {
  setUserCreditsInStorage(userId, credits)
}

export function getUserCreditInfo(userId: string): { plan: string; credits: number; used: number } {
  const remaining = initializeUserCredits(userId)
  const totalCredits = 50
  const used = totalCredits - remaining
  
  return {
    plan: 'standard',
    credits: totalCredits,
    used: used
  }
}

// Trigger credit update events without causing reloads
export function triggerCreditUpdate(userId: string): void {
  if (typeof window !== 'undefined') {
    // Dispatch a custom event for credit updates
    window.dispatchEvent(new CustomEvent('credits-updated', {
      detail: { userId, credits: getUserCredits(userId) }
    }))
    
    // Also trigger a storage event for cross-tab updates
    window.dispatchEvent(new StorageEvent('storage', {
      key: `credits_${userId}`,
      newValue: getUserCredits(userId).toString()
    }))
  }
}

// Export a function to check if bypass is active
export function isCreditBypassActive(): boolean {
  return true // Always active during transition
}
