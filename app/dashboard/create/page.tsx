"use client"

import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import { useSubscription } from '@/contexts/SubscriptionContext'
import PlanBasedFeatureGuard from '@/components/PlanBasedFeatureGuard'
import { 
  User,
  Target,
  Briefcase,
  GraduationCap,
  Award,
  Plus,
  Eye,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Loader2
} from 'lucide-react'

// Import our step components
import { PersonalInfoStep } from '@/components/resume-steps/PersonalInfoStep'
import { ProfessionalSummaryStep } from '@/components/resume-steps/ProfessionalSummaryStep'
import { ExperienceStep } from '@/components/resume-steps/ExperienceStep'
import { EducationStep } from '@/components/resume-steps/EducationStep'
import { SkillsStep } from '@/components/resume-steps/SkillsStep'
import { AdditionalStep } from '@/components/resume-steps/AdditionalStep'
import { TemplateStep } from '@/components/resume-steps/TemplateStep'
import { ReviewStep } from '@/components/resume-steps/ReviewStep'
import { ExportButtons } from '@/components/ExportButtons'

// Step definitions
const FORM_STEPS = [
  { id: 1, title: 'Personal Info', icon: User, description: 'Basic contact information' },
  { id: 2, title: 'Professional Summary', icon: Target, description: 'Your professional overview' },
  { id: 3, title: 'Experience', icon: Briefcase, description: 'Work history and achievements' },
  { id: 4, title: 'Education', icon: GraduationCap, description: 'Educational background' },
  { id: 5, title: 'Skills', icon: Award, description: 'Technical and soft skills' },
  { id: 6, title: 'Additional', icon: Plus, description: 'Projects, certifications, languages' },
  { id: 7, title: 'Template Selection', icon: Eye, description: 'Choose a template for your resume' },
  { id: 8, title: 'Review & Generate', icon: Eye, description: 'Final review and generation' }
]

interface ResumeInputs {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  summary: string
  jobDescription?: string
  experience: Array<{
    company: string
    position: string
    duration: string
    description: string
    location: string
  }>
  education: Array<{
    school: string
    degree: string
    field: string
    year: string
    gpa: string
    location: string
    honors: string
    coursework: string
    activities: string
    description: string
  }>
  skills: string[]
  certifications: Array<{
    name: string
    issuer: string
    date: string
  }>
  projects: Array<{
    name: string
    description: string
    technologies: string
    link: string
  }>
  languages: Array<{
    language: string
    proficiency: string
  }>
  achievements: string[]
  template: string
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

function CreateResumePageContent() {
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { useAIFeature, canUseFeature, forceRefresh } = useSubscription()
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  
  // Resume data state
  const [resumeInputs, setResumeInputs] = useState<ResumeInputs>({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
    languages: [],
    achievements: [],
    template: ''
  })
  
  // AI suggestions state
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([])
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false)
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([])
  
  // Resume generation state
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [atsScore, setAtsScore] = useState<number | undefined>(undefined)

  // Load existing resume if resumeId is provided
  useEffect(() => {
    const resumeIdParam = searchParams.get('resumeId')
    if (resumeIdParam) {
      setResumeId(resumeIdParam)
      loadExistingResume(resumeIdParam)
    }
  }, [searchParams])

  // Load existing resume data
  const loadExistingResume = async (id: string) => {
    try {
      const response = await fetch(`/api/resumes/${id}`)
      if (!response.ok) {
        throw new Error('Failed to load resume')
      }
      
      const data = await response.json()
      const resume = data.resume
      
      if (resume && resume.json_content) {
        const jsonData = typeof resume.json_content === 'string' 
          ? JSON.parse(resume.json_content) 
          : resume.json_content
        
        // Restore form inputs
        if (jsonData.personalInfo) {
          setResumeInputs(prev => ({
            ...prev,
            name: jsonData.personalInfo.name || '',
            title: jsonData.personalInfo.title || '',
            email: jsonData.personalInfo.email || '',
            phone: jsonData.personalInfo.phone || '',
            location: jsonData.personalInfo.location || '',
            linkedin: jsonData.personalInfo.linkedin || '',
            website: jsonData.personalInfo.website || '',
            summary: jsonData.personalInfo.summary || '',
            experience: jsonData.experience || [],
            education: jsonData.education || [],
            skills: jsonData.skills || [],
            certifications: jsonData.certifications || [],
            projects: jsonData.projects || [],
            languages: jsonData.languages || [],
            achievements: jsonData.achievements || [],
            template: jsonData.template || ''
          }))
        }
        
        // Load HTML content if available
        if (resume.html_content) {
          setGeneratedContent(resume.html_content)
        }
        
        // Load form progress if available
        if (jsonData.formProgress) {
          setCurrentStep(jsonData.formProgress.currentStep)
          setCompletedSteps(jsonData.formProgress.completedSteps)
        }
        
        toast.success('Resume loaded successfully')
      }
    } catch (error) {
      console.error('Error loading resume:', error)
      toast.error('Failed to load resume')
    }
  }

