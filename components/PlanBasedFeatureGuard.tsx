'use client'

import React, { ReactNode, useState } from 'react'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lock, 
  Crown, 
  Star, 
  Users, 
  ArrowRight, 
  Sparkles,
  TrendingUp,
  Zap,
  CheckCircle,
  X
} from 'lucide-react'
import Link from 'next/link'

interface PlanBasedFeatureGuardProps {
  feature: string
  children: ReactNode
}

const FEATURE_DETAILS: Record<string, {
  name: string
  description: string
  icon: React.ComponentType<any>
  requiredPlan: string
  benefits: string[]
}> = {
  resume_generation: {
    name: 'AI Resume Generation',
    description: 'Create professional resumes with AI-powered content optimization',
    icon: Sparkles,
    requiredPlan: 'Basic',
    benefits: [
      'AI-powered content generation',
      'Professional formatting',
      'ATS optimization',
      'Multiple templates'
    ]
  },
  cover_letter_generation: {
    name: 'Cover Letter Generation',
    description: 'Generate personalized cover letters for job applications',
    icon: Star,
    requiredPlan: 'Basic',
    benefits: [
      'Personalized content',
      'Job-specific customization',
      'Professional tone',
      'Quick generation'
    ]
  },
  job_tailoring: {
    name: 'Job Tailoring',
    description: 'Customize your resume for specific job applications',
    icon: TrendingUp,
    requiredPlan: 'Basic',
    benefits: [
      'Job-specific optimization',
      'Keyword matching',
      'ATS compatibility',
      'Match scoring'
    ]
  },
  personal_brand_strategy: {
    name: 'Personal Brand Strategy',
    description: 'Develop a comprehensive personal branding strategy',
    icon: Crown,
    requiredPlan: 'Standard',
    benefits: [
      'Brand analysis',
      'Strategy development',
      'Market positioning',
      'Action plans'
    ]
  },
  salary_research: {
    name: 'Salary Research',
    description: 'Get market insights and negotiation strategies',
    icon: TrendingUp,
    requiredPlan: 'Standard',
    benefits: [
      'Market data analysis',
      'Salary benchmarking',
      'Negotiation tips',
      'Industry insights'
    ]
  },
  linkedin_optimization: {
    name: 'LinkedIn Optimization',
    description: 'Optimize your LinkedIn profile with AI suggestions',
    icon: Users,
    requiredPlan: 'Standard',
    benefits: [
      'Profile optimization',
      'Content suggestions',
      'Keyword optimization',
      'Engagement tips'
    ]
  },
  mock_interview: {
    name: 'Mock Interview Practice',
    description: 'Practice interviews with AI-powered feedback',
    icon: Zap,
    requiredPlan: 'Pro',
    benefits: [
      'Realistic interview questions',
      'AI feedback',
      'Performance scoring',
      'Improvement suggestions'
    ]
  }
}

// Inline upgrade banner component
function InlineUpgradeBanner({ feature, onClose }: { feature: string, onClose: () => void }) {
  const { subscription } = useSubscription()
  const featureDetail = FEATURE_DETAILS[feature]
  
  if (!featureDetail) return null

  const IconComponent = featureDetail.icon
  const hasAccess = subscription?.features?.featureAccess?.[feature]
  const isUsageLimitReached = hasAccess && subscription && !subscription.plan.isUnlimited && subscription.usage.remaining <= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <IconComponent className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
              {isUsageLimitReached ? 'Usage Limit Reached' : 'Upgrade Required'}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {isUsageLimitReached 
                ? `You've used all your monthly credits. Upgrade to continue.`
                : `${featureDetail.name} requires ${featureDetail.requiredPlan} plan or higher.`
              }
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Link
            href="/dashboard/billing"
            className="bg-blue-600 text-white text-xs py-1.5 px-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            {isUsageLimitReached ? 'Upgrade' : `Get ${featureDetail.requiredPlan}`}
          </Link>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function PlanBasedFeatureGuard({ feature, children }: PlanBasedFeatureGuardProps) {
  const { user } = useUser()
  const { subscription, isLoading, canUseFeature, hasFeatureAccess } = useSubscription()
  const [showBanner, setShowBanner] = useState(true)

  // Show loading state only for authentication
  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access this feature.
          </p>
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    )
  }

  // If user can use the feature, show the page normally
  if (canUseFeature(feature)) {
    return <>{children}</>
  }

  // Show the original page with an inline upgrade banner
  return (
    <div>
      <AnimatePresence>
        {showBanner && (
          <div className="sticky top-0 z-40 p-4">
            <InlineUpgradeBanner 
              feature={feature} 
              onClose={() => setShowBanner(false)} 
            />
          </div>
        )}
      </AnimatePresence>
      {children}
    </div>
  )
}
