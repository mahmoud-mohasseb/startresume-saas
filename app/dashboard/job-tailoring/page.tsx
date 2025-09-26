"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import { useSubscription } from '@/contexts/SubscriptionContext'
import PlanBasedFeatureGuard from '@/components/PlanBasedFeatureGuard'
import { 
  Target, 
  FileText, 
  Briefcase, 
  Building,
  Loader2,
  Sparkles,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Copy,
  ArrowLeft
} from 'lucide-react'

interface JobTailoringInputs {
  jobTitle: string
  jobDescription: string
  companyName: string
  resumeContent: string
  selectedResumeId?: string
}

interface SavedResume {
  id: string
  title: string
  html_content: string
  created_at: string
  ats_score?: number
}

// Main component content
function JobTailoringPageContent() {
  const { user } = useUser()
  const { subscription, useAIFeature, canUseFeature } = useSubscription()
  const [tailoredContent, setTailoredContent] = useState('')
  const [isTailoring, setIsTailoring] = useState(false)
  const [showInputForm, setShowInputForm] = useState(true)
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([])
  const [isLoadingResumes, setIsLoadingResumes] = useState(true)
  const [showResumeSelector, setShowResumeSelector] = useState(true)
  const [tailoringInputs, setTailoringInputs] = useState<JobTailoringInputs>({
    jobTitle: '',
    jobDescription: '',
    companyName: '',
    resumeContent: '',
    selectedResumeId: ''
  })

  useEffect(() => {
    if (user) {
      setTailoringInputs(prev => ({
        ...prev,
        // Pre-fill with user info if available
      }))
      
      // Fetch saved resumes
      fetchSavedResumes()
    }
  }, [user])

  const fetchSavedResumes = async () => {
    try {
      setIsLoadingResumes(true)
      const response = await fetch('/api/resumes')
      
      if (response.ok) {
        const data = await response.json()
        setSavedResumes(data.resumes || [])
        console.log('✅ Loaded saved resumes:', data.resumes?.length || 0)
      } else {
        console.error('Failed to fetch resumes')
        toast.error('Failed to load saved resumes')
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
      toast.error('Failed to load saved resumes')
    } finally {
      setIsLoadingResumes(false)
    }
  }

  const handleResumeSelect = (resume: SavedResume) => {
    // Convert HTML to plain text for better tailoring
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = resume.html_content
    const plainText = tempDiv.textContent || tempDiv.innerText || ''
    
    setTailoringInputs(prev => ({
      ...prev,
      resumeContent: plainText,
      selectedResumeId: resume.id
    }))
    
    setShowResumeSelector(false)
    toast.success(`Selected resume: ${resume.title}`)
  }

  const handleManualEntry = () => {
    setShowResumeSelector(false)
    setTailoringInputs(prev => ({
      ...prev,
      resumeContent: '',
      selectedResumeId: ''
    }))
  }

  const handleTailorResume = async (e?: React.FormEvent) => {
    // Prevent form submission and page refresh
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!tailoringInputs.jobTitle || !tailoringInputs.jobDescription || !tailoringInputs.resumeContent) {
      toast.error('Please fill in all required fields')
      return
    }

    // Check if user can use the feature
    if (!canUseFeature('job_tailoring')) {
      toast.error('This feature is not available in your current plan. Please upgrade to continue.')
      return
    }

    setIsTailoring(true)

    try {
      console.log('🚀 Starting resume tailoring...')
      
      // Prepare the data structure expected by the API
      const requestData = {
        resume: {
          id: tailoringInputs.selectedResumeId || 'manual-entry',
          html_content: tailoringInputs.resumeContent
        },
        jobData: {
          jobTitle: tailoringInputs.jobTitle,
          jobDescription: tailoringInputs.jobDescription,
          company: tailoringInputs.companyName,
          keywords: extractKeywords(tailoringInputs.jobDescription),
          requirements: extractRequirements(tailoringInputs.jobDescription)
        }
      }
      
      console.log('📤 Sending tailoring request:', {
        hasResume: !!requestData.resume.html_content,
        resumeLength: requestData.resume.html_content.length,
        jobTitle: requestData.jobData.jobTitle,
        keywordsCount: requestData.jobData.keywords.length
      })
      
      const success = await useAIFeature(
        'job_tailoring',
        () => fetch('/api/tailor-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        }),
        (data) => {
          // Success callback
          setTailoredContent(data.tailoredResume)
          setShowInputForm(false)
          toast.success('Resume tailored successfully!')
          console.log('✅ Resume tailoring completed')
        },
        (error) => {
          // Error callback
          console.error('❌ Error tailoring resume:', error)
          toast.error('Failed to tailor resume. Please try again.')
        }
      )

      if (!success) {
        toast.error('Failed to tailor resume. Please check your plan and try again.')
      }
    } catch (error) {
      console.error('❌ Error tailoring resume:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to tailor resume')
    } finally {
      setIsTailoring(false)
    }
  }

  const extractKeywords = (jobDescription: string): string[] => {
    // Simple keyword extraction - you can enhance this
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'a', 'an', 'this', 'that', 'these', 'those']
    
    const words = jobDescription
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
    
    // Get unique words and their frequency
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Return top keywords
    return Object.entries(wordFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([word]) => word)
  }

  const extractRequirements = (jobDescription: string): string[] => {
    const requirements: string[] = []
    
    // Look for common requirement patterns
    const requirementPatterns = [
      /(?:required|must have|need|should have):?\s*([^.!?]+)/gi,
      /(?:experience with|proficient in|knowledge of):?\s*([^.!?]+)/gi,
      /(?:bachelor|master|degree|certification):?\s*([^.!?]+)/gi
    ]
    
    requirementPatterns.forEach(pattern => {
      const matches = jobDescription.match(pattern)
      if (matches) {
        matches.forEach(match => {
          const cleaned = match.replace(/^(required|must have|need|should have|experience with|proficient in|knowledge of|bachelor|master|degree|certification):?\s*/i, '').trim()
          if (cleaned.length > 5) {
            requirements.push(cleaned)
          }
        })
      }
    })
    
    return requirements.slice(0, 10) // Limit to top 10 requirements
  }

  const handleStartOver = (e?: React.FormEvent) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setShowInputForm(true)
    setTailoredContent('')
    setTailoringInputs({
      jobTitle: '',
      jobDescription: '',
      companyName: '',
      resumeContent: '',
      selectedResumeId: ''
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleTailorResume()
    }
  }

  const handleDownload = () => {
    if (!tailoredContent) return
    
    const blob = new Blob([tailoredContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tailored-resume-${tailoringInputs.jobTitle || 'job'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Resume downloaded successfully!')
  }

  const handleCopyToClipboard = async () => {
    if (!tailoredContent) return
    
    try {
      await navigator.clipboard.writeText(tailoredContent)
      toast.success('Resume HTML copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleDownloadPDF = async () => {
    if (!tailoredContent) return
    
    try {
      console.log('📄 Downloading tailored resume as PDF...')
      
      const response = await fetch('/api/export-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: tailoredContent,
          format: 'pdf',
          filename: `tailored-resume-${tailoringInputs.jobTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'job'}`
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Check if the response is HTML (for client-side printing) or PDF blob
      const contentType = response.headers.get('content-type')
      
      if (contentType?.includes('text/html')) {
        // Open in new window for printing
        const htmlContent = await response.text()
        const printWindow = window.open('', '_blank')
        if (printWindow) {
          printWindow.document.write(htmlContent)
          printWindow.document.close()
          printWindow.focus()
          setTimeout(() => {
            printWindow.print()
          }, 500)
        }
        toast.success('Resume opened for printing!')
      } else {
        // Handle as PDF blob
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tailored-resume-${tailoringInputs.jobTitle?.replace(/[^a-zA-Z0-9]/g, '-') || 'job'}.pdf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success('PDF downloaded successfully!')
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
      toast.error('Failed to download PDF. Please try again.')
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900" data-ai-feature="job-tailoring">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl mb-6 shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Job Tailoring
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Customize your resume for specific job applications with AI-powered optimization
          </p>
        </div>

        {showInputForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 dark:bg-gray-800/70 dark:border-gray-600/20">
              <form onSubmit={handleTailorResume} onKeyDown={handleKeyDown} data-ai-form data-allowed-submit>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Job Information */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <Briefcase className="w-6 h-6 mr-2 text-blue-500" />
                      Job Information
                    </h2>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={tailoringInputs.jobTitle}
                        onChange={(e) => setTailoringInputs(prev => ({ ...prev, jobTitle: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                        placeholder="e.g., Senior Software Engineer"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={tailoringInputs.companyName}
                        onChange={(e) => setTailoringInputs(prev => ({ ...prev, companyName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
                        placeholder="e.g., Google"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Job Description *
                      </label>
                      <textarea
                        value={tailoringInputs.jobDescription}
                        onChange={(e) => setTailoringInputs(prev => ({ ...prev, jobDescription: e.target.value }))}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 resize-none"
                        placeholder="Paste the full job description here..."
                        required
                      />
                    </div>
                  </div>

                  {/* Resume Content */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                      <FileText className="w-6 h-6 mr-2 text-green-500" />
                      Your Resume
                    </h2>
                    
                    {showResumeSelector ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                          Select a Resume from Your History
                        </label>
                        
                        {isLoadingResumes ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading your resumes...</span>
                          </div>
                        ) : savedResumes.length > 0 ? (
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {savedResumes.map((resume) => (
                              <div
                                key={resume.id}
                                onClick={() => handleResumeSelect(resume)}
                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-medium text-gray-900 dark:text-white">
                                      {resume.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      Created: {new Date(resume.created_at).toLocaleDateString()}
                                    </p>
                                    {resume.ats_score && (
                                      <p className="text-sm text-green-600 dark:text-green-400">
                                        ATS Score: {resume.ats_score}%
                                      </p>
                                    )}
                                  </div>
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                              No saved resumes found. Create a resume first to use this feature.
                            </p>
                            <button
                              onClick={() => window.location.href = '/dashboard/create'}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Create Your First Resume →
                            </button>
                          </div>
                        )}
                        
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={handleManualEntry}
                            className="w-full text-center text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Or paste your resume content manually
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {tailoringInputs.selectedResumeId ? 'Selected Resume Content' : 'Resume Content'}
                          </label>
                          <button
                            onClick={() => setShowResumeSelector(true)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Change Resume</span>
                          </button>
                        </div>
                        <textarea
                          value={tailoringInputs.resumeContent}
                          onChange={(e) => setTailoringInputs(prev => ({ ...prev, resumeContent: e.target.value }))}
                          placeholder="Paste your resume content here or select from saved resumes above..."
                          rows={8}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>
                    )}
                    
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                            AI Optimization Tips
                          </h3>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Our AI will analyze the job requirements and optimize your resume by:
                          </p>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                            <li>• Highlighting relevant skills and experience</li>
                            <li>• Adjusting keywords for ATS compatibility</li>
                            <li>• Restructuring content for better impact</li>
                            <li>• Emphasizing achievements that match the role</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-8 text-center">
                  <button
                    type="submit"
                    disabled={isTailoring || !tailoringInputs.jobTitle || !tailoringInputs.jobDescription || !tailoringInputs.resumeContent}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    {isTailoring ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                        Tailoring Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        Tailor My Resume
                      </>
                    )}
                  </button>
                  
                  {/* Keyboard shortcut hint */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Press Ctrl+Enter (Cmd+Enter on Mac) to submit
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 dark:bg-gray-800/70 dark:border-gray-600/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Tailored Resume
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handleStartOver}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
                  >
                    Start Over
                  </button>
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
                {/* Resume Preview */}
                <div className="p-8 bg-white" style={{ minHeight: '800px' }}>
                  <div 
                    className="tailored-resume-content max-w-4xl mx-auto"
                    dangerouslySetInnerHTML={{ __html: tailoredContent }}
                  />
                </div>
              </div>

              {/* Global styles for the resume */}
              <style jsx global>{`
                .tailored-resume-content {
                  font-family: 'Georgia', 'Times New Roman', serif;
                  line-height: 1.6;
                  color: #333;
                  background: white;
                }
                
                .tailored-resume-content h1 {
                  font-size: 2.5rem;
                  font-weight: bold;
                  color: #1a202c;
                  margin-bottom: 0.5rem;
                  text-align: center;
                  border-bottom: 3px solid #3182ce;
                  padding-bottom: 0.5rem;
                }
                
                .tailored-resume-content h2 {
                  font-size: 1.5rem;
                  font-weight: 600;
                  color: #2d3748;
                  margin-top: 2rem;
                  margin-bottom: 1rem;
                  border-bottom: 1px solid #e2e8f0;
                  padding-bottom: 0.25rem;
                }
                
                .tailored-resume-content h3 {
                  font-size: 1.25rem;
                  font-weight: 600;
                  color: #2d3748;
                  margin-top: 1.5rem;
                  margin-bottom: 0.5rem;
                }
                
                .tailored-resume-content .contact-info {
                  text-align: center;
                  margin-bottom: 2rem;
                  padding: 1rem;
                  background: #f7fafc;
                  border-radius: 0.5rem;
                }
                
                .tailored-resume-content .contact-info p {
                  display: inline-block;
                  margin: 0 1rem 0.5rem 0;
                  font-size: 0.9rem;
                  color: #4a5568;
                }
                
                .tailored-resume-content .section {
                  margin-bottom: 2rem;
                }
                
                .tailored-resume-content .professional-summary p {
                  font-size: 1.1rem;
                  line-height: 1.7;
                  color: #2d3748;
                  text-align: justify;
                }
                
                .tailored-resume-content .work-experience .job {
                  margin-bottom: 1.5rem;
                  padding-left: 1rem;
                  border-left: 3px solid #3182ce;
                }
                
                .tailored-resume-content .skills .skill {
                  display: inline-block;
                  background: #3182ce;
                  color: white;
                  padding: 0.25rem 0.75rem;
                  margin: 0.25rem 0.5rem 0.25rem 0;
                  border-radius: 1rem;
                  font-size: 0.875rem;
                  font-weight: 500;
                }
                
                .tailored-resume-content .education .degree {
                  margin-bottom: 1rem;
                  padding-left: 1rem;
                  border-left: 2px solid #38b2ac;
                }
                
                .tailored-resume-content p {
                  margin-bottom: 0.75rem;
                  line-height: 1.6;
                }
                
                .tailored-resume-content ul {
                  margin-left: 1.5rem;
                  margin-bottom: 1rem;
                }
                
                .tailored-resume-content li {
                  margin-bottom: 0.5rem;
                  line-height: 1.6;
                }
                
                /* Print styles */
                @media print {
                  .tailored-resume-content {
                    font-size: 12pt;
                    line-height: 1.4;
                  }
                  .tailored-resume-content h1 {
                    font-size: 18pt;
                  }
                  .tailored-resume-content h2 {
                    font-size: 14pt;
                  }
                }
              `}</style>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setShowInputForm(true)
                    setTailoredContent('')
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Create Another Tailored Resume</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Wrap the main component with credit protection
export default function JobTailoringPage() {
  return (
    <PlanBasedFeatureGuard feature="job_tailoring">
      <JobTailoringPageContent />
    </PlanBasedFeatureGuard>
  )
}