  // Generate AI suggestions based on current step and inputs
  const generateAISuggestions = useCallback(async (step: number) => {
    console.log('🎯 Generating AI suggestions for step:', step)
    console.log('📋 Resume data:', { 
      name: resumeInputs.name, 
      title: resumeInputs.title,
      experienceCount: resumeInputs.experience?.length || 0
    })
    
    if (!resumeInputs.name || !resumeInputs.title) {
      console.log('⚠️ Missing required data (name or title), skipping suggestions')
      return
    }

    // Check if user can use the feature
    if (!canUseFeature('ai_suggestions')) {
      toast.error('AI suggestions are not available in your current plan. Please upgrade to continue.')
      return
    }
    
    setIsGeneratingSuggestions(true)
    
    try {
      const requestBody = {
        step,
        resumeData: resumeInputs,
        focusArea: getFocusAreaForStep(step)
      }
      
      console.log('📡 Making API request to /api/openai/suggestions:', requestBody)
      
      const success = await useAIFeature(
        'ai_suggestions',
        () => fetch('/api/openai/suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }),
        (data) => {
          // Success callback
          console.log('✅ API Response data:', data)
          console.log('📊 Suggestions received:', data.suggestions?.length || 0)
          
          if (data.suggestions && Array.isArray(data.suggestions)) {
            // Validate and sanitize suggestions before setting state
            const validSuggestions = data.suggestions.filter(suggestion => 
              suggestion && 
              typeof suggestion === 'object' &&
              typeof suggestion.id === 'string' &&
              typeof suggestion.content === 'string' &&
              typeof suggestion.category === 'string' &&
              typeof suggestion.type === 'string'
            ).map(suggestion => ({
              ...suggestion,
              // Ensure all properties are strings
              id: String(suggestion.id),
              content: String(suggestion.content),
              category: String(suggestion.category),
              type: String(suggestion.type),
              icon: typeof suggestion.icon === 'string' ? suggestion.icon : '💡',
              confidence: typeof suggestion.confidence === 'number' ? suggestion.confidence : 75,
              preview: typeof suggestion.preview === 'string' ? suggestion.preview : undefined
            }))
            
            setAiSuggestions(validSuggestions)
            console.log('✅ AI suggestions set successfully:', validSuggestions.length)
          } else {
            console.log('⚠️ No suggestions in response or invalid format')
            setAiSuggestions([])
          }
        },
        (error) => {
          // Error callback
          console.error('❌ Error generating suggestions:', error)
          toast.error('Failed to generate AI suggestions. Please try again.')
          setAiSuggestions([])
        }
      )

      if (!success) {
        toast.error('Failed to generate AI suggestions. Please check your plan and try again.')
        setAiSuggestions([])
      }
    } catch (error) {
      console.error('❌ Error generating suggestions:', error)
      setAiSuggestions([])
    } finally {
      setIsGeneratingSuggestions(false)
      console.log('🏁 Suggestions generation completed')
    }
  }, [resumeInputs, canUseFeature, useAIFeature])

  // Get focus area for current step
  const getFocusAreaForStep = (step: number): string => {
    switch (step) {
      case 2: return 'summary'
      case 3: return 'experience'
      case 5: return 'skills'
      default: return 'general'
    }
  }

  // Apply AI suggestion
  const applySuggestion = (suggestion: AISuggestion) => {
    console.log('🎯 Applying suggestion ID:', suggestion?.id)
    
    // Safety check to ensure suggestion is valid
    if (!suggestion || typeof suggestion !== 'object' || !suggestion.id || !suggestion.content) {
      console.error('❌ Invalid suggestion object passed to applySuggestion')
      toast.error('Invalid suggestion - please try again')
      return
    }
    
    setSelectedSuggestions(prev => [...prev, suggestion.id])
    
    switch (suggestion.type) {
      case 'summary':
        setResumeInputs(prev => ({ ...prev, summary: suggestion.content }))
        break
      case 'experience':
        // Extract experience index from suggestion ID if it exists
        const idParts = suggestion.id.split('-')
        const experienceIndex = idParts[idParts.length - 1] // Last part should be the index
        const targetIndex = !isNaN(Number(experienceIndex)) ? Number(experienceIndex) : resumeInputs.experience.length - 1
        
        console.log('📋 Applying to experience index:', targetIndex, 'out of', resumeInputs.experience.length)
        
        if (targetIndex >= 0 && targetIndex < resumeInputs.experience.length) {
          const updatedExp = [...resumeInputs.experience]
          updatedExp[targetIndex] = {
            ...updatedExp[targetIndex],
            description: updatedExp[targetIndex].description 
              ? `${updatedExp[targetIndex].description}\n• ${suggestion.content}`
              : `• ${suggestion.content}`
          }
          setResumeInputs(prev => ({ ...prev, experience: updatedExp }))
          console.log('✅ Applied suggestion to experience #' + (targetIndex + 1))
        } else {
          console.log('⚠️ Invalid experience index, applying to last experience')
          // Fallback to last experience if index is invalid
          const currentExpIndex = resumeInputs.experience.length - 1
          if (currentExpIndex >= 0) {
            const updatedExp = [...resumeInputs.experience]
            updatedExp[currentExpIndex] = {
              ...updatedExp[currentExpIndex],
              description: updatedExp[currentExpIndex].description 
                ? `${updatedExp[currentExpIndex].description}\n• ${suggestion.content}`
                : `• ${suggestion.content}`
            }
            setResumeInputs(prev => ({ ...prev, experience: updatedExp }))
          }
        }
        break
      case 'skills':
        const newSkills = suggestion.content.split(', ')
        setResumeInputs(prev => ({
          ...prev,
          skills: Array.from(new Set([...prev.skills, ...newSkills]))
        }))
        break
      case 'achievement':
        setResumeInputs(prev => ({
          ...prev,
          achievements: [...prev.achievements, suggestion.content]
        }))
        break
    }
    
    toast.success('Suggestion applied!')
  }

  // Navigate between steps
  const goToStep = (step: number) => {
    console.log('🚀 goToStep called with step:', step)
    
    if (step >= 1 && step <= FORM_STEPS.length) {
      // CRITICAL FIX: Don't allow navigation away from step 8 if we have generated content
      if (currentStep === 8 && generatedContent && step !== 8) {
        console.log('⚠️ Preventing navigation away from Review step with generated content')
        console.log('Current generated content length:', generatedContent.length)
        // Allow navigation but warn user
        const confirmNavigation = confirm('You have generated resume content. Are you sure you want to navigate away? Your generated resume will be saved but you\'ll need to regenerate to see it again.')
        if (!confirmNavigation) {
          return
        }
      }
      
      setCurrentStep(step)
      console.log('✅ Current step set to:', step)
      
      // Clear AI suggestions on navigation (except when staying on step 8)
      if (step !== 8) {
        setAiSuggestions([])
      }
      
      // Generate suggestions for the new step
      if (step > 1 && step <= 5) {
        console.log('🎯 Triggering generateAISuggestions for step:', step)
        generateAISuggestions(step)
      } else {
        console.log('⚠️ Step', step, 'is outside suggestion range (2-5)')
      }
    } else {
      console.log('❌ Invalid step:', step, 'Valid range: 1-', FORM_STEPS.length)
    }
  }

  const nextStep = () => {
    if (validateCurrentStep()) {
      setCompletedSteps(prev => Array.from(new Set([...prev, currentStep])))
      goToStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    goToStep(currentStep - 1)
  }

  // Validate current step
  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(resumeInputs.name && resumeInputs.title && resumeInputs.email)
      case 2:
        return !!resumeInputs.summary && resumeInputs.summary.length >= 50
      case 3:
        return resumeInputs.experience.length > 0 && !!resumeInputs.experience[0].company
      case 4:
        return true // Education is optional
      case 5:
        return resumeInputs.skills.length >= 5
      case 6:
        return true // Additional sections are optional
      case 7:
        return !!resumeInputs.template
      case 8:
        return true // Review step is always valid
      default:
        return true
    }
  }

