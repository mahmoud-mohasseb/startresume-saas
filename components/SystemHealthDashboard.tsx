'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Play, Zap } from 'lucide-react'

interface HealthReport {
  timestamp: string
  user_id: string
  credit_system: {
    status: string
    current_credits: number
    total_credits: number
    used_credits: number
    plan: string
  }
  credit_deduction: {
    status: string
    test_result: any
    remaining_after_test: number
  }
  api_endpoints: Array<{
    feature: string
    endpoint: string
    status: string
    credit_cost: number
  }>
  system_status: {
    polling_disabled: boolean
    refresh_loops_disabled: boolean
    feature_access_bypassed: boolean
    simple_credit_system_active: boolean
  }
  recommendations: string[]
}

export default function SystemHealthDashboard() {
  const { user } = useUser()
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any>({})
  const [isRunningTests, setIsRunningTests] = useState(false)

  const fetchHealthReport = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/system-health-check')
      if (response.ok) {
        const data = await response.json()
        setHealthReport(data)
        console.log('📊 System Health Report:', data)
      }
    } catch (error) {
      console.error('Failed to fetch health report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runSpecificTest = async (testType: string) => {
    if (!user) return
    
    setIsRunningTests(true)
    try {
      const response = await fetch('/api/system-health-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_type: testType })
      })
      
      if (response.ok) {
        const result = await response.json()
        setTestResults(prev => ({ ...prev, [testType]: result }))
        console.log(`🧪 ${testType} test result:`, result)
      }
    } catch (error) {
      console.error(`Failed to run ${testType} test:`, error)
    } finally {
      setIsRunningTests(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchHealthReport()
    }
  }, [user])

  if (!user) {
    return (
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
        <p className="text-yellow-800 dark:text-yellow-200">Please sign in to view system health.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Health Dashboard</h2>
        <button
          onClick={fetchHealthReport}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {healthReport && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Credit System Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Credit System</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                <span className="font-medium text-gray-900 dark:text-white">{healthReport.credit_system.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Credits:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {healthReport.credit_system.current_credits}/{healthReport.credit_system.total_credits}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Used:</span>
                <span className="font-medium text-gray-900 dark:text-white">{healthReport.credit_system.used_credits}</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">System Status</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-900 dark:text-white">Polling Disabled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-900 dark:text-white">Refresh Loops Disabled</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-900 dark:text-white">Feature Access Bypassed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-gray-900 dark:text-white">Simple Credits Active</span>
              </div>
            </div>
          </div>

          {/* API Endpoints */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Endpoints</h3>
            </div>
            <div className="space-y-2 text-sm max-h-48 overflow-y-auto">
              {healthReport.api_endpoints.map((endpoint, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 capitalize">
                    {endpoint.feature.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                      {endpoint.credit_cost}c
                    </span>
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Test Buttons */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Run Specific Tests</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => runSpecificTest('resume_generation')}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Test Resume Generation
          </button>
          <button
            onClick={() => runSpecificTest('linkedin_optimization')}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Test LinkedIn Optimization
          </button>
          <button
            onClick={() => runSpecificTest('credit_deduction')}
            disabled={isRunningTests}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            Test Credit Deduction
          </button>
        </div>
      </div>

      {/* Test Results */}
      {Object.keys(testResults).length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Test Results</h3>
          <div className="space-y-4">
            {Object.entries(testResults).map(([testType, result]: [string, any]) => (
              <div key={testType} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <h4 className="font-medium text-gray-900 dark:text-white capitalize">
                    {testType.replace('_', ' ')} Test
                  </h4>
                </div>
                <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {healthReport && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Recommendations</h3>
          <div className="space-y-2">
            {healthReport.recommendations.map((rec, index) => (
              <div key={index} className="flex items-center gap-2">
                {rec.startsWith('✅') ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                )}
                <span className="text-gray-900 dark:text-white">{rec.replace(/^[✅❌]\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
