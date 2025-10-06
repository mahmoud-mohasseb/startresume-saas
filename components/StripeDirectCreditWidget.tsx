'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { CreditCard, Zap, ArrowUp, ChevronDown, ChevronUp, Calendar, Star, Users, Crown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSubscription } from '@/contexts/SubscriptionContext'

export default function StripeDirectCreditWidget() {
  const { user } = useUser()
  const { subscription, isLoading, refreshSubscription } = useSubscription()
  const [isExpanded, setIsExpanded] = useState(false)

  // DISABLED: Auto-refresh to prevent reloading
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (user) {
  //       refreshSubscription()
  //     }
  //   }, 30000) // Refresh every 30 seconds
  //   return () => clearInterval(interval)
  // }, [user, refreshSubscription])

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 dark:bg-blue-700 rounded w-3/4 mb-2"></div>
          <div className="h-6 bg-blue-200 dark:bg-blue-700 rounded w-1/2"></div>
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
            Upgrade Now
          </Link>
        </div>
      </div>
    )
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro': return <Crown className="w-5 h-5 text-yellow-500" />
      case 'standard': return <Star className="w-5 h-5 text-blue-500" />
      case 'basic': return <Users className="w-5 h-5 text-green-500" />
      default: return <CreditCard className="w-5 h-5 text-gray-500" />
    }
  }

  const getProgressColor = (remaining: number, total: number) => {
    const percentage = (remaining / total) * 100
    if (percentage > 50) return 'bg-green-500'
    if (percentage > 25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const progressPercentage = subscription.usage.limit > 0 
    ? (subscription.usage.remaining / subscription.usage.limit) * 100 
    : 0

  return (
    <div className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800 shadow-sm">
      <div 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {getPlanIcon(subscription.plan.type)}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {subscription.plan.name}
            </span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>

        <div className="flex items-center space-x-2 mb-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {subscription.usage.remaining}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            / {subscription.usage.limit}
          </span>
        </div>

        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(subscription.usage.remaining, subscription.usage.limit)}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          {subscription.usage.current} used this period
        </p>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className={`font-medium ${subscription.plan.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {subscription.plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {subscription.period.end && (
              <div className="flex justify-between">
                <span>Resets:</span>
                <span>{new Date(subscription.period.end).toLocaleDateString()}</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2 mt-3">
            <Link 
              href="/dashboard/billing" 
              className="flex-1 text-center bg-blue-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Manage Plan
            </Link>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                refreshSubscription()
              }}
              className="flex-1 text-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs py-2 px-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
