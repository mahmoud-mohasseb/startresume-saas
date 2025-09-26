"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Editor } from '@/components/Editor'
import { ExportButtons } from '@/components/ExportButtons'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import { createAdminClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  Sparkles, 
  FileText, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award,
  Loader2,
  Save,
  BarChart3,
  Mail,
  Phone,
  MapPin,
  Globe,
  Plus,
  X,
  Brain
} from 'lucide-react'
import { FeatureGuard } from '@/components/FeatureGuard'

interface ResumeInputs {
  // Personal Information
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  summary: string
  
  // Experience
  experience: Array<{
    company: string
    position: string
    duration: string
    description: string
    location: string
  }>
  
  // Education
  education: Array<{
    school: string
    degree: string
    field: string
    year: string
    gpa: string
    location: string
  }>
  
  // Skills & Certifications
  skills: string[]
  certifications: Array<{
    name: string
    issuer: string
    date: string
    expiryDate: string
  }>
  
  // Projects & Languages
  projects: Array<{
    name: string
    description: string
    technologies: string
    link: string
    duration: string
  }>
  languages: Array<{
    language: string
    proficiency: string
  }>
  
  // Additional Sections
  achievements: string[]
  volunteering: Array<{
    organization: string
    role: string
    duration: string
    description: string
  }>
}

