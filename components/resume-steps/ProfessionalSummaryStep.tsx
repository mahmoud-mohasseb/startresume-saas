"use client"

import React, { useEffect, useMemo } from 'react'
import { StepWrapper } from './StepWrapper'
import { AISuggestions } from './AISuggestions'
import { Target, Wand2 } from 'lucide-react'
import { sanitizeSuggestions, safeString } from '@/lib/suggestion-utils'

interface ResumeInputs {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  summary: string
  experience: any[]
  education: any[]
  skills: string[]
  certifications: any[]
  projects: any[]
  languages: any[]
  achievements: string[]
}

interface AISuggestion {
  id: string
  type: 'summary' | 'experience' | 'skills' | 'achievement'
  content: string
  category: string
  icon: string
  confidence: number
  preview?: string
}

interface ProfessionalSummaryStepProps {
  resumeInputs: ResumeInputs
  setResumeInputs: React.Dispatch<React.SetStateAction<ResumeInputs>>
  aiSuggestions: AISuggestion[]
  onApplySuggestion: (suggestion: AISuggestion) => void
  isGenerating: boolean
  selectedSuggestions: string[]
}

export function ProfessionalSummaryStep({
  resumeInputs,
  setResumeInputs,
  aiSuggestions,
  onApplySuggestion,
  isGenerating,
  selectedSuggestions
}: ProfessionalSummaryStepProps) {
  
  const handleSummaryChange = (value: string) => {
    setResumeInputs(prev => ({ ...prev, summary: value }))
  }

  // Generate smart suggestions based on user's title and experience
  const generateSmartSuggestions = (): AISuggestion[] => {
    const title = resumeInputs.title.toLowerCase()
    const name = resumeInputs.name
    const experienceCount = resumeInputs.experience.length
    
    const suggestions: AISuggestion[] = []

    // Results-Focused Summary
    suggestions.push({
      id: 'summary-results',
      type: 'summary',
      content: `Results-driven ${resumeInputs.title || 'professional'} with ${experienceCount > 0 ? '5+' : '3+'} years of experience delivering high-impact solutions and driving business growth. Proven track record of exceeding targets through innovative strategies and data-driven decision making.`,
      category: 'Results-Focused',
      icon: '🎯',
      confidence: 92,
      preview: 'Emphasizes achievements and business impact'
    })

    // Leadership-Focused Summary
    suggestions.push({
      id: 'summary-leadership',
      type: 'summary',
      content: `Dynamic ${resumeInputs.title || 'professional'} with proven leadership capabilities and expertise in building high-performing teams. Skilled at driving organizational change, fostering collaboration, and delivering strategic initiatives that align with business objectives.`,
      category: 'Leadership',
      icon: '👥',
      confidence: 88,
      preview: 'Highlights leadership and team collaboration'
    })

    // Technical/Skills-Focused Summary
    if (title.includes('engineer') || title.includes('developer') || title.includes('technical')) {
      suggestions.push({
        id: 'summary-technical',
        type: 'summary',
        content: `Innovative ${resumeInputs.title} with deep expertise in modern technologies and software development practices. Passionate about creating scalable solutions, optimizing performance, and staying current with emerging technologies and industry best practices.`,
        category: 'Technical Excellence',
        icon: '💻',
        confidence: 95,
        preview: 'Perfect for technical roles and engineering positions'
      })
    }

    // Strategic Summary
    suggestions.push({
      id: 'summary-strategic',
      type: 'summary',
      content: `Strategic ${resumeInputs.title || 'professional'} with expertise in analyzing complex business challenges and developing comprehensive solutions. Committed to continuous improvement, innovation, and driving sustainable growth through strategic planning and execution.`,
      category: 'Strategic',
      icon: '🚀',
      confidence: 85,
      preview: 'Emphasizes strategic thinking and growth mindset'
    })

    // Achievement-Focused Summary
    suggestions.push({
      id: 'summary-achievement',
      type: 'summary',
      content: `Accomplished ${resumeInputs.title || 'professional'} with a strong track record of exceeding performance goals and delivering exceptional results. Dedicated to excellence, with proven ability to manage complex projects and drive organizational success.`,
      category: 'Achievement-Focused',
      icon: '🏆',
      confidence: 90,
      preview: 'Highlights accomplishments and dedication to excellence'
    })

    return suggestions
  }

  const smartSuggestions = generateSmartSuggestions()
  const allSuggestions = [...aiSuggestions, ...smartSuggestions]
  
  // Validate suggestions to prevent React child object errors
  const validatedSuggestions = allSuggestions.filter((suggestion, index) => {
    const isValid = suggestion && 
      typeof suggestion === 'object' &&
      typeof suggestion.id === 'string' &&
      typeof suggestion.content === 'string' &&
      typeof suggestion.category === 'string' &&
      typeof suggestion.type === 'string'
    
    if (!isValid) {
      console.error('🚨 Invalid suggestion in ProfessionalSummaryStep at index', index, '- ID:', suggestion?.id || 'no-id')
    }
    
    return isValid
  })

  return (
    <StepWrapper
      title="Professional Summary"
      description="Create a compelling summary that showcases your value proposition"
      icon={Target}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Summary Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Professional Summary *
            </label>
            <textarea
              value={resumeInputs.summary}
              onChange={(e) => handleSummaryChange(e.target.value)}
              placeholder="Write a compelling summary that highlights your key strengths, experience, and value proposition..."
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
              required
            />
          </div>

          {/* Character Count */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {resumeInputs.summary.length} characters
            </span>
            <span className={`font-medium ${
              resumeInputs.summary.length >= 100 && resumeInputs.summary.length <= 300
                ? 'text-green-600'
                : resumeInputs.summary.length > 300
                  ? 'text-yellow-600'
                  : 'text-gray-500'
            }`}>
              {resumeInputs.summary.length >= 100 && resumeInputs.summary.length <= 300
                ? 'Perfect length!'
                : resumeInputs.summary.length > 300
                  ? 'Consider shortening'
                  : 'Add more detail'}
            </span>
          </div>

          {/* Writing Tips */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              💡 Writing Tips
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Start with your professional title and years of experience</li>
              <li>• Highlight 2-3 key achievements or strengths</li>
              <li>• Include relevant skills and technologies</li>
              <li>• Keep it concise (100-300 characters is ideal)</li>
              <li>• Use action words and quantify results when possible</li>
            </ul>
          </div>
        </div>

        {/* AI Suggestions */}
        <div>
          <AISuggestions
            suggestions={validatedSuggestions}
            onApplySuggestion={onApplySuggestion}
            selectedSuggestions={selectedSuggestions}
            isGenerating={isGenerating}
            title="Professional Summary Suggestions"
            className="h-fit"
          />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              resumeInputs.summary.length >= 50 ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {resumeInputs.summary.length >= 50 
                ? 'Summary looks good!' 
                : 'Add a professional summary to continue'}
            </span>
          </div>
          {resumeInputs.summary.length >= 50 && (
            <div className="text-green-600 text-sm font-medium">
              ✓ Ready for next step
            </div>
          )}
        </div>
      </div>
    </StepWrapper>
  )
}
