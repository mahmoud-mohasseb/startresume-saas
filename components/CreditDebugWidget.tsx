'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { getUserCredits, checkAndConsumeStripeDirectCredits } from '@/lib/credit-bypass'
import { Bug, CreditCard, Minus, Plus, RefreshCw } from 'lucide-react'

export default function CreditDebugWidget() {
  const { user } = useUser()
  const [credits, setCredits] = useState<number>(50)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const updateCredits = () => {
    if (user) {
      const currentCredits = getUserCredits(user.id)
      setCredits(currentCredits)
      
      // Check localStorage
      const stored = localStorage.getItem(`credits_${user.id}`)
      setDebugInfo({
        userId: user.id,
        currentCredits,
        localStorage: stored,
        timestamp: new Date().toISOString()
      })
    }
  }

  useEffect(() => {
    if (user) {
      updateCredits()
      
      // Listen for credit updates
      const handleCreditUpdate = () => {
        updateCredits()
      }

      window.addEventListener('credits-updated', handleCreditUpdate)
      window.addEventListener('storage', handleCreditUpdate)

      return () => {
        window.removeEventListener('credits-updated', handleCreditUpdate)
        window.removeEventListener('storage', handleCreditUpdate)
      }
    }
  }, [user])

  const testCreditDeduction = async (amount: number) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug-credits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'debug_test', amount })
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('🧪 Debug test result:', result)
        updateCredits()
      }
    } catch (error) {
      console.error('Debug test failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchServerDebugInfo = async () => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const response = await fetch('/api/debug-credits')
      if (response.ok) {
        const result = await response.json()
        console.log('🔍 Server debug info:', result)
        setDebugInfo(prev => ({ ...prev, server: result }))
      }
    } catch (error) {
      console.error('Failed to fetch server debug info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <button
          onClick={() => setIsVisible(true)}
          className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700"
        >
          <Bug className="w-4 h-4" />
          Debug Credits
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bug className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Credit Debug</h3>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>

          {/* Current Credits */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900 dark:text-blue-100">Current Credits</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{credits}</div>
          </div>

          {/* Test Buttons */}
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Test Credit Deduction:</div>
            <div className="flex gap-2">
              <button
                onClick={() => testCreditDeduction(1)}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
                -1
              </button>
              <button
                onClick={() => testCreditDeduction(3)}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
              >
                <Minus className="w-3 h-3" />
                -3
              </button>
              <button
                onClick={fetchServerDebugInfo}
                disabled={isLoading}
                className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                Server Info
              </button>
            </div>
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <div className="text-xs">
              <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Debug Info:</div>
              <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-800 dark:text-gray-200 overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
