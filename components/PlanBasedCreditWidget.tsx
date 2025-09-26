'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { CreditCard, Zap, ArrowUp, ChevronDown, ChevronUp, Calendar, Star, Users, Crown, Sparkles, Infinity, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useSubscription } from '@/contexts/SubscriptionContext'

export default function PlanBasedCreditWidget() {
  const { user } = useUser()
  const { subscription, isLoading, forceRefresh } = useSubscription()
  const [isExpanded, setIsExpanded] = useState(false)

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-blue-200 dark:bg-blue-700 rounded w-1/2 mb-2"></div>
          <div className="h-2 bg-blue-200 dark:bg-blue-700 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <CreditCard className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">No active plan</p>
          <Link href="/dashboard/billing" className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors">
            Choose Plan
          </Link>
        </div>
      </div>
    )
  }

  const getPlanIcon = (planType: string) => {
    switch (planType?.toLowerCase()) {
      case 'pro': return <Crown className="w-5 h-5 text-yellow-500" />
      case 'standard': return <Star className="w-5 h-5 text-blue-500" />
      case 'basic': return <Users className="w-5 h-5 text-green-500" />
      case 'free': return <CreditCard className="w-5 h-5 text-gray-500" />
      default: return <CreditCard className="w-5 h-5 text-gray-500" />
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    } catch {
      return 'N/A'
    }
  }

  // Safe access to plan data with fallbacks
  const planName = subscription.plan?.name || 'Unknown Plan'
  const planType = subscription.plan?.type || 'free'
  const isUnlimited = subscription.plan?.isUnlimited || false
  const isActive = subscription.plan?.isActive || false
  const planPrice = subscription.plan?.price || 0

  const currentUsage = subscription.usage?.current || 0
  const usageLimit = subscription.usage?.limit || 0
  const remainingUsage = subscription.usage?.remaining || 0
  const usagePercentage = subscription.usage?.percentage || 0

  const periodStart = subscription.period?.start || ''
  const periodEnd = subscription.period?.end || ''

  const featureBreakdown = subscription.analytics?.featureBreakdown || {}

  return (
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800 shadow-sm">
      <div 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getPlanIcon(planType)}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {planName}
            </span>
            {!isActive && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                Inactive
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>

        <div className="flex items-center space-x-2 mb-2">
          {isUnlimited ? (
            <>
              <Infinity className="w-4 h-4 text-purple-500" />
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                Unlimited
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {remainingUsage}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                / {usageLimit}
              </span>
            </>
          )}
        </div>

        {!isUnlimited && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(usagePercentage)}`}
              style={{ width: `${Math.min(Math.max(usagePercentage, 0), 100)}%` }}
            ></div>
          </div>
        )}

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {currentUsage} used this period
        </p>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
          <div className="space-y-3">
            {/* Usage Analytics */}
            {Object.keys(featureBreakdown).length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Usage Breakdown</h4>
                <div className="space-y-1">
                  {Object.entries(featureBreakdown).map(([feature, count]) => (
                    <div key={feature} className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400 capitalize">
                        {feature.replace(/_/g, ' ')}
                      </span>
                      <span className="text-gray-900 dark:text-white font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Billing Period */}
            {periodStart && periodEnd && (
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Period:</span>
                <span>
                  {formatDate(periodStart)} - {formatDate(periodEnd)}
                </span>
              </div>
            )}

            {/* Plan Price */}
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Price:</span>
              <span className="font-medium">
                {planPrice === 0 ? 'Free' : `$${planPrice}/month`}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Link 
              href="/dashboard/billing" 
              className="flex-1 text-center bg-blue-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {planType === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
            </Link>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                forceRefresh()
              }}
              className="flex-1 text-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs py-2 px-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Refresh
            </button>
          </div>

          {/* Upgrade Prompt for Usage Limits */}
          {!isUnlimited && usagePercentage > 80 && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  You're running low on usage. Consider upgrading!
                </p>
              </div>
            </div>
          )}

          {/* Inactive Plan Warning */}
          {!isActive && (
            <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-red-600 dark:text-red-400" />
                <p className="text-xs text-red-700 dark:text-red-300">
                  Your plan is inactive. Please update your subscription.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
