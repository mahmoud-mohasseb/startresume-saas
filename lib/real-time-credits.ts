import { useState, useEffect } from 'react'

// Real-time credit update system
export class RealTimeCreditUpdater {
  private static instance: RealTimeCreditUpdater
  private listeners: Set<(credits: any) => void> = new Set()
  private pollInterval: NodeJS.Timeout | null = null
  private lastKnownCredits: any = null

  static getInstance(): RealTimeCreditUpdater {
    if (!RealTimeCreditUpdater.instance) {
      RealTimeCreditUpdater.instance = new RealTimeCreditUpdater()
    }
    return RealTimeCreditUpdater.instance
  }

  // Subscribe to credit updates
  subscribe(callback: (credits: any) => void): () => void {
    this.listeners.add(callback)
    
    // Start polling if this is the first listener
    if (this.listeners.size === 1) {
      this.startPolling()
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
      if (this.listeners.size === 0) {
        this.stopPolling()
      }
    }
  }

  // Notify all listeners of credit update
  private notifyListeners(credits: any) {
    this.listeners.forEach(callback => {
      try {
        callback(credits)
      } catch (error) {
        console.error('Error in credit update listener:', error)
      }
    })
  }

  // Start polling for credit updates
  private startPolling() {
    if (this.pollInterval) return

    this.pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/user/credits?t=' + Date.now(), {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        })

        if (response.ok) {
          const credits = await response.json()
          
          // Only notify if credits have changed
          if (JSON.stringify(credits) !== JSON.stringify(this.lastKnownCredits)) {
            this.lastKnownCredits = credits
            this.notifyListeners(credits)
          }
        }
      } catch (error) {
        console.error('Error polling for credit updates:', error)
      }
    }, 60000) // Poll every 60 seconds (much less aggressive)
  }

  // Stop polling
  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
  }

  // Force immediate credit refresh
  async forceRefresh(): Promise<any> {
    try {
      const response = await fetch('/api/user/credits?force=true&t=' + Date.now(), {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })

      if (response.ok) {
        const credits = await response.json()
        this.lastKnownCredits = credits
        this.notifyListeners(credits)
        return credits
      }
    } catch (error) {
      console.error('Error force refreshing credits:', error)
    }
    return null
  }

  // Trigger immediate update (called from payment success)
  triggerUpdate() {
    this.forceRefresh()
  }
}

// Global instance
export const creditUpdater = RealTimeCreditUpdater.getInstance()

// Hook for React components
export function useRealTimeCredits() {
  const [credits, setCredits] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = creditUpdater.subscribe((newCredits) => {
      setCredits(newCredits)
      setIsLoading(false)
    })

    // Initial load
    creditUpdater.forceRefresh().then(() => {
      setIsLoading(false)
    })

    return unsubscribe
  }, [])

  return { credits, isLoading, forceRefresh: () => creditUpdater.forceRefresh() }
}

// Listen for payment success events
if (typeof window !== 'undefined') {
  window.addEventListener('payment-success', () => {
    creditUpdater.triggerUpdate()
  })

  window.addEventListener('credits-updated', () => {
    creditUpdater.triggerUpdate()
  })
}
