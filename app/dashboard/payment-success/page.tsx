"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { CheckCircle, CreditCard, Sparkles, ArrowRight } from 'lucide-react'
import { dispatchPaymentSuccess, dispatchSubscriptionUpdate } from '@/utils/eventDispatcher'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useUser()
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    // Dispatch events to update subscription state
    dispatchPaymentSuccess()
    dispatchSubscriptionUpdate()
    
    // Also dispatch the legacy event for backward compatibility
    window.dispatchEvent(new CustomEvent('credits-updated'))
    window.dispatchEvent(new CustomEvent('payment-success'))
    window.dispatchEvent(new CustomEvent('subscription-updated'))

    // Force immediate credit refresh
    const forceRefresh = async () => {
      try {
        const response = await fetch('/api/user/credits?force=true&t=' + Date.now(), {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })
        if (response.ok) {
          console.log('✅ Credits refreshed after payment success')
        }
      } catch (error) {
        console.error('Error refreshing credits:', error)
      }
    }

    // Immediate refresh
    forceRefresh()

    // Aggressive polling for 30 seconds to ensure credits are updated
    const pollInterval = setInterval(forceRefresh, 2000)
    
    // Simulate processing time for better UX
    const timer = setTimeout(() => {
      setIsProcessing(false)
      clearInterval(pollInterval) // Stop aggressive polling
    }, 10000) // Process for 10 seconds

    return () => {
      clearTimeout(timer)
      clearInterval(pollInterval)
    }
  }, [])

  const sessionId = searchParams.get('session_id')
  const planName = searchParams.get('plan') || 'Premium'

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center"
      >
        {isProcessing ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-8 h-8 text-green-600 dark:text-green-400" />
              </motion.div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Processing Payment...
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                We're setting up your account with the new features.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            </motion.div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Payment Successful! 🎉
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Welcome to {planName} Plan
              </p>
            </div>

            {/* Plan Details */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
                <CreditCard className="w-5 h-5" />
                <span className="font-semibold">Your subscription is now active</span>
              </div>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>✅ Full access to all AI features</p>
                <p>✅ Unlimited resume generations</p>
                <p>✅ Advanced templates and customization</p>
                <p>✅ Priority customer support</p>
              </div>
            </div>

            {/* Session ID (for debugging) */}
            {sessionId && (
              <div className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                Session ID: {sessionId.substring(0, 20)}...
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/dashboard')}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>

              <button
                onClick={() => router.push('/dashboard/create')}
                className="w-full text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200"
              >
                Start Creating Your Resume →
              </button>
            </div>

            {/* Thank You Message */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Thank you for choosing StartResume.io! 
                {user?.firstName && ` Welcome aboard, ${user.firstName}!`}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
