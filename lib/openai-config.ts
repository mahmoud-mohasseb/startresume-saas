// OpenAI Cost Optimization Configuration
export const OPENAI_CONFIG = {
  // Model selection (GPT-3.5-turbo is 10x cheaper than GPT-4)
  MODEL: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
  
  // Token limits to control costs
  MAX_TOKENS: {
    RESUME_GENERATION: 2500,    // Reduced from 3500 (30% savings)
    SUGGESTIONS: 500,           // For AI suggestions
    COVER_LETTER: 1500,         // For cover letters
    MOCK_INTERVIEW: 800,        // For interview questions
  },
  
  // Temperature settings for consistent output
  TEMPERATURE: {
    RESUME: 0.3,               // Lower = more focused, less creative
    SUGGESTIONS: 0.2,          // Very focused for suggestions
    COVER_LETTER: 0.4,         // Slightly more creative
    MOCK_INTERVIEW: 0.5,       // More varied questions
  },
  
  // Rate limiting
  RATE_LIMITS: {
    RESUME_GENERATION: 10,     // Per hour per user
    SUGGESTIONS: 50,           // Per hour per user (cheaper operation)
    COVER_LETTER: 5,           // Per hour per user
    MOCK_INTERVIEW: 20,        // Per hour per user
  },
  
  // Caching settings
  CACHE_DURATION: {
    RESUME: 24 * 60 * 60 * 1000,      // 24 hours
    SUGGESTIONS: 60 * 60 * 1000,       // 1 hour
    TEMPLATES: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  
  // Cost tracking (GPT-3.5-turbo pricing)
  COSTS: {
    INPUT_PER_1K_TOKENS: 0.0015,
    OUTPUT_PER_1K_TOKENS: 0.002,
  },
  
  // Feature flags for cost control
  FEATURES: {
    ENABLE_CACHING: true,
    ENABLE_RATE_LIMITING: true,
    ENABLE_COST_TRACKING: true,
    ENABLE_TEMPLATE_REUSE: true,
  }
}

// Cost-optimized system prompts (shorter = cheaper)
export const SYSTEM_PROMPTS = {
  RESUME: `Professional resume designer. Create clean HTML with CSS. ATS-compatible. No explanatory text.`,
  
  SUGGESTIONS: `Provide brief, relevant suggestions. No explanations.`,
  
  COVER_LETTER: `Write professional cover letters. Concise and targeted.`,
  
  MOCK_INTERVIEW: `Generate relevant interview questions. Brief responses only.`
}

// Utility functions
export function getOptimizedConfig(feature: keyof typeof OPENAI_CONFIG.MAX_TOKENS) {
  return {
    model: OPENAI_CONFIG.MODEL,
    max_tokens: OPENAI_CONFIG.MAX_TOKENS[feature],
    temperature: OPENAI_CONFIG.TEMPERATURE[feature.toLowerCase() as keyof typeof OPENAI_CONFIG.TEMPERATURE] || 0.3,
  }
}

export function estimateCost(inputTokens: number, outputTokens: number): number {
  const inputCost = (inputTokens / 1000) * OPENAI_CONFIG.COSTS.INPUT_PER_1K_TOKENS
  const outputCost = (outputTokens / 1000) * OPENAI_CONFIG.COSTS.OUTPUT_PER_1K_TOKENS
  return inputCost + outputCost
}
