'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw } from 'lucide-react'

interface TestResult {
  step: string
  status: 'success' | 'error' | 'warning'
  message: string
  data?: any
}

interface TestSummary {
  total: number
  success: number
  errors: number
  warnings: number
}

export function PaymentFlowTester() {
  const { user } = useUser()
  const [results, setResults] = useState<TestResult[]>([])
  const [summary, setSummary] = useState<TestSummary | null>(null)
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [healthData, setHealthData] = useState<any>(null)

  const runFullTest = async (plan: string = 'basic') => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-payment-flow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, action: 'full_test' }),
      })
      
      const data = await response.json()
      setResults(data.results || [])
      setSummary(data.summary || null)
      setRecommendations(data.recommendations || [])
    } catch (error) {
      console.error('Error running test:', error)
      setResults([{
        step: 'Test Execution',
        status: 'error',
        message: 'Failed to run test: ' + error
      }])
    } finally {
      setLoading(false)
    }
  }

  const checkHealth = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-payment-flow')
      const data = await response.json()
      setHealthData(data)
    } catch (error) {
      console.error('Error checking health:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default: return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary'
    } as const
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Flow Tester</CardTitle>
          <CardDescription>Please log in to test the payment flow</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Payment Flow Tester
          </CardTitle>
          <CardDescription>
            Test your Stripe payment integration and subscription flow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={() => runFullTest('basic')} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Test Basic Plan
            </Button>
            <Button 
              onClick={() => runFullTest('standard')} 
              disabled={loading}
              variant="outline"
            >
              Test Standard Plan
            </Button>
            <Button 
              onClick={() => runFullTest('pro')} 
              disabled={loading}
              variant="outline"
            >
              Test Pro Plan
            </Button>
            <Button 
              onClick={checkHealth} 
              disabled={loading}
              variant="secondary"
            >
              Health Check
            </Button>
          </div>

          {summary && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-2">Test Summary</h4>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">✅ {summary.success} passed</span>
                <span className="text-red-600">❌ {summary.errors} failed</span>
                <span className="text-yellow-600">⚠️ {summary.warnings} warnings</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.step}</span>
                      {getStatusBadge(result.status)}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {result.message}
                    </p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          View data
                        </summary>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, index) => (
                <li key={index} className="text-sm">
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {healthData && (
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">User</h4>
                <p className="text-sm text-gray-600">
                  {healthData.user?.email} ({healthData.user?.id})
                </p>
              </div>
              <div>
                <h4 className="font-medium">Database</h4>
                <p className="text-sm text-gray-600">
                  Subscription: {healthData.database?.hasSubscription ? '✅ Found' : '❌ None'}
                </p>
              </div>
              <div>
                <h4 className="font-medium">Stripe</h4>
                <p className="text-sm text-gray-600">
                  Status: {healthData.stripe?.isActive ? '✅ Active' : '❌ Inactive'} | 
                  Plan: {healthData.stripe?.plan} | 
                  Credits: {healthData.stripe?.remainingCredits}/{healthData.stripe?.credits}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