function CreateResumePageContent() {
  const { user } = useUser()
  const router = useRouter()
  const [resumeContent, setResumeContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showInputForm, setShowInputForm] = useState(true)
  const [generatedContent, setGeneratedContent] = useState('')
  const [atsScore, setAtsScore] = useState<number | null>(null)
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [showMockInterview, setShowMockInterview] = useState(false)
  const [resumeInputs, setResumeInputs] = useState<ResumeInputs>({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
    experience: [{ company: '', position: '', duration: '', description: '', location: '' }],
    education: [{ school: '', degree: '', field: '', year: '', gpa: '', location: '' }],
    skills: [],
    certifications: [{ name: '', issuer: '', date: '', expiryDate: '' }],
    projects: [{ name: '', description: '', technologies: '', link: '', duration: '' }],
    languages: [{ language: '', proficiency: '' }],
    achievements: [],
    volunteering: [{ organization: '', role: '', duration: '', description: '' }]
  })

  // Initialize with user data if available
  useEffect(() => {
    if (user) {
      setResumeInputs(prev => ({
        ...prev,
        name: user.fullName || '',
        email: user.emailAddresses?.[0]?.emailAddress || '',
      }))
    }
  }, [user])

  // Helper functions for adding/removing items
  const addExperience = () => {
    setResumeInputs(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', position: '', duration: '', description: '', location: '' }]
    }))
  }

  const removeExperience = (index: number) => {
    setResumeInputs(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }))
  }

  const addEducation = () => {
    setResumeInputs(prev => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', field: '', year: '', gpa: '', location: '' }]
    }))
  }

  const removeEducation = (index: number) => {
    setResumeInputs(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const addProject = () => {
    setResumeInputs(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', technologies: '', link: '', duration: '' }]
    }))
  }

  const removeProject = (index: number) => {
    setResumeInputs(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }))
  }

  const addCertification = () => {
    setResumeInputs(prev => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuer: '', date: '', expiryDate: '' }]
    }))
  }

  const removeCertification = (index: number) => {
    setResumeInputs(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const addLanguage = () => {
    setResumeInputs(prev => ({
      ...prev,
      languages: [...prev.languages, { language: '', proficiency: '' }]
    }))
  }

  const removeLanguage = (index: number) => {
    setResumeInputs(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  const addVolunteering = () => {
    setResumeInputs(prev => ({
      ...prev,
      volunteering: [...prev.volunteering, { organization: '', role: '', duration: '', description: '' }]
    }))
  }

  const removeVolunteering = (index: number) => {
    setResumeInputs(prev => ({
      ...prev,
      volunteering: prev.volunteering.filter((_, i) => i !== index)
    }))
  }

  // Generate resume with AI
  const generateResume = async () => {
    if (!resumeInputs.name || !resumeInputs.title) {
      toast.error('Name and job title are required')
      return
    }

    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/openai/resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: {
            name: resumeInputs.name,
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
          volunteering: resumeInputs.volunteering,
          jobTitle: resumeInputs.title,
          saveToDatabase: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate resume')
      }

      const data = await response.json()
      
      if (data.html) {
        setGeneratedContent(data.html)
        setResumeContent(data.html)
        setAtsScore(data.atsScore || null)
        setResumeId(data.resumeId || null)
        setShowInputForm(false)
        
        // Show success message with ATS score
        if (data.atsScore) {
          toast.success(`Resume generated! ATS Score: ${data.atsScore}%`)
        } else {
          toast.success('Resume generated successfully!')
        }

        // Show mock interview option
        setShowMockInterview(true)
      } else {
        throw new Error('No content generated')
      }
    } catch (error) {
      console.error('Error generating resume:', error)
      toast.error('Failed to generate resume. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Save resume to database
  const saveResume = async (content: string) => {
    if (!user) return

    setIsSaving(true)
    try {
      const supabase = createAdminClient()
      
      const resumeData = {
        user_id: user.id,
        title: resumeInputs.title || 'My Resume',
        html_content: content,
        json_content: resumeInputs,
        ats_score: atsScore || 0,
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('resumes')
        .upsert(resumeData, {
          onConflict: 'user_id,title'
        })
        .select()

      if (error) throw error

      if (data && data[0]) {
        setResumeId(data[0].id)
      }

      toast.success('Resume saved successfully!')
    } catch (error) {
      console.error('Save failed:', error)
      toast.error('Failed to save resume. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Start mock interview
  const startMockInterview = () => {
    router.push(`/dashboard/mock-interview?jobTitle=${encodeURIComponent(resumeInputs.title)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
            AI Resume Builder
          </h1>
          <p className="text-gray-600 text-lg">
            Create a professional resume with AI assistance
          </p>
        </motion.div>

        {showInputForm ? (
          /* Enhanced Input Form */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="space-y-8">
                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={resumeInputs.name}
                      onChange={(e) => setResumeInputs(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Job Title *"
                      value={resumeInputs.title}
                      onChange={(e) => setResumeInputs(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={resumeInputs.email}
                      onChange={(e) => setResumeInputs(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={resumeInputs.phone}
                      onChange={(e) => setResumeInputs(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Location (City, State)"
                      value={resumeInputs.location}
                      onChange={(e) => setResumeInputs(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="url"
                      placeholder="LinkedIn Profile"
                      value={resumeInputs.linkedin}
                      onChange={(e) => setResumeInputs(prev => ({ ...prev, linkedin: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="url"
                      placeholder="Website/Portfolio"
                      value={resumeInputs.website}
                      onChange={(e) => setResumeInputs(prev => ({ ...prev, website: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <textarea
                    placeholder="Professional Summary"
                    value={resumeInputs.summary}
                    onChange={(e) => setResumeInputs(prev => ({ ...prev, summary: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Experience */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      <h2 className="text-xl font-semibold text-gray-900">Experience</h2>
                    </div>
                    <button
                      onClick={addExperience}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Experience</span>
                    </button>
                  </div>
                  
                  {resumeInputs.experience.map((exp, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => {
                          const newExp = [...resumeInputs.experience]
                          newExp[index].company = e.target.value
                          setResumeInputs(prev => ({ ...prev, experience: newExp }))
                        }}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Position"
                        value={exp.position}
                        onChange={(e) => {
                          const newExp = [...resumeInputs.experience]
                          newExp[index].position = e.target.value
                          setResumeInputs(prev => ({ ...prev, experience: newExp }))
                        }}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Duration (e.g., 2020-2023)"
                        value={exp.duration}
                        onChange={(e) => {
                          const newExp = [...resumeInputs.experience]
                          newExp[index].duration = e.target.value
                          setResumeInputs(prev => ({ ...prev, experience: newExp }))
                        }}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={exp.location}
                        onChange={(e) => {
                          const newExp = [...resumeInputs.experience]
                          newExp[index].location = e.target.value
                          setResumeInputs(prev => ({ ...prev, experience: newExp }))
                        }}
                        className="px-3 py-2 border border-gray-200 rounded-lg"
                      />
                      <textarea
                        placeholder="Job Description"
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...resumeInputs.experience]
                          newExp[index].description = e.target.value
                          setResumeInputs(prev => ({ ...prev, experience: newExp }))
                        }}
                        rows={3}
                        className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg"
                      />
                      {resumeInputs.experience.length > 1 && (
                        <button
                          onClick={() => removeExperience(index)}
                          className="md:col-span-2 px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center space-x-2"
                        >
                          <X className="w-4 h-4" />
                          <span>Remove Experience</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Award className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
                  </div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Add skills (press Enter to add)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          setResumeInputs(prev => ({
                            ...prev,
                            skills: [...prev.skills, e.currentTarget.value.trim()]
                          }))
                          e.currentTarget.value = ''
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="flex flex-wrap gap-2">
                      {resumeInputs.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm flex items-center gap-2"
                        >
                          {skill}
                          <button
                            onClick={() => {
                              setResumeInputs(prev => ({
                                ...prev,
                                skills: prev.skills.filter((_, i) => i !== index)
                              }))
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center pt-6">
                  <button
                    onClick={generateResume}
                    disabled={isGenerating || !resumeInputs.name || !resumeInputs.title}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Generating Resume...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Resume with AI</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Editor View */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-6xl mx-auto"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              {/* Editor Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-blue-600" />
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {resumeInputs.title || 'Resume'}
                    </h2>
                    {atsScore && (
                      <div className="flex items-center space-x-2 mt-1">
                        <BarChart3 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          ATS Score: {atsScore}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {showMockInterview && (
                    <button
                      onClick={startMockInterview}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors flex items-center space-x-2"
                    >
                      <Brain className="w-4 h-4" />
                      <span>Mock Interview</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setShowInputForm(true)}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Edit Details
                  </button>
                  
                  <button
                    onClick={() => saveResume(resumeContent)}
                    disabled={isSaving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{isSaving ? 'Saving...' : 'Save'}</span>
                  </button>
                  
                  <ExportButtons
                    content={resumeContent}
                    filename={`resume-${resumeInputs.name.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                </div>
              </div>

              {/* CKEditor */}
              <Editor
                initialContent={resumeContent}
                onContentChange={setResumeContent}
                onSave={saveResume}
                placeholder="Your AI-generated resume will appear here..."
                className="min-h-[600px]"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default function CreateResumePage() {
  return (
    <FeatureGuard feature="resume_generation">
      <CreateResumePageContent />
    </FeatureGuard>
  )
}
