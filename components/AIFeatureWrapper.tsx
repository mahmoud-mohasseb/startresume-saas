"use client"

import React, { useEffect } from 'react'

interface AIFeatureWrapperProps {
  children: React.ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
}

export function AIFeatureWrapper({ children, onSubmit, className = "" }: AIFeatureWrapperProps) {
  useEffect(() => {
    // Prevent any accidental form submissions that might cause page refresh
    const handleFormSubmit = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'FORM' && !target.hasAttribute('data-ai-form')) {
        console.log('⚠️ Preventing default form submission to avoid page refresh')
        e.preventDefault()
      }
    }

    // Prevent Enter key from submitting forms accidentally
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' && target.getAttribute('type') !== 'submit') {
          // Only prevent if it's a regular input, not a submit button
          const form = target.closest('form')
          if (form && !form.hasAttribute('data-ai-form')) {
            console.log('⚠️ Preventing Enter key form submission')
            e.preventDefault()
          }
        }
      }
    }

    document.addEventListener('submit', handleFormSubmit)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('submit', handleFormSubmit)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🚀 AI Feature form submitted properly (no page refresh)')
    
    if (onSubmit) {
      onSubmit(e)
    }
  }

  return (
    <div className={`ai-feature-wrapper ${className}`}>
      <form data-ai-form onSubmit={handleSubmit}>
        {children}
      </form>
    </div>
  )
}

// Hook for AI feature forms
export function useAIFeatureForm() {
  const handleSubmit = (callback: () => void | Promise<void>) => {
    return async (e: React.FormEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
      console.log('🚀 AI Feature action triggered')
      
      try {
        await callback()
      } catch (error) {
        console.error('❌ AI Feature error:', error)
      }
    }
  }

  const handleKeyDown = (callback: () => void | Promise<void>) => {
    return (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        console.log('🚀 AI Feature keyboard shortcut triggered')
        callback()
      }
    }
  }

  return { handleSubmit, handleKeyDown }
}
