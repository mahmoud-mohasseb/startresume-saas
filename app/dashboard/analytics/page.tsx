'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { TrendingUp, Users, FileText, CreditCard, Activity, Calendar, Target, Award } from 'lucide-react'
import PlanBasedFeatureGuard from '@/components/PlanBasedFeatureGuard'

interface AnalyticsData {
  totalResumes: number
  totalCoverLetters: number
  creditsUsed: number
  creditsRemaining: number
  atsScoreAverage: number
  recentActivity: Array<{
    date: string
    action: string
    credits: number
  }>
}

export default function AnalyticsPage() {
  const { user } = useUser()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      // Fetch actual analytics data from credits API
      const response = await fetch('/api/user/credits')
      if (response.ok) {
        const data = await response.json()
        
        setAnalytics({
          totalResumes: data.analytics?.totalUsed || 0,
          totalCoverLetters: data.analytics?.usageByAction?.cover_letter || 0,
          creditsUsed: data.subscription?.usedCredits || 0,
          creditsRemaining: data.subscription?.remainingCredits || 0,
          atsScoreAverage: 78, // Keep this as placeholder for now
          recentActivity: data.analytics?.recentUsage?.map((usage: any) => ({
            date: new Date(usage.timestamp).toLocaleDateString(),
            action: usage.action,
            credits: usage.credits_used
          })) || []
        })
      } else {
        throw new Error('Failed to fetch analytics data')
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Data</h2>
          <p className="text-gray-600">Start using our features to see your analytics.</p>
        </div>
      </div>
    )
  }

  return (
    <PlanBasedFeatureGuard feature="analytics">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your usage and performance metrics</p>
          </div>
          <div className="flex gap-2">
            {['7d', '30d', '90d', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalResumes}</p>
                <p className="text-xs text-gray-500">+2 from last month</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Cover Letters</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalCoverLetters}</p>
                <p className="text-xs text-gray-500">+1 from last month</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credits Used</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.creditsUsed}</p>
                <p className="text-xs text-gray-500">{analytics.creditsRemaining} remaining</p>
              </div>
              <CreditCard className="h-8 w-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg ATS Score</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.atsScoreAverage}%</p>
                <p className="text-xs text-gray-500">+5% from last month</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600">Your latest actions and credit usage</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.date}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                    -{activity.credits} credits
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Credit Usage Progress */}
        <div className="bg-white rounded-lg shadow border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Credit Usage</h2>
            <p className="text-sm text-gray-600">Track your monthly credit consumption</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Credits Used</span>
                <span>{analytics.creditsUsed} / {analytics.creditsUsed + analytics.creditsRemaining}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(analytics.creditsUsed / (analytics.creditsUsed + analytics.creditsRemaining)) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>0</span>
                <span>{analytics.creditsUsed + analytics.creditsRemaining} total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlanBasedFeatureGuard>
  )
}