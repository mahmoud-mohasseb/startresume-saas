/**
 * Client-side utility functions for credits system
 * These functions can be safely imported by client components
 */

/**
 * Format credits display for UI
 */
export function formatCreditsDisplay(credits: number): string {
  if (credits >= 1000) {
    return `${(credits / 1000).toFixed(1)}k`
  }
  return credits.toString()
}

/**
 * Get color based on credit usage percentage
 */
export function getCreditUsageColor(remainingCredits: number, totalCredits: number): string {
  if (remainingCredits < 2) return 'text-red-600 bg-red-100 dark:bg-red-900/20'
  if (remainingCredits < 5) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
  return 'text-green-600 bg-green-100 dark:bg-green-900/20'
}

/**
 * Get progress bar color based on remaining credits
 */
export function getCreditProgressColor(remainingCredits: number): string {
  if (remainingCredits < 2) return 'bg-red-500'
  if (remainingCredits < 5) return 'bg-yellow-500'
  return 'bg-green-500'
}

/**
 * Check if credits are low
 */
export function isLowCredits(remainingCredits: number): boolean {
  return remainingCredits < 5
}

/**
 * Check if credits are very low
 */
export function isVeryLowCredits(remainingCredits: number): boolean {
  return remainingCredits < 2
}

/**
 * Get credit action display name
 */
export function getActionDisplayName(action: string): string {
  return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

/**
 * Estimate credits cost for multiple actions
 */
export function estimateActionsCost(actions: string[], creditCosts: Record<string, number>): number {
  return actions.reduce((total, action) => total + (creditCosts[action] || 0), 0)
}

/**
 * Format plan name for display
 */
export function formatPlanName(plan: string): string {
  return plan.toUpperCase()
}
