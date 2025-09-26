"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
// Temporarily comment out Editor import to test
// import { Editor } from '@/components/Editor'
import { ExportButtons } from '@/components/ExportButtons'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import { useSubscription } from '@/contexts/SubscriptionContext'
import PlanBasedFeatureGuard from '@/components/PlanBasedFeatureGuard'
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  Building,
  Loader2,
  Mail
} from 'lucide-react'

interface CoverLetterInputs {
  jobTitle: string
  jobDescription: string
  companyName: string
  userInfo: {
    name: string
    email: string
    phone: string
    experience: string
    skills: string
  }
}

// Rename the main component
function CoverLetterPageContent() {
  const { user } = useUser()
  const { useAIFeature, canUseFeature } = useSubscription()
  const [coverLetterContent, setCoverLetterContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [showInputForm, setShowInputForm] = useState(true)
  const [coverLetterInputs, setCoverLetterInputs] = useState<CoverLetterInputs>({
    jobTitle: '',
    jobDescription: '',
    companyName: '',
    userInfo: {
      name: '',
      email: '',
      phone: '',
      experience: '',
      skills: ''
    }
  })

  // Initialize with user data if available
  useEffect(() => {
    if (user) {
      setCoverLetterInputs(prev => ({
        ...prev,
        userInfo: {
          ...prev.userInfo,
          name: user.fullName || '',
          email: user.primaryEmailAddress?.emailAddress || ''
        }
      }))
    }
  }, [user])

  // Generate cover letter with AI
  const generateCoverLetter = async () => {
    if (!user) {
      toast.error('Please sign in to generate cover letters')
      return
    }

    if (!coverLetterInputs.jobTitle || !coverLetterInputs.companyName) {
      toast.error('Please fill in job title and company name')
      return
    }

    if (!canUseFeature('cover_letter_generation')) {
      toast.error('Cover letter generation is not available in your current plan')
      return
    }

    setIsGenerating(true)

    const success = await useAIFeature(
      'cover_letter_generation',
      () => fetch('/api/openai/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          jobTitle: coverLetterInputs.jobTitle,
          jobDescription: coverLetterInputs.jobDescription,
          companyName: coverLetterInputs.companyName,
          userInfo: coverLetterInputs.userInfo
        })
      }),
      (data) => {
        setCoverLetterContent(data.html)
        setShowInputForm(false)
        toast.success('Cover letter generated successfully! Credit deducted.')
      },
      (error) => {
        toast.error(error || 'Failed to generate cover letter')
      }
    )

    setIsGenerating(false)
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
            AI Cover Letter Builder
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Create tailored cover letters that get you noticed
          </p>
        </motion.div>

        {showInputForm ? (
          /* Input Form */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 dark:bg-gray-800/70 dark:border-gray-600/20">
              <div className="space-y-8">
                {/* Job Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Briefcase className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Job Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Job Title *"
                      value={coverLetterInputs.jobTitle}
                      onChange={(e) => setCoverLetterInputs(prev => ({ 
                        ...prev, 
                        jobTitle: e.target.value 
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Company Name *"
                      value={coverLetterInputs.companyName}
                      onChange={(e) => setCoverLetterInputs(prev => ({ 
                        ...prev, 
                        companyName: e.target.value 
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                    />
                  </div>
                  
                  <textarea
                    placeholder="Job Description (paste the full job posting for better results)"
                    value={coverLetterInputs.jobDescription}
                    onChange={(e) => setCoverLetterInputs(prev => ({ 
                      ...prev, 
                      jobDescription: e.target.value 
                    }))}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                  />
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Information</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={coverLetterInputs.userInfo.name}
                      onChange={(e) => setCoverLetterInputs(prev => ({
                        ...prev,
                        userInfo: { ...prev.userInfo, name: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={coverLetterInputs.userInfo.email}
                      onChange={(e) => setCoverLetterInputs(prev => ({
                        ...prev,
                        userInfo: { ...prev.userInfo, email: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                    />
                  </div>

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={coverLetterInputs.userInfo.phone}
                    onChange={(e) => setCoverLetterInputs(prev => ({
                      ...prev,
                      userInfo: { ...prev.userInfo, phone: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                  />
                  
                  <textarea
                    placeholder="Brief summary of your relevant experience"
                    value={coverLetterInputs.userInfo.experience}
                    onChange={(e) => setCoverLetterInputs(prev => ({
                      ...prev,
                      userInfo: { ...prev.userInfo, experience: e.target.value }
                    }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                  />
                  
                  <textarea
                    placeholder="Key skills relevant to this position"
                    value={coverLetterInputs.userInfo.skills}
                    onChange={(e) => setCoverLetterInputs(prev => ({
                      ...prev,
                      userInfo: { ...prev.userInfo, skills: e.target.value }
                    }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                  />
                </div>

                {/* Generate Button */}
                <div className="text-center pt-6">
                  <button
                    onClick={generateCoverLetter}
                    disabled={isGenerating || !coverLetterInputs.jobTitle || !coverLetterInputs.companyName}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 mx-auto"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                    <span>{isGenerating ? 'Generating...' : 'Generate Cover Letter with AI'}</span>
                  </button>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    The more details you provide, the better your cover letter will be
                  </p>
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
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 dark:bg-gray-800/70 dark:border-gray-600/20">
              {/* Editor Header */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                      Cover Letter
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {coverLetterInputs.jobTitle} 
                      {coverLetterInputs.companyName && ` at ${coverLetterInputs.companyName}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowInputForm(true)}
                    className="px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    Edit Details
                  </button>
                  
                  <ExportButtons
                    content={coverLetterContent}
                    filename={`cover-letter-${coverLetterInputs.jobTitle.toLowerCase().replace(/\s+/g, '-')}`}
                  />
                </div>
              </div>

              {/* CKEditor */}
              <div className="min-h-[600px] p-4 border border-gray-200 rounded-xl bg-white dark:bg-gray-800 dark:border-gray-600">
                <p className="text-gray-500 dark:text-gray-400">Editor temporarily disabled for testing</p>
                <textarea 
                  value={coverLetterContent}
                  onChange={(e) => setCoverLetterContent(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Your AI-generated cover letter will appear here..."
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Main component with feature guard
export default function CoverLetterPage() {
  return (
    <PlanBasedFeatureGuard feature="cover_letter_generation">
      <CoverLetterPageContent />
    </PlanBasedFeatureGuard>
  )
}
