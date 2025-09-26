interface AISuggestion {
  id: string
  type: 'summary' | 'experience' | 'skills' | 'achievement'
  content: string
  category: string
  icon: string
  confidence: number
  preview?: string
}

/**
 * Safely converts any value to a string, preventing React child errors
 */
export function safeString(value: any, fallback: string = ''): string {
  if (value === null || value === undefined) {
    return fallback
  }
  
  if (typeof value === 'string') {
    return value
  }
  
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  
  if (typeof value === 'object') {
    // If it's an object, don't try to render it directly
    console.warn(' Object passed to safeString, using fallback:', value)
    return fallback
  }
  
  try {
    return String(value)
  } catch (error) {
    console.error(' Error converting value to string:', error)
    return fallback
  }
}

/**
 * Sanitizes a single AI suggestion object to ensure all properties are safe for React rendering
 */
export function sanitizeSuggestion(suggestion: any): AISuggestion | null {
  try {
    // Check if the suggestion is a valid object
    if (!suggestion || typeof suggestion !== 'object') {
      console.warn(' Invalid suggestion object:', suggestion)
      return null
    }
    
    // Validate required properties
    if (!suggestion.id || !suggestion.content || !suggestion.category || !suggestion.type) {
      console.warn(' Missing required properties in suggestion:', suggestion)
      return null
    }
    
    // Sanitize all properties
    const sanitized: AISuggestion = {
      id: safeString(suggestion.id, `suggestion-${Date.now()}`),
      type: safeString(suggestion.type, 'general') as AISuggestion['type'],
      content: safeString(suggestion.content, 'No content available'),
      category: safeString(suggestion.category, 'General'),
      icon: safeString(suggestion.icon, ''),
      confidence: typeof suggestion.confidence === 'number' && suggestion.confidence >= 0 && suggestion.confidence <= 100 
        ? suggestion.confidence 
        : 75,
      preview: suggestion.preview ? safeString(suggestion.preview) : undefined
    }
    
    // Validate the type field
    const validTypes = ['summary', 'experience', 'skills', 'achievement']
    if (!validTypes.includes(sanitized.type)) {
      sanitized.type = 'general' as AISuggestion['type']
    }
    
    return sanitized
  } catch (error) {
    console.error(' Error sanitizing suggestion:', error)
    return null
  }
}

/**
 * Sanitizes an array of AI suggestions, filtering out invalid ones
 */
export function sanitizeSuggestions(suggestions: any[]): AISuggestion[] {
  if (!Array.isArray(suggestions)) {
    console.warn(' Suggestions is not an array:', suggestions)
    return []
  }
  
  const sanitized = suggestions
    .map(sanitizeSuggestion)
    .filter((suggestion): suggestion is AISuggestion => suggestion !== null)
  
  console.log(` Sanitized ${sanitized.length} out of ${suggestions.length} suggestions`)
  return sanitized
}

/**
 * Clears all suggestion-related data from storage and global variables
 */
export function clearSuggestionState() {
  try {
    if (typeof window !== 'undefined') {
      // Clear from localStorage
      const localStorageKeys = [
        'aiSuggestions',
        'selectedSuggestions',
        'suggestions',
        'resumeData',
        'suggestionState',
        'suggestionCache'
      ]
      
      localStorageKeys.forEach(key => {
        try {
          localStorage.removeItem(key)
        } catch (e) {
          // Silent fail for localStorage access issues
        }
      })
      
      // Clear from sessionStorage
      const sessionStorageKeys = [
        'aiSuggestions',
        'selectedSuggestions',
        'suggestions',
        'currentSuggestions',
        'suggestionState'
      ]
      
      sessionStorageKeys.forEach(key => {
        try {
          sessionStorage.removeItem(key)
        } catch (e) {
          // Silent fail for sessionStorage access issues
        }
      })
      
      // Clear global variables
      const globalKeys = [
        'aiSuggestions',
        'selectedSuggestions',
        'suggestions',
        'suggestionData',
        'currentSuggestions'
      ]
      
      globalKeys.forEach(key => {
        if ((window as any)[key]) {
          delete (window as any)[key]
        }
      })
      
      console.log(' Suggestion state cleared successfully')
    }
  } catch (error) {
    console.error(' Error clearing suggestion state:', error)
  }
}

/**
 * Validates that a suggestion object is safe for React rendering
 */
export function isValidSuggestion(suggestion: any): suggestion is AISuggestion {
  return (
    suggestion &&
    typeof suggestion === 'object' &&
    typeof suggestion.id === 'string' &&
    typeof suggestion.content === 'string' &&
    typeof suggestion.category === 'string' &&
    typeof suggestion.type === 'string' &&
    (typeof suggestion.icon === 'string' || suggestion.icon === undefined) &&
    (typeof suggestion.confidence === 'number' || suggestion.confidence === undefined) &&
    (typeof suggestion.preview === 'string' || suggestion.preview === undefined)
  )
}

/**
 * Deep clones and sanitizes suggestion data to prevent reference issues
 */
export function deepSanitizeSuggestions(suggestions: any): AISuggestion[] {
  try {
    // First, try to deep clone the data to avoid reference issues
    const cloned = JSON.parse(JSON.stringify(suggestions))
    return sanitizeSuggestions(Array.isArray(cloned) ? cloned : [])
  } catch (error) {
    console.error(' Error deep cloning suggestions:', error)
    return sanitizeSuggestions(Array.isArray(suggestions) ? suggestions : [])
  }
}

/**
 * Emergency cleanup function for React child errors
 */
export function emergencyCleanup() {
  try {
    clearSuggestionState()
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc()
    }
    
    // Clear any React DevTools data that might be corrupted
    if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      try {
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = null
        (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = null
      } catch (e) {
        // Silent fail
      }
    }
    
    console.log(' Emergency cleanup completed')
  } catch (error) {
    console.error(' Error during emergency cleanup:', error)
  }
}