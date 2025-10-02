'use client'

import { ReactNode, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { motion } from 'framer-motion'
import { 
  Lock, 
  Crown, 
  Star, 
  Zap, 
  CreditCard, 
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

interface PlanBasedFeatureGuardProps {
  feature: string
  children: ReactNode
}

export default function PlanBasedFeatureGuard({ feature, children }: PlanBasedFeatureGuardProps) {
  const { user, isLoaded } = useUser()
  const { subscription, isLoading, hasFeatureAccess, canUseFeature, refreshSubscription } = useSubscription()

  // Auto-refresh when user comes back to check for plan updates
  useEffect(() => {
    const handleFocus = () => {
      if (!hasFeatureAccess(feature)) {
        refreshSubscription()
      }
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [feature, hasFeatureAccess, refreshSubscription])

  // Loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading feature access...</p>
        </div>
      </div>
    )
  }

  // User not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Please sign in to access this feature.</p>
          <Link 
            href="/sign-in"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    )
  }

  // Check if user has access to this feature
  const hasAccess = hasFeatureAccess(feature)
  const canUse = canUseFeature(feature)

  // If user has access and can use the feature, render children
  if (hasAccess && canUse) {
    return <>{children}</>
  }

  // Get feature display information
  const getFeatureInfo = (featureName: string) => {
    const featureMap: Record<string, { name: string; icon: ReactNode; description: string }> = {
      'resume_generation': {
        name: 'Resume Generation',
        icon: <Sparkles className="w-8 h-8" />,
        description: 'Create professional resumes with AI assistance'
      },
      'job_tailoring': {
        name: 'Job Tailoring',
        icon: <Zap className="w-8 h-8" />,
        description: 'Customize your resume for specific job applications'
      },
      'cover_letter_generation': {
        name: 'Cover Letter Generation',
        icon: <Star className="w-8 h-8" />,
        description: 'Generate personalized cover letters for job applications'
      },
      'linkedin_optimization': {
        name: 'LinkedIn Optimization',
        icon: <Users className="w-8 h-8" />,
        description: 'Optimize your LinkedIn profile for better visibility'
      },
      'personal_brand_strategy': {
        name: 'Personal Brand Strategy',
        icon: <Crown className="w-8 h-8" />,
        description: 'Develop your personal brand and professional identity'
      },
      'mock_interview': {
        name: 'Mock Interview',
        icon: <CheckCircle className="w-8 h-8" />,
        description: 'Practice interviews with AI-powered feedback'
      },
      'salary_research': {
        name: 'Salary Research',
        icon: <CreditCard className="w-8 h-8" />,
        description: 'Research salary ranges and negotiation strategies'
      }
    }

    return featureMap[featureName] || {
      name: featureName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      icon: <Lock className="w-8 h-8" />,
      description: 'Premium feature access required'
    }
  }

  const featureInfo = getFeatureInfo(feature)

  // Determine the reason for access denial
  const getReason = () => {
    if (!subscription) {
      return {
        title: 'No Active Plan',
        message: 'You need an active subscription to access this feature.',
        type: 'no-plan' as const
      }
    }

    if (!hasAccess) {
      return {
        title: 'Feature Not Available',
        message: `This feature is not available in your ${subscription.plan.name} plan.`,
        type: 'plan-upgrade' as const
      }
    }

    if (!canUse) {
      if (subscription.plan.isUnlimited) {
        return {
          title: 'Temporary Issue',
          message: 'There seems to be a temporary issue. Please try refreshing.',
          type: 'refresh' as const
        }
      } else {
        return {
          title: 'No Credits Remaining',
          message: `You have used all ${subscription.usage.limit} credits for this billing period.`,
          type: 'no-credits' as const
        }
      }
    }

    return {
      title: 'Access Denied',
      message: 'You do not have access to this feature.',
      type: 'general' as const
    }
  }

  const reason = getReason()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-8 text-center">
          {/* Feature Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl mb-6 text-white">
            {featureInfo.icon}
          </div>

          {/* Feature Name */}
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {featureInfo.name}
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {featureInfo.description}
          </p>

          {/* Access Denied Message */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
              {reason.title}
            </h2>
            <p className="text-red-700 dark:text-red-300">
              {reason.message}
            </p>
          </div>

          {/* Current Plan Info */}
          {subscription && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex items-center space-x-2">
                  {subscription.plan.type === 'pro' && <Crown className="w-5 h-5 text-yellow-500" />}
                  {subscription.plan.type === 'standard' && <Star className="w-5 h-5 text-blue-500" />}
                  {subscription.plan.type === 'basic' && <Users className="w-5 h-5 text-green-500" />}
                  {subscription.plan.type === 'free' && <CreditCard className="w-5 h-5 text-gray-500" />}
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Current Plan: {subscription.plan.name}
                  </span>
                </div>
              </div>
              
              {!subscription.plan.isUnlimited && (
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  Credits: {subscription.usage.remaining} / {subscription.usage.limit} remaining
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {reason.type === 'refresh' ? (
              <button
                onClick={() => refreshSubscription()}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Access
              </button>
            ) : (
              <Link
                href="/dashboard/billing"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg"
              >
                <Crown className="w-4 h-4 mr-2" />
                {reason.type === 'no-credits' ? 'Upgrade Plan' : 'View Plans'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            )}
            
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Back to Dashboard
            </Link>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
            Need help? Contact our support team for assistance with your subscription.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
