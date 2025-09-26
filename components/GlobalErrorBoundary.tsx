"use client"

import React from 'react'
import { emergencyCleanup } from '@/lib/suggestion-utils'

interface GlobalErrorBoundaryProps {
  children: React.ReactNode
}

interface GlobalErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: any
}

export class GlobalErrorBoundary extends React.Component<
  GlobalErrorBoundaryProps,
  GlobalErrorBoundaryState
> {
  constructor(props: GlobalErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: any): GlobalErrorBoundaryState {
    console.error('🚨 Error Boundary Triggered:', error)
    return { hasError: true, error }
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('🚨 Global Error Caught:', error)
    console.error('🚨 Error Info:', errorInfo)
    console.error('🚨 Component Stack:', errorInfo?.componentStack)
    
    this.setState({ errorInfo })
    
    // Check if it's the React child object error
    if (error?.message?.includes('Objects are not valid as a React child')) {
      console.error('🚨 React Child Object Error Detected!')
      console.error('🚨 Error Stack:', error.stack)
      
      // Immediate cleanup
      this.clearAllSuggestionData()
      
      // Force reload after a short delay
      setTimeout(() => {
        console.log('🔄 Reloading page to clear corrupted state...')
        window.location.reload()
      }, 2000)
    }
  }

  clearAllSuggestionData = () => {
    try {
      console.log('🧹 Starting comprehensive state cleanup...')
      
      if (typeof window !== 'undefined') {
        // Clear storage
        const storageKeys = [
          'aiSuggestions',
          'selectedSuggestions',
          'suggestions',
          'resumeData',
          'suggestionState'
        ]
        
        storageKeys.forEach(key => {
          try {
            sessionStorage.removeItem(key)
            localStorage.removeItem(key)
          } catch (e) {
            console.log(`Cleared ${key}`)
          }
        })
        
        // Clear global variables
        const globalKeys = [
          'aiSuggestions',
          'selectedSuggestions',
          'suggestions',
          'suggestionData'
        ]
        
        globalKeys.forEach(key => {
          if ((window as any)[key]) {
            delete (window as any)[key]
          }
        })
        
        // Clear any React DevTools data
        if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
          try {
            (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = null
          } catch (e) {
            console.log('DevTools cleanup completed')
          }
        }
      }
      
      console.log('✅ State cleanup completed')
    } catch (e) {
      console.log('State cleanup finished')
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-lg">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Error</h1>
            <p className="text-gray-600 mb-6">
              We encountered a technical issue while loading the page. The page will reload automatically in a few seconds to fix this.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-semibold text-gray-800 mb-2">Debug Information:</h3>
                <p className="text-sm text-gray-600 font-mono">
                  {this.state.error?.message}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700">Component Stack</summary>
                    <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Reload Page Now
              </button>
              <button
                onClick={() => {
                  emergencyCleanup()
                  window.location.href = '/'
                }}
                className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Go to Home Page
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              If this error persists, please try clearing your browser cache.
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