  // Generate final resume
  const generateResume = async () => {
    setIsGenerating(true)
    
    try {
      console.log('Starting resume generation with data:', {
        name: resumeInputs.name,
        title: resumeInputs.title,
        email: resumeInputs.email,
        experienceCount: resumeInputs.experience.length,
        skillsCount: resumeInputs.skills.length,
        experienceData: resumeInputs.experience // Add detailed experience logging
      })

      // Map template ID to template name if needed
      const getTemplateName = (templateId: string): string => {
        const templateMap: { [key: string]: string } = {
          'modern-professional': 'Modern Professional',
          'executive': 'Executive',
          'creative': 'Creative',
          'technical': 'Technical',
          'minimalist': 'Minimalist'
        }
        return templateMap[templateId] || templateId
      }

      const templateName = selectedTemplate || getTemplateName(resumeInputs.template) || 'Modern Professional'

      const requestData = {
        resumeData: {
          personalInfo: {
            fullName: resumeInputs.name,
            email: resumeInputs.email,
            phone: resumeInputs.phone,
            location: resumeInputs.location,
            linkedin: resumeInputs.linkedin,
            website: resumeInputs.website
          },
          professionalSummary: resumeInputs.summary,
          experience: resumeInputs.experience,
          education: resumeInputs.education,
          skills: resumeInputs.skills,
          certifications: resumeInputs.certifications,
          projects: resumeInputs.projects,
          achievements: resumeInputs.achievements
        },
        template: templateName || 'modern',
        colorTheme: 'blue', // Use default blue theme
        jobDescription: resumeInputs.jobDescription || ''
      }

      console.log('Sending request to /api/generate-resume with data:', requestData)

      const response = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      })

