"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Check, Copy, Wand2, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { sanitizeSuggestions, safeString } from '@/lib/suggestion-utils'

interface AISuggestion {
  id: string
  type: 'summary' | 'experience' | 'skills' | 'achievement'
  content: string
  category: string
  icon: string
  confidence: number
  preview?: string
}

interface AISuggestionsProps {
  suggestions: AISuggestion[]
  onApplySuggestion: (suggestion: AISuggestion) => void
  selectedSuggestions: string[]
  isGenerating: boolean
  title?: string
  onRefresh?: () => void
  className?: string
}

export function AISuggestions({
  suggestions,
  onApplySuggestion,
  selectedSuggestions,
  isGenerating,
  title = "AI Suggestions",
  onRefresh,
  className = ""
}: AISuggestionsProps) {
  
  // Sanitize suggestions to prevent React child errors
  const safeSuggestions = React.useMemo(() => {
    console.log('🔍 Sanitizing suggestions:', suggestions?.length || 0)
    return sanitizeSuggestions(suggestions || [])
  }, [suggestions])
  
  const copyToClipboard = (content: string) => {
    const safeContent = safeString(content, 'No content to copy')
    navigator.clipboard.writeText(safeContent)
    toast.success('Copied to clipboard!')
  }

  const getConfidenceColor = (confidence: number) => {
    const safeConfidence = typeof confidence === 'number' ? confidence : 75
    if (safeConfidence >= 90) return 'text-green-600 bg-green-100'
    if (safeConfidence >= 75) return 'text-blue-600 bg-blue-100'
    if (safeConfidence >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  // Safety check - if suggestions is not an array or is empty, show fallback
  if (!Array.isArray(safeSuggestions) || safeSuggestions.length === 0) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center ${className}`}>
        <Wand2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {safeString(title, 'AI Suggestions')}
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          {isGenerating ? 'Generating suggestions...' : 'No suggestions available'}
        </p>
        {isGenerating && <Loader2 className="w-6 h-6 animate-spin mx-auto mt-3 text-blue-500" />}
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {safeString(title, 'AI Suggestions')}
          </h3>
          <span className="text-sm text-gray-500 bg-white dark:bg-gray-700 px-2 py-1 rounded-full">
            {safeSuggestions.length} suggestions
          </span>
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
          >
            <Wand2 className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Suggestions Grid */}
      <div className="grid gap-3">
        {safeSuggestions.map((suggestion, index) => {
          // Extra safety layer - ensure each suggestion is properly sanitized
          const suggestionId = safeString(suggestion?.id, `suggestion-${index}`)
          const suggestionContent = safeString(suggestion?.content, 'No content available')
          const suggestionCategory = safeString(suggestion?.category, 'General')
          const suggestionIcon = safeString(suggestion?.icon, '💡')
          const suggestionConfidence = typeof suggestion?.confidence === 'number' ? suggestion.confidence : 75
          const suggestionPreview = suggestion?.preview ? safeString(suggestion.preview) : null
          
          const isSelected = selectedSuggestions.includes(suggestionId)
          
          return (
            <div
              key={suggestionId}
              className={`group relative bg-white dark:bg-gray-800 rounded-lg p-4 border-2 transition-all cursor-pointer hover:shadow-md ${
                isSelected 
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                  : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
              }`}
              onClick={() => !isSelected && onApplySuggestion(suggestion)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{suggestionIcon}</span>
                  <div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                      {suggestionCategory}
                    </span>
                    <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(suggestionConfidence)}`}>
                      {suggestionConfidence}% match
                    </span>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-xs font-medium">Applied</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                {suggestionContent}
              </p>

              {/* Preview */}
              {suggestionPreview && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic mb-3">
                  💡 {suggestionPreview}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                {!isSelected ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onApplySuggestion(suggestion)
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply</span>
                  </button>
                ) : (
                  <span className="text-green-600 text-sm font-medium flex items-center space-x-1">
                    <Check className="w-4 h-4" />
                    <span>Applied</span>
                  </span>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    copyToClipboard(suggestionContent)
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Click any suggestion to apply it instantly. You can always edit the content later.
        </p>
      </div>
    </div>
  )
}
