'use client'

import React from 'react'
import SystemHealthDashboard from '@/components/SystemHealthDashboard'

export default function SystemHealthPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            System Health Monitor
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor and test all system components including resume generation, LinkedIn optimization, credit deduction, and page stability.
          </p>
        </div>
        
        <SystemHealthDashboard />
      </div>
    </div>
  )
}
