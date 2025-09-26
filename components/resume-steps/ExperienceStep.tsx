"use client"

import React from 'react'
import { StepWrapper } from './StepWrapper'
import { AISuggestions } from './AISuggestions'
import { Briefcase, Plus, Trash2, Building, Calendar } from 'lucide-react'

interface ExperienceItem {
  company: string
  position: string
  duration: string
  description: string
  location: string
}

interface ResumeInputs {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  summary: string
  experience: ExperienceItem[]
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

interface ExperienceStepProps {
  resumeInputs: ResumeInputs
  setResumeInputs: React.Dispatch<React.SetStateAction<ResumeInputs>>
  aiSuggestions: AISuggestion[]
  onApplySuggestion: (suggestion: AISuggestion) => void
  isGenerating: boolean
  selectedSuggestions: string[]
}

export function ExperienceStep({
  resumeInputs,
  setResumeInputs,
  aiSuggestions,
  onApplySuggestion,
  isGenerating,
  selectedSuggestions
}: ExperienceStepProps) {

  const addExperience = () => {
    setResumeInputs(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: '', position: '', duration: '', description: '', location: '' }
      ]
    }))
  }

  const removeExperience = (index: number) => {
    setResumeInputs(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const updateExperience = (index: number, field: keyof ExperienceItem, value: string) => {
    setResumeInputs(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => 
        i === index ? { ...exp, [field]: value } : exp
      )
    }))
  }

  // Generate achievement suggestions based on role and industry
  const generateAchievementSuggestions = (position: string, company: string, index: number): AISuggestion[] => {
    const role = position.toLowerCase()
    const suggestions: AISuggestion[] = []

    // Software Engineering achievements
    if (role.includes('engineer') || role.includes('developer')) {
      suggestions.push(
        {
          id: `exp-tech-1-${Date.now()}-${index}`,
          type: 'experience',
          content: 'Developed and deployed scalable web applications serving 10,000+ users, resulting in 25% increase in user engagement',
          category: 'Technical Impact',
          icon: '💻',
          confidence: 90,
          preview: 'Shows technical skills and user impact'
        },
        {
          id: `exp-tech-2-${Date.now()}-${index}`,
          type: 'experience',
          content: 'Optimized database queries and API performance, reducing response times by 40% and improving system efficiency',
          category: 'Performance',
          icon: '⚡',
          confidence: 88,
          preview: 'Demonstrates optimization and measurable results'
        }
      )
    }

    // Marketing achievements
    if (role.includes('marketing') || role.includes('growth')) {
      suggestions.push(
        {
          id: `exp-marketing-1-${Date.now()}-${index}`,
          type: 'experience',
          content: 'Led digital marketing campaigns that increased brand awareness by 60% and generated $500K in new revenue',
          category: 'Revenue Growth',
          icon: '📈',
          confidence: 92,
          preview: 'Shows direct impact on revenue and growth'
        },
        {
          id: `exp-marketing-2-${Date.now()}-${index}`,
          type: 'experience',
          content: 'Managed social media strategy across 5 platforms, growing follower base by 150% and engagement by 80%',
          category: 'Social Media',
          icon: '📱',
          confidence: 85,
          preview: 'Demonstrates social media expertise and growth'
        }
      )
    }

    // Sales achievements
    if (role.includes('sales') || role.includes('account')) {
      suggestions.push(
        {
          id: `exp-sales-1-${Date.now()}-${index}`,
          type: 'experience',
          content: 'Exceeded sales targets by 130% for 3 consecutive quarters, generating $2M+ in new business revenue',
          category: 'Sales Excellence',
          icon: '💰',
          confidence: 95,
          preview: 'Shows consistent overperformance and revenue impact'
        },
        {
          id: `exp-sales-2-${Date.now()}-${index}`,
          type: 'experience',
          content: 'Built and maintained relationships with 50+ key clients, achieving 95% customer retention rate',
          category: 'Client Relations',
          icon: '🤝',
          confidence: 88,
          preview: 'Highlights relationship building and retention'
        }
      )
    }

    // Management achievements
    if (role.includes('manager') || role.includes('director') || role.includes('lead')) {
      suggestions.push(
        {
          id: `exp-mgmt-1-${Date.now()}-${index}`,
          type: 'experience',
          content: 'Led cross-functional team of 12 professionals, delivering projects 15% ahead of schedule and 10% under budget',
          category: 'Team Leadership',
          icon: '👥',
          confidence: 90,
          preview: 'Shows leadership skills and project delivery'
        },
        {
          id: `exp-mgmt-2-${Date.now()}-${index}`,
          type: 'experience',
          content: 'Implemented process improvements that reduced operational costs by 20% while maintaining quality standards',
          category: 'Process Improvement',
          icon: '⚙️',
          confidence: 87,
          preview: 'Demonstrates efficiency and cost management'
        }
      )
    }

    // General achievements
    suggestions.push(
      {
        id: `exp-general-1-${Date.now()}-${index}`,
        type: 'experience',
        content: 'Collaborated with stakeholders to identify requirements and deliver solutions that improved workflow efficiency by 30%',
        category: 'Collaboration',
        icon: '🤝',
        confidence: 82,
        preview: 'Shows teamwork and problem-solving skills'
      },
      {
        id: `exp-general-2-${Date.now()}-${index}`,
        type: 'experience',
        content: 'Trained and mentored 5 junior team members, with 100% retention rate and 3 receiving promotions within 18 months',
        category: 'Mentorship',
        icon: '🎓',
        confidence: 85,
        preview: 'Highlights leadership and people development'
      }
    )

    return suggestions
  }

  // Get suggestions for all experience items
  const getCurrentSuggestions = () => {
    if (resumeInputs.experience.length === 0) {
      return []
    }
    
    const allLocalSuggestions: AISuggestion[] = []
    
    // Generate suggestions for each experience item
    resumeInputs.experience.forEach((exp, index) => {
      if (exp.position) {
        const suggestions = generateAchievementSuggestions(exp.position, exp.company, index)
        allLocalSuggestions.push(...suggestions)
      }
    })
    
    return allLocalSuggestions
  }

  const allSuggestions = [...aiSuggestions, ...getCurrentSuggestions()]
  
  // Validate each suggestion to prevent React errors
  const validatedSuggestions = allSuggestions.filter((suggestion, index) => {
    const isValid = suggestion && 
      typeof suggestion === 'object' &&
      typeof suggestion.id === 'string' &&
      typeof suggestion.content === 'string' &&
      typeof suggestion.category === 'string' &&
      typeof suggestion.type === 'string'
    
    if (!isValid) {
      console.error('🚨 Invalid suggestion at index', index, '- ID:', suggestion?.id || 'no-id')
    }
    
    return isValid
  })

  // Initialize with one experience if empty
  React.useEffect(() => {
    if (resumeInputs.experience.length === 0) {
      addExperience()
    }
  }, [])

  return (
    <StepWrapper
      title="Work Experience"
      description="Add your professional experience with impactful achievements"
      icon={Briefcase}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Experience Forms */}
        <div className="space-y-6">
          {resumeInputs.experience.map((exp, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Experience #{index + 1}
                </h3>
                {resumeInputs.experience.length > 1 && (
                  <button
                    onClick={() => removeExperience(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                      placeholder="Google, Microsoft, etc."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    placeholder="Software Engineer, Marketing Manager"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => updateExperience(index, 'duration', e.target.value)}
                      placeholder="Jan 2020 - Present"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={exp.location}
                    onChange={(e) => updateExperience(index, 'location', e.target.value)}
                    placeholder="San Francisco, CA"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Achievements & Responsibilities
                </label>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  placeholder="• Led development of key features that increased user engagement by 25%&#10;• Collaborated with cross-functional teams to deliver projects on time&#10;• Mentored junior developers and improved team productivity"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                />
              </div>
            </div>
          ))}

          {/* Add Experience Button */}
          <button
            onClick={addExperience}
            className="w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Add Another Experience
            </span>
          </button>
        </div>

        {/* AI Suggestions */}
        <div>
          <AISuggestions
            suggestions={validatedSuggestions}
            onApplySuggestion={onApplySuggestion}
            selectedSuggestions={selectedSuggestions}
            isGenerating={isGenerating}
            title="Achievement Suggestions"
            className="h-fit sticky top-4"
          />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              resumeInputs.experience.length > 0 && resumeInputs.experience[0].company 
                ? 'bg-purple-500' : 'bg-gray-300'
            }`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {resumeInputs.experience.length > 0 && resumeInputs.experience[0].company
                ? `${resumeInputs.experience.length} experience(s) added`
                : 'Add at least one work experience'}
            </span>
          </div>
          {resumeInputs.experience.length > 0 && resumeInputs.experience[0].company && (
            <div className="text-purple-600 text-sm font-medium">
              ✓ Ready for next step
            </div>
          )}
        </div>
      </div>
    </StepWrapper>
  )
}
