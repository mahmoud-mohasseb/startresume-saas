"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, X, Check, Settings } from 'lucide-react'
import { setCookie, getCookie } from '@/lib/cookies'

interface CookieConsentProps {
  className?: string
}

export function CookieConsent({ className = '' }: CookieConsentProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: true,
    marketing: false,
    personalization: true
  })

  useEffect(() => {
    // Check if user has already given consent
    const consent = getCookie('cookie_consent')
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const consentData = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
      timestamp: new Date().toISOString()
    }
    
    setCookie('cookie_consent', JSON.stringify(consentData), {
      expires: 365, // 1 year
      path: '/',
      sameSite: 'lax'
    })
    
    setShowBanner(false)
    
    // Initialize analytics and other services based on consent
    initializeServices(consentData)
  }

  const handleAcceptSelected = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString()
    }
    
    setCookie('cookie_consent', JSON.stringify(consentData), {
      expires: 365,
      path: '/',
      sameSite: 'lax'
    })
    
    setShowBanner(false)
    setShowSettings(false)
    
    initializeServices(consentData)
  }

  const handleRejectAll = () => {
    const consentData = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
      timestamp: new Date().toISOString()
    }
    
    setCookie('cookie_consent', JSON.stringify(consentData), {
      expires: 365,
      path: '/',
      sameSite: 'lax'
    })
    
    setShowBanner(false)
    initializeServices(consentData)
  }

  const initializeServices = (consent: any) => {
    // Initialize analytics if consented
    if (consent.analytics && typeof window !== 'undefined') {
      // Initialize Google Analytics, Mixpanel, etc.
      console.log('Analytics initialized')
    }
    
    // Initialize marketing tools if consented
    if (consent.marketing && typeof window !== 'undefined') {
      // Initialize marketing pixels, etc.
      console.log('Marketing tools initialized')
    }
    
    // Initialize personalization if consented
    if (consent.personalization && typeof window !== 'undefined') {
      // Initialize personalization features
      console.log('Personalization initialized')
    }
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 ${className}`}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        />

        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 shadow-2xl"
        >
          <div className="max-w-7xl mx-auto p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Cookie className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  We value your privacy
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                  We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                  By clicking "Accept All", you consent to our use of cookies. You can manage your preferences or 
                  learn more in our{' '}
                  <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Privacy Policy
                  </a>.
                </p>
                
                {!showSettings && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Accept All
                    </button>
                    
                    <button
                      onClick={handleRejectAll}
                      className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                    >
                      Reject All
                    </button>
                    
                    <button
                      onClick={() => setShowSettings(true)}
                      className="flex items-center gap-2 px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Customize
                    </button>
                  </div>
                )}

                {/* Settings Panel */}
                {showSettings && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Necessary Cookies */}
                      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <input
                          type="checkbox"
                          checked={preferences.necessary}
                          disabled
                          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Necessary Cookies
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Required for the website to function properly. Cannot be disabled.
                          </p>
                        </div>
                      </div>

                      {/* Analytics Cookies */}
                      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <input
                          type="checkbox"
                          checked={preferences.analytics}
                          onChange={(e) => setPreferences(prev => ({ ...prev, analytics: e.target.checked }))}
                          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Analytics Cookies
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Help us understand how visitors interact with our website.
                          </p>
                        </div>
                      </div>

                      {/* Marketing Cookies */}
                      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <input
                          type="checkbox"
                          checked={preferences.marketing}
                          onChange={(e) => setPreferences(prev => ({ ...prev, marketing: e.target.checked }))}
                          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Marketing Cookies
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Used to deliver personalized advertisements and track campaign performance.
                          </p>
                        </div>
                      </div>

                      {/* Personalization Cookies */}
                      <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <input
                          type="checkbox"
                          checked={preferences.personalization}
                          onChange={(e) => setPreferences(prev => ({ ...prev, personalization: e.target.checked }))}
                          className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Personalization Cookies
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            Remember your preferences and provide customized content.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={handleAcceptSelected}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Save Preferences
                      </button>
                      
                      <button
                        onClick={() => setShowSettings(false)}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
