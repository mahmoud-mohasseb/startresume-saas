// Credit utilities for client-side usage
export interface CreditUsage {
  action: string
  credits_used: number
  timestamp: string
  metadata?: any
}

export interface CreditAnalytics {
  totalUsed: number
  usageByAction: Record<string, number>
  usageByDay: Record<string, number>
  recentUsage: CreditUsage[]
}

export const CREDIT_COSTS = {
  resume_generation: 5,
  cover_letter_generation: 3,
  job_tailoring: 3,
  salary_research: 2,
  linkedin_optimization: 4,
  personal_brand_strategy: 8,
  mock_interview: 6,
  ai_suggestions: 1
} as const

export type CreditAction = keyof typeof CREDIT_COSTS

export function getCreditCost(action: CreditAction): number {
  return CREDIT_COSTS[action] || 1
}

export function formatCreditAction(action: string): string {
  return action
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

export function calculateUsagePercentage(used: number, total: number): number {
  if (total === 0) return 0
  return Math.round((used / total) * 100)
}

export function getUsageColor(percentage: number): string {
  if (percentage >= 90) return 'text-red-600'
  if (percentage >= 70) return 'text-yellow-600'
  return 'text-green-600'
}

export function getProgressBarColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500'
  if (percentage >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function groupUsageByDay(usage: CreditUsage[]): Record<string, number> {
  return usage.reduce((acc, item) => {
    const day = item.timestamp.split('T')[0]
    acc[day] = (acc[day] || 0) + item.credits_used
    return acc
  }, {} as Record<string, number>)
}

export function groupUsageByAction(usage: CreditUsage[]): Record<string, number> {
  return usage.reduce((acc, item) => {
    acc[item.action] = (acc[item.action] || 0) + item.credits_used
    return acc
  }, {} as Record<string, number>)
}
