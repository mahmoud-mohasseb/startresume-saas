"use client"

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Linkedin, Sparkles, Copy, Download, Eye, BarChart3, Star, User, Briefcase, Target,
  CheckCircle, AlertCircle, RefreshCw, Plus, X, MapPin, Building
} from 'lucide-react'
import PlanBasedFeatureGuard from '@/components/PlanBasedFeatureGuard'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { toast } from 'react-hot-toast'

interface LinkedInProfile {
  headline: string
  summary: string
  currentRole: string
  industry: string
  location: string
  skills: string[]
  experience: string[]
  achievements: string[]
}

function LinkedInOptimizerPageContent() {
  const { user } = useUser()
  const { useAIFeature, canUseFeature } = useSubscription()
  const [profile, setProfile] = useState<LinkedInProfile>({
    headline: '', summary: '', currentRole: '', industry: '', location: '', skills: [], experience: [], achievements: []
  })
  const [profileScore, setProfileScore] = useState({ overall: 0, headline: 0, summary: 0, skills: 0, completeness: 0 })
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  const calculateScore = (profileData: LinkedInProfile) => {
    // More accurate headline scoring (optimal length: 50-60 chars)
    const headlineScore = profileData.headline 
      ? profileData.headline.length >= 40 && profileData.headline.length <= 120 
        ? Math.min(100, 60 + (profileData.headline.length - 40) * 2)
        : Math.min(100, profileData.headline.length * 1.5)
      : 0

    // More accurate summary scoring (optimal length: 300-500 chars)
    const summaryScore = profileData.summary 
      ? profileData.summary.length >= 200 && profileData.summary.length <= 600
        ? Math.min(100, 70 + (profileData.summary.length - 200) * 0.075)
        : Math.min(100, profileData.summary.length * 0.2)
      : 0

    // Skills scoring (optimal: 5-15 skills)
    const skillsScore = profileData.skills.length >= 5 && profileData.skills.length <= 15
      ? Math.min(100, 60 + (profileData.skills.length - 5) * 4)
      : Math.min(100, profileData.skills.length * 6)

    // Completeness scoring (all required fields)
    const requiredFields = [profileData.headline, profileData.summary, profileData.currentRole, profileData.industry, profileData.location]
    const filledFields = requiredFields.filter(field => field && field.trim().length > 0).length
    const completenessScore = Math.round((filledFields / requiredFields.length) * 100)

    // Weighted overall score (headline and summary are more important)
    const overall = Math.round((headlineScore * 0.3 + summaryScore * 0.3 + skillsScore * 0.25 + completenessScore * 0.15))
    
    setProfileScore({ 
      overall: Math.min(100, overall), 
      headline: Math.min(100, Math.round(headlineScore)), 
      summary: Math.min(100, Math.round(summaryScore)), 
      skills: Math.min(100, Math.round(skillsScore)), 
      completeness: completenessScore 
    })
  }

  const getRoleSpecificSkills = (role: string) => {
    const skillsMap: { [key: string]: string[] } = {
      'software engineer': ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Git', 'SQL'],
      'data scientist': ['Python', 'R', 'Machine Learning', 'SQL', 'Tableau', 'TensorFlow', 'Statistics'],
      'product manager': ['Product Strategy', 'Roadmap Planning', 'User Research', 'A/B Testing', 'Agile', 'Scrum'],
      'marketing manager': ['Digital Marketing', 'SEO', 'Google Analytics', 'Content Marketing', 'Social Media'],
      'sales manager': ['Sales Strategy', 'CRM', 'Lead Generation', 'Negotiation', 'Account Management'],
      'designer': ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research']
    }
    const roleKey = role.toLowerCase()
    for (const key in skillsMap) {
      if (roleKey.includes(key)) return skillsMap[key]
    }
    return ['Strategic Planning', 'Team Leadership', 'Project Management', 'Communication']
  }

  const generateOptimizedContent = async (type: 'headline' | 'summary' | 'skills') => {
    if (!user) {
      toast.error('Please sign in to optimize LinkedIn content')
      return
    }

    // Validate required fields based on type
    if (type === 'headline' && !profile.currentRole) {
      toast.error('Please enter your current role first')
      return
    }

    if (type === 'summary' && (!profile.currentRole || !profile.industry)) {
      toast.error('Please enter your role and industry first')
      return
    }

    // Check if user can use the feature and consume credit
    if (!canUseFeature('linkedin_optimization')) {
      toast.error('This feature is not available in your current plan. Please upgrade to continue.')
      return
    }

    setIsGenerating(true)

    try {
      const success = await useAIFeature(
        'linkedin_optimization', 
        () => fetch('/api/openai/linkedin-optimize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type,
            currentProfile: profile,
            userContext: {
              role: profile.currentRole,
              industry: profile.industry,
              location: profile.location,
              skills: profile.skills,
              experience: profile.experience
            }
          }),
        }),
        (data) => {
          // Success callback - handle the response data
          if (type === 'skills' && data.suggestions) {
            // Add new skills to existing ones
            const newSkills = [...profile.skills, ...data.suggestions.filter((skill: string) => !profile.skills.includes(skill))]
            setProfile(prev => ({ ...prev, skills: newSkills }))
            toast.success('Skills suggestions added!')
          } else if (data.optimizedContent) {
            // Update the specific field
            setProfile(prev => ({ ...prev, [type]: data.optimizedContent }))
            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} optimized successfully!`)
          }
        },
        (error) => {
          // Error callback
          console.error('LinkedIn optimization error:', error)
          toast.error('Failed to optimize content. Please try again.')
        }
      )

      if (!success) {
        // Handle case where useAIFeature returns false (credit consumption failed, etc.)
        toast.error('Failed to optimize content. Please check your plan and try again.')
      }
    } catch (error) {
      console.error('LinkedIn optimization error:', error)
      toast.error('Failed to optimize content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToPDF = async () => {
    try {
      const response = await fetch('/api/export/linkedin-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile, userName: user?.fullName || 'User' })
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'linkedin-profile-optimized.pdf'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const removeSkill = (index: number) => {
    const newSkills = profile.skills.filter((_, i) => i !== index)
    const updatedProfile = { ...profile, skills: newSkills }
    setProfile(updatedProfile)
    calculateScore(updatedProfile)
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl shadow-lg">
                <Linkedin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">LinkedIn Profile Optimizer</h1>
                <p className="text-gray-600 dark:text-gray-300">Create a role-specific professional LinkedIn profile</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsPreviewMode(!isPreviewMode)} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                <Eye className="h-4 w-4" />
                {isPreviewMode ? 'Edit Mode' : 'Preview'}
              </button>
              <button onClick={exportToPDF} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
            </div>
          </div>
        </motion.div>

        {isPreviewMode ? (
          /* LinkedIn Preview */
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="h-48 bg-gradient-to-r from-blue-600 to-teal-600"></div>
              <div className="relative px-8 pb-8">
                <div className="absolute -top-16 left-8">
                  <div className="w-32 h-32 bg-gray-300 dark:bg-gray-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-500" />
                  </div>
                </div>
                <div className="pt-20">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user?.fullName || 'Your Name'}</h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">{profile.headline || 'Your professional headline'}</p>
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mb-6">
                    {profile.location && <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /><span>{profile.location}</span></div>}
                    {profile.industry && <div className="flex items-center gap-1"><Building className="w-4 h-4" /><span>{profile.industry}</span></div>}
                  </div>
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About</h2>
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{profile.summary || 'Your professional summary'}</div>
                  </div>
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, index) => (
                        <span key={index} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Strength</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-blue-600">{profileScore.overall}%</div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                          <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${profileScore.overall}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Edit Mode - Create Page Style */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Role & Industry */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Role & Industry</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <input type="text" placeholder="Current Role" value={profile.currentRole} onChange={(e) => { const newProfile = { ...profile, currentRole: e.target.value }; setProfile(newProfile); calculateScore(newProfile) }} className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400" />
                  <input type="text" placeholder="Industry" value={profile.industry} onChange={(e) => { const newProfile = { ...profile, industry: e.target.value }; setProfile(newProfile); calculateScore(newProfile) }} className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400" />
                  <input type="text" placeholder="Location" value={profile.location} onChange={(e) => { const newProfile = { ...profile, location: e.target.value }; setProfile(newProfile); calculateScore(newProfile) }} className="md:col-span-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400" />
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Professional Headline</h2>
                  </div>
                  <button onClick={() => generateOptimizedContent('headline')} disabled={isGenerating || !profile.currentRole} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
                    <Sparkles className="w-4 h-4" />
                    <span>{isGenerating ? 'Optimizing...' : 'AI Optimize'}</span>
                  </button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <textarea placeholder="Professional headline" value={profile.headline} onChange={(e) => { const newProfile = { ...profile, headline: e.target.value }; setProfile(newProfile); calculateScore(newProfile) }} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 resize-none" />
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{profile.headline.length}/220</span>
                    <button onClick={() => copyToClipboard(profile.headline)} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Copy className="h-4 w-4" />Copy
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Summary */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Professional Summary</h2>
                  </div>
                  <button onClick={() => generateOptimizedContent('summary')} disabled={isGenerating || !profile.currentRole} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
                    <Sparkles className="w-4 h-4" />
                    <span>{isGenerating ? 'Optimizing...' : 'AI Optimize'}</span>
                  </button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <textarea placeholder="Professional summary" value={profile.summary} onChange={(e) => { const newProfile = { ...profile, summary: e.target.value }; setProfile(newProfile); calculateScore(newProfile) }} rows={8} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 resize-none" />
                  <div className="flex items-center justify-between mt-2 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{profile.summary.length}/2000</span>
                    <button onClick={() => copyToClipboard(profile.summary)} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      <Copy className="h-4 w-4" />Copy
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Skills */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Professional Skills</h2>
                  </div>
                  <button onClick={() => generateOptimizedContent('skills')} disabled={isGenerating || !profile.currentRole} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50">
                    <Sparkles className="w-4 h-4" />
                    <span>{isGenerating ? 'Adding...' : 'AI Add Skills'}</span>
                  </button>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <div key={index} className="flex items-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg text-sm">
                        <span>{skill}</span>
                        <button onClick={() => removeSkill(index)} className="ml-2 text-blue-600 hover:text-blue-800">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Score Panel */}
            <div className="space-y-6">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Profile Score
                </h3>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 mb-2">{profileScore.overall}%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {profileScore.overall >= 80 ? 'Excellent' : profileScore.overall >= 60 ? 'Good' : 'Needs Work'}
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Headline', score: profileScore.headline, icon: Target },
                    { label: 'Summary', score: profileScore.summary, icon: User },
                    { label: 'Skills', score: profileScore.skills, icon: Star },
                    { label: 'Complete', score: profileScore.completeness, icon: CheckCircle }
                  ].map(item => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${item.score}%` }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white w-8">{item.score}%</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LinkedInOptimizerPage() {
  return (
    <PlanBasedFeatureGuard feature="linkedin_optimization">
      <LinkedInOptimizerPageContent />
    </PlanBasedFeatureGuard>
  )
}
