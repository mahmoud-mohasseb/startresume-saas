"use client"

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import {
  Zap,
  TrendingUp,
  Calendar,
  FileText,
  MessageSquare,
  Brain,
  Target,
  Award,
  Clock,
  ArrowUp,
  ArrowDown,
  Activity,
  Sparkles,
  Crown,
  Rocket
} from 'lucide-react'
import { formatCreditsDisplay } from '@/lib/credits-utils'

interface UsageData {
  subscription: {
    plan: string
    planName: string
    status: string
    totalCredits: number
    usedCredits: number
    remainingCredits: number
  }
  analytics: {
    totalUsed: number
    usageByAction: Record<string, number>
    usageByDay: Record<string, number>
    recentUsage: Array<{
      action: string
      credits_used: number
      timestamp: string
      metadata?: any
    }>
  }
  plan: {
    id: string
    name: string
    credits: number
    price: number
    features: string[]
    popular?: boolean
  }
}

const FEATURE_COLORS = {
  resume_generation: '#3B82F6',
  ai_suggestions: '#10B981',
  cover_letter: '#8B5CF6',
  mock_interview: '#F59E0B',
  linkedin_optimization: '#EF4444',
  salary_negotiation: '#06B6D4'
}

const FEATURE_ICONS = {
  resume_generation: FileText,
  ai_suggestions: Brain,
  cover_letter: MessageSquare,
  mock_interview: Target,
  linkedin_optimization: Award,
  salary_negotiation: TrendingUp
}

const FEATURE_NAMES = {
  resume_generation: 'Resume Generation',
  ai_suggestions: 'AI Suggestions',
  cover_letter: 'Cover Letters',
  mock_interview: 'Mock Interviews',
  linkedin_optimization: 'LinkedIn Optimization',
  salary_negotiation: 'Salary Negotiation'
}

export default function UsagePage() {
  const { user, isLoaded } = useUser()
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    if (isLoaded && user) {
      fetchUsageData()
    }
  }, [isLoaded, user, timeRange])

  const fetchUsageData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/credits')
      if (response.ok) {
        const data = await response.json()
        setUsageData(data)
      }
    } catch (error) {
      console.error('Error fetching usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basic': return <Zap className="w-5 h-5" />
      case 'standard': return <Crown className="w-5 h-5" />
      case 'pro': return <Rocket className="w-5 h-5" />
      default: return <Sparkles className="w-5 h-5" />
    }
  }

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic': return 'from-blue-500 to-cyan-500'
      case 'standard': return 'from-purple-500 to-pink-500'
      case 'pro': return 'from-orange-500 to-red-500'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  const formatUsageByDay = () => {
    if (!usageData?.analytics.usageByDay) return []
    
    const days = Object.entries(usageData.analytics.usageByDay)
      .map(([date, usage]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        usage: usage as number
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14) // Last 14 days
    
    return days
  }

  const formatUsageByAction = () => {
    if (!usageData?.analytics.usageByAction) return []
    
    return Object.entries(usageData.analytics.usageByAction).map(([action, usage]) => ({
      name: FEATURE_NAMES[action as keyof typeof FEATURE_NAMES] || action,
      value: usage as number,
      color: FEATURE_COLORS[action as keyof typeof FEATURE_COLORS] || '#6B7280'
    }))
  }

  const getUsagePercentage = () => {
    if (!usageData) return 0
    return Math.round((usageData.subscription.usedCredits / usageData.subscription.totalCredits) * 100)
  }

  const getUsageTrend = () => {
    const dailyUsage = formatUsageByDay()
    if (dailyUsage.length < 2) return 0
    
    const recent = dailyUsage.slice(-3).reduce((sum, day) => sum + day.usage, 0) / 3
    const previous = dailyUsage.slice(-6, -3).reduce((sum, day) => sum + day.usage, 0) / 3
    
    if (previous === 0) return recent > 0 ? 100 : 0
    return Math.round(((recent - previous) / previous) * 100)
  }

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!usageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Unable to load usage data
            </h1>
            <button
              onClick={fetchUsageData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const usageTrend = getUsageTrend()
  const usagePercentage = getUsagePercentage()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                AI Usage Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Track your AI feature usage and optimize your plan
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </motion.div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${getPlanColor(usageData.subscription.plan)}`}>
                <div className="text-white">
                  {getPlanIcon(usageData.subscription.plan)}
                </div>
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Current Plan
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {usageData.subscription.planName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {usageData.subscription.totalCredits} credits/month
            </p>
          </motion.div>

          {/* Credits Used */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-orange-500">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Credits Used
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCreditsDisplay(usageData.subscription.usedCredits)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {usagePercentage}% of monthly limit
            </p>
          </motion.div>

          {/* Credits Remaining */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Remaining
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCreditsDisplay(usageData.subscription.remainingCredits)}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Credits left this month
            </p>
          </motion.div>

          {/* Usage Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${usageTrend >= 0 ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                {usageTrend >= 0 ? (
                  <ArrowUp className="w-5 h-5 text-white" />
                ) : (
                  <ArrowDown className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Trend
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              {usageTrend >= 0 ? '+' : ''}{usageTrend}%
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              vs previous period
            </p>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Usage Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Daily Usage Trend
              </h3>
              <Calendar className="w-5 h-5 text-gray-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={formatUsageByDay()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6B7280"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="usage"
                  stroke="#3B82F6"
                  fill="url(#colorUsage)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Feature Usage Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Feature Usage Breakdown
              </h3>
              <Brain className="w-5 h-5 text-gray-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={formatUsageByAction()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {formatUsageByAction().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {formatUsageByAction().map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.value} credits
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 dark:border-gray-600/20 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <Clock className="w-5 h-5 text-gray-500" />
          </div>
          <div className="space-y-4">
            {usageData.analytics.recentUsage.slice(0, 10).map((usage, index) => {
              const Icon = FEATURE_ICONS[usage.action as keyof typeof FEATURE_ICONS] || Activity
              const featureName = FEATURE_NAMES[usage.action as keyof typeof FEATURE_NAMES] || usage.action
              
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {featureName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(usage.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      -{usage.credits_used} credits
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
