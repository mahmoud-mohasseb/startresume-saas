'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { getUserCredits } from '@/lib/credit-bypass'
import { CreditCard } from 'lucide-react'

export default function SimpleCreditDisplay() {
  const { user } = useUser()
  const [credits, setCredits] = useState<number>(50)

  useEffect(() => {
    if (user) {
      const updateCredits = () => {
        const currentCredits = getUserCredits(user.id)
        setCredits(currentCredits)
      }

      // Initial load
      updateCredits()

      // Listen for storage changes (when credits are updated in other tabs/components)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key?.startsWith(`credits_${user.id}`)) {
          updateCredits()
        }
      }

      // Listen for custom credit update events
      const handleCreditUpdate = () => {
        updateCredits()
      }

      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('credits-updated', handleCreditUpdate)

      // Minimal polling (every 5 seconds) to catch any missed updates
      const interval = setInterval(updateCredits, 5000)

      return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('credits-updated', handleCreditUpdate)
        clearInterval(interval)
      }
    }
  }, [user])

  if (!user) return null

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
      <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
        {credits} Credits
      </span>
      <span className="text-xs text-blue-600 dark:text-blue-400">
        Standard Plan
      </span>
    </div>
  )
}