      console.log('API Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Resume generated successfully!')
        console.log('📊 API Response data:', {
          hasHtml: !!data.html,
          htmlLength: data.html?.length || 0,
          htmlPreview: data.html?.substring(0, 200) || 'No HTML content',
          atsScore: data.atsScore,
          resumeId: data.resumeId,
          template: data.template?.name || 'Unknown template',
          message: data.message
        })
        
        if (data.html) {
          console.log('🎯 Setting generated content with HTML length:', data.html.length)
          console.log('🎯 HTML content preview:', data.html.substring(0, 500))
          
          // Set generated content and force re-render
          setGeneratedContent(data.html)
          setAtsScore(data.atsScore)
          
          // CRITICAL FIX: Ensure we stay on step 8 after generation
          if (currentStep !== 8) {
            console.log('🔄 Ensuring we stay on Review & Generate step (8)')
            setCurrentStep(8)
          }
          
          // Mark step 8 as completed
          setCompletedSteps(prev => Array.from(new Set([...prev, 8])))
          
          // Auto-save the resume (non-blocking to prevent reload)
          saveResume(data.html).catch(error => {
            console.warn('Auto-save failed (non-critical):', error)
          })
          
          toast.success(`Resume generated successfully! ATS Score: ${data.atsScore || 'N/A'}%`)
          
          // DISABLED: Event dispatch to prevent potential reloads
          // window.dispatchEvent(new CustomEvent('credits-updated'))
          
          // Force a small delay to ensure state updates are processed
          setTimeout(() => {
            console.log('🔍 Post-generation state check:', {
              currentStep: currentStep,
              hasGeneratedContent: !!generatedContent,
              generatedContentLength: generatedContent?.length || 0
            })
          }, 100)
          
        } else {
          console.error('❌ No HTML content in API response')
          toast.error('Resume generated but no content received. Please try again.')
        }
      } else {
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          console.error('API Error:', errorData)
          throw new Error(errorData.error || 'Failed to generate resume')
        } else {
          // Server returned HTML error page instead of JSON
          const errorText = await response.text()
          console.error('Server Error (HTML response):', errorText.substring(0, 200))
          throw new Error('Server error occurred. Please try again or contact support.')
        }
      }
    } catch (error) {
      console.error('Error generating resume:', error)
      toast.error(`Failed to generate resume: ${error.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  // Auto-save functionality
  useEffect(() => {
    const autoSave = async () => {
      if (resumeInputs.name && resumeInputs.title && resumeInputs.email) {
        await saveResume(generatedContent || '')
      }
    }

    // DISABLED: Auto-save to prevent reloading issues
    // const interval = setInterval(autoSave, 30000)
    // return () => clearInterval(interval)
  }, [resumeInputs, generatedContent])

  // Save resume to database
  const saveResume = async (content: string) => {
    if (!user) {
      throw new Error('User not authenticated')
    }

    try {
      console.log('Saving resume with content length:', content.length)
      console.log('Resume ID:', resumeId)

      const resumeData = {
        title: resumeInputs.name ? `${resumeInputs.name} - Resume` : 'My Resume',
        html_content: content,
        json_content: {
          personalInfo: {
            fullName: resumeInputs.name,
            title: resumeInputs.title,
            email: resumeInputs.email,
            phone: resumeInputs.phone,
            location: resumeInputs.location,
            linkedin: resumeInputs.linkedin,
            website: resumeInputs.website,
            summary: resumeInputs.summary
          },
          experience: resumeInputs.experience,
          education: resumeInputs.education,
          skills: resumeInputs.skills,
          certifications: resumeInputs.certifications,
          projects: resumeInputs.projects,
          languages: resumeInputs.languages,
          achievements: resumeInputs.achievements,
          template: resumeInputs.template,
          formProgress: {
            currentStep,
            completedSteps
          },
          metadata: {
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: '2.0',
            stepCount: FORM_STEPS.length,
            completionPercentage: Math.round((completedSteps.length / FORM_STEPS.length) * 100)
          }
        },
        theme_color: '#3b82f6', // Default theme color
        ats_score: calculateCompletionScore() // Use our completion score as ATS score
      }

      console.log('Resume data prepared:', {
        title: resumeData.title,
        contentLength: resumeData.html_content.length,
        hasPersonalInfo: !!resumeData.json_content.personalInfo.fullName,
        experienceCount: resumeData.json_content.experience.length,
        skillsCount: resumeData.json_content.skills.length
      })

      let response
      
      if (resumeId) {
        // Update existing resume
        console.log('Updating existing resume:', resumeId)
        response = await fetch(`/api/resumes/${resumeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resumeData),
        })
      } else {
        // Create new resume
        console.log('Creating new resume')
        response = await fetch('/api/resumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resumeData),
        })
      }

      console.log('API response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Save successful:', data)
        
        if (data.resume?.id && !resumeId) {
          setResumeId(data.resume.id)
          console.log('Set new resume ID:', data.resume.id)
        }
        
        // Show save confirmation only for manual saves with content
        if (content && content.length > 0) {
          toast.success('Resume saved to history successfully!')
        }
        
        // DISABLED: Refresh to prevent reloading
        // await forceRefresh()
        
        return data.resume?.id || resumeId
      } else {
        const contentType = response.headers.get('content-type')
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          console.error('API error response:', errorData)
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to save resume`)
        } else {
          // Server returned HTML error page instead of JSON
          const errorText = await response.text()
          console.error('Server Error (HTML response):', errorText.substring(0, 200))
          throw new Error('Server error occurred. Please try again or contact support.')
        }
      }
    } catch (error) {
      console.error('Save failed:', error)
      
      // Show error toast only for manual saves with content
      if (content && content.length > 0) {
        toast.error(`Failed to save resume: ${error.message || 'Unknown error'}`)
      }
      
      throw error
    }
  }

  // Calculate completion score based on filled sections
  const calculateCompletionScore = (): number => {
    let score = 0
    const maxScore = 100
    
    // Personal Info (20 points)
    if (resumeInputs.name) score += 5
    if (resumeInputs.title) score += 5
    if (resumeInputs.email) score += 5
    if (resumeInputs.phone) score += 2.5
    if (resumeInputs.location) score += 2.5
    
    // Summary (15 points)
    if (resumeInputs.summary && resumeInputs.summary.length >= 50) score += 15
    
    // Experience (25 points)
    if (resumeInputs.experience.length > 0 && resumeInputs.experience[0].company) {
      score += 15
      if (resumeInputs.experience.length > 1) score += 5
      if (resumeInputs.experience.some(exp => exp.description && exp.description.length > 50)) score += 5
    }
    
    // Education (10 points)
    if (resumeInputs.education.length > 0 && resumeInputs.education[0].school) score += 10
    
    // Skills (15 points)
    if (resumeInputs.skills.length >= 5) {
      score += 10
      if (resumeInputs.skills.length >= 10) score += 5
    }
    
    // Additional sections (15 points)
    if (resumeInputs.projects.length > 0) score += 5
    if (resumeInputs.certifications.length > 0) score += 5
    if (resumeInputs.languages.length > 0) score += 5
    
    return Math.min(Math.round(score), maxScore)
  }

  // Cleanup effect to prevent state issues during navigation
  useEffect(() => {
    return () => {
      // Clear suggestions state when component unmounts
      console.log('🧹 Cleaning up suggestions state on unmount')
      setAiSuggestions([])
      setSelectedSuggestions([])
      setIsGeneratingSuggestions(false)
      
      // Additional cleanup for any persisted data
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.removeItem('aiSuggestions')
          sessionStorage.removeItem('selectedSuggestions')
          localStorage.removeItem('tempSuggestions')
        } catch (e) {
          // Silent fail for storage access issues
        }
      }
    }
  }, [])

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep resumeInputs={resumeInputs} setResumeInputs={setResumeInputs} />
      case 2:
        return (
          <ProfessionalSummaryStep 
            resumeInputs={resumeInputs} 
            setResumeInputs={setResumeInputs}
            aiSuggestions={aiSuggestions}
            onApplySuggestion={applySuggestion}
            isGenerating={isGeneratingSuggestions}
            selectedSuggestions={selectedSuggestions}
          />
        )
      case 3:
        return (
          <ExperienceStep 
            resumeInputs={resumeInputs} 
            setResumeInputs={setResumeInputs}
            aiSuggestions={aiSuggestions}
            onApplySuggestion={applySuggestion}
            isGenerating={isGeneratingSuggestions}
            selectedSuggestions={selectedSuggestions}
          />
        )
      case 4:
        return <EducationStep resumeInputs={resumeInputs} setResumeInputs={setResumeInputs} />
      case 5:
        return (
          <SkillsStep 
            resumeInputs={resumeInputs} 
            setResumeInputs={setResumeInputs}
            aiSuggestions={aiSuggestions}
            onApplySuggestion={applySuggestion}
            isGenerating={isGeneratingSuggestions}
            selectedSuggestions={selectedSuggestions}
          />
        )
      case 6:
        return <AdditionalStep resumeInputs={resumeInputs} setResumeInputs={setResumeInputs} />
      case 7:
        return (
          <TemplateStep 
            resumeInputs={resumeInputs} 
            setResumeInputs={setResumeInputs}
            setSelectedTemplate={setSelectedTemplate}
          />
        )
      case 8:
        return (
          <ReviewStep 
            resumeInputs={resumeInputs} 
            generatedContent={generatedContent}
            setGeneratedContent={setGeneratedContent}
            isGenerating={isGenerating}
            onGenerate={generateResume}
            onSave={saveResume}
            atsScore={atsScore}
            selectedTemplate={selectedTemplate}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="w-full px-6 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Create Your Resume
              </h1>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Step {currentStep} of {FORM_STEPS.length}
              </div>
            </div>
            
            {/* Credits Widget in Header */}
            <div className="hidden md:block">
            </div>
          </div>
          
          {/* Step Progress Bar */}
          <div className="flex items-center space-x-2 mb-4">
            {FORM_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all cursor-pointer ${
                    completedSteps.includes(step.id)
                      ? 'bg-green-500 border-green-500 text-white'
                      : currentStep === step.id
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600'
                  }`}
                  onClick={() => goToStep(step.id)}
                >
                  {completedSteps.includes(step.id) ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {index < FORM_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 rounded ${
                    completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Current Step Info */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {FORM_STEPS[currentStep - 1]?.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {FORM_STEPS[currentStep - 1]?.description}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {currentStep < FORM_STEPS.length ? (
            <button
              onClick={nextStep}
              disabled={!validateCurrentStep()}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={generateResume}
              disabled={isGenerating}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>{isGenerating ? 'Generating...' : 'Generate Resume'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CreateResumePage() {
  return (
    <PlanBasedFeatureGuard feature="resume_generation">
      <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
        <CreateResumePageContent />
      </Suspense>
    </PlanBasedFeatureGuard>
  )
}
