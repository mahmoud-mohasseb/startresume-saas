'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export function DebugSubscription() {
  const { user } = useUser()
  const [debugData, setDebugData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-subscription')
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error('Error checking subscription:', error)
      setDebugData({ error: 'Failed to check subscription' })
    } finally {
      setLoading(false)
    }
  }

  const createTestSubscription = async (plan: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create_test_subscription', plan }),
      })
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error('Error creating test subscription:', error)
      setDebugData({ error: 'Failed to create test subscription' })
    } finally {
      setLoading(false)
    }
  }

  const refreshCredits = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'refresh_credits' }),
      })
      const data = await response.json()
      setDebugData(data)
    } catch (error) {
      console.error('Error refreshing credits:', error)
      setDebugData({ error: 'Failed to refresh credits' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return <div>Please log in to debug subscription</div>
  }

  return (
    <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-900">
      <h3 className="text-lg font-semibold mb-4">Debug Subscription</h3>
      
      <div className="space-y-2 mb-4">
        <Button onClick={checkSubscription} disabled={loading}>
          Check Subscription Status
        </Button>
        
        <div className="flex gap-2">
          <Button onClick={() => createTestSubscription('basic')} disabled={loading} variant="outline">
            Create Test Basic
          </Button>
          <Button onClick={() => createTestSubscription('standard')} disabled={loading} variant="outline">
            Create Test Standard
          </Button>
          <Button onClick={() => createTestSubscription('pro')} disabled={loading} variant="outline">
            Create Test Pro
          </Button>
        </div>
        
        <Button onClick={refreshCredits} disabled={loading} variant="outline">
          Refresh Credits
        </Button>
      </div>

      {debugData && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Debug Data:</h4>
          <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
