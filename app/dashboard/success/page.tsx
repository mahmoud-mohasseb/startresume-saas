"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { toast } from 'react-hot-toast'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshSubscription } = useSubscription()

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const plan = searchParams.get('plan')
      const sessionId = searchParams.get('session_id')

      console.log('🎉 Payment success detected:', { plan, sessionId })

      if (plan) {
        toast.success(`🎉 Welcome to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`)
      }

      // Trigger global payment success event
      window.dispatchEvent(new CustomEvent('payment-success', { 
        detail: { plan, sessionId } 
      }))

      // Aggressive refresh sequence
      let attempts = 0
      const maxAttempts = 8
      
      while (attempts < maxAttempts) {
        attempts++
        console.log(`🔄 Post-payment refresh attempt ${attempts}/${maxAttempts}`)
        
        try {
          // DISABLED: Refresh to prevent reloading
          // await refreshSubscription()
          
          // Wait between attempts with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts))
          
          // Check if subscription is now active
          const response = await fetch('/api/user/credits')
          if (response.ok) {
            const data = await response.json()
            if (data.subscription?.remainingCredits > 0 && 
                data.subscription?.plan !== 'free') {
              console.log('✅ Active subscription detected!')
              toast.success('✅ All features unlocked! Redirecting to dashboard...')
              
              // Redirect to dashboard after success
              setTimeout(() => {
                router.push('/dashboard')
              }, 2000)
              return
            }
          }
        } catch (error) {
          console.error(`❌ Refresh attempt ${attempts} failed:`, error)
        }
      }

      // If still no success, try manual sync
      console.log('🔄 Attempting manual sync...')
      try {
        const syncResponse = await fetch('/api/sync-subscription', { method: 'POST' })
        if (syncResponse.ok) {
          toast.success('✅ Subscription synced! Redirecting...')
          setTimeout(() => router.push('/dashboard'), 2000)
        } else {
          toast.error('⚠️ Sync failed. Redirecting to dashboard...')
          setTimeout(() => router.push('/dashboard'), 3000)
        }
      } catch (syncError) {
        console.error('❌ Manual sync failed:', syncError)
        toast.error('⚠️ Please contact support if issues persist')
        setTimeout(() => router.push('/dashboard'), 3000)
      }
    }

    handlePaymentSuccess()
  }, [searchParams, refreshSubscription, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="text-2xl">🎉</div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          We're setting up your subscription and unlocking all features. This may take a few moments...
        </p>
        
        <div className="flex items-center justify-center space-x-2 mb-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Activating your subscription...
          </span>
        </div>
        
        <div className="text-xs text-gray-400 dark:text-gray-500">
          You'll be redirected to your dashboard automatically
        </div>
      </div>
    </div>
  )
}
