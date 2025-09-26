"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import { 
  Linkedin, 
  Sparkles, 
  Target, 
  Users, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Share2, 
  Award, 
  Briefcase, 
  GraduationCap, 
  Star, 
  Copy, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  BarChart3,
  User,
  Globe,
  Camera,
  Edit3,
  Zap
} from 'lucide-react'

interface LinkedInProfile {
  headline: string
  summary: string
  experience: Array<{
    title: string
    company: string
    description: string
    duration: string
  }>
  skills: string[]
  education: Array<{
    school: string
    degree: string
    field: string
  }>
  achievements: string[]
}

interface OptimizationSuggestion {
  id: string
  category: 'headline' | 'summary' | 'experience' | 'skills' | 'general'
  type: 'improvement' | 'addition' | 'optimization'
  title: string
  description: string
  suggestion: string
  impact: 'high' | 'medium' | 'low'
  priority: number
  applied: boolean
}

export default function LinkedInOptimizationPage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<LinkedInProfile>({
    headline: '',
    summary: '',
    experience: [],
    skills: [],
    education: [],
    achievements: []
  })
  
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [optimizationScore, setOptimizationScore] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<'profile' | 'suggestions' | 'analytics'>('profile')

  // Load profile data from resume inputs or saved data
  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    try {
      // Try to load from saved LinkedIn profile or resume data
      const savedProfile = localStorage.getItem('linkedinProfile')
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile))
      }
    } catch (error) {
      console.error('Error loading profile data:', error)
    }
  }

  const analyzeProfile = async () => {
    if (!profile.headline && !profile.summary) {
      toast.error('Please fill in at least your headline and summary to analyze')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/linkedin/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile })
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      setSuggestions(data.suggestions || [])
      setOptimizationScore(data.score || 0)
      toast.success('Profile analysis complete!')
    } catch (error) {
      console.error('Analysis error:', error)
      toast.error('Failed to analyze profile. Please try again.')
      
      // Fallback to mock suggestions for demo
      generateMockSuggestions()
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateMockSuggestions = () => {
    const mockSuggestions: OptimizationSuggestion[] = [
      {
        id: '1',
        category: 'headline',
        type: 'optimization',
        title: 'Optimize Your Headline',
        description: 'Your headline should include keywords and value proposition',
        suggestion: `${profile.headline || 'Senior Software Engineer'} | Building Scalable Solutions | React & Node.js Expert | Helping Teams Deliver High-Quality Products`,
        impact: 'high',
        priority: 1,
        applied: false
      },
      {
        id: '2',
        category: 'summary',
        type: 'improvement',
        title: 'Enhance Your Summary',
        description: 'Add specific achievements and quantifiable results',
        suggestion: 'Results-driven professional with 5+ years of experience delivering high-impact solutions. Led cross-functional teams to increase productivity by 40% and reduced system downtime by 60%. Passionate about leveraging technology to solve complex business challenges.',
        impact: 'high',
        priority: 2,
        applied: false
      },
      {
        id: '3',
        category: 'skills',
        type: 'addition',
        title: 'Add Trending Skills',
        description: 'Include in-demand skills relevant to your industry',
        suggestion: 'AI/Machine Learning, Cloud Architecture, DevOps, Agile Methodologies, Data Analysis',
        impact: 'medium',
        priority: 3,
        applied: false
      }
    ]
    setSuggestions(mockSuggestions)
    setOptimizationScore(72)
  }

  const applySuggestion = (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return

    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId ? { ...s, applied: true } : s)
    )

    // Apply the suggestion to the profile
    if (suggestion.category === 'headline') {
      setProfile(prev => ({ ...prev, headline: suggestion.suggestion }))
    } else if (suggestion.category === 'summary') {
      setProfile(prev => ({ ...prev, summary: suggestion.suggestion }))
    } else if (suggestion.category === 'skills') {
      const newSkills = suggestion.suggestion.split(', ')
      setProfile(prev => ({ 
        ...prev, 
        skills: [...new Set([...prev.skills, ...newSkills])]
      }))
    }

    toast.success('Suggestion applied!')
    
    // Recalculate optimization score
    const appliedCount = suggestions.filter(s => s.applied || s.id === suggestionId).length
    const newScore = Math.min(100, optimizationScore + (suggestion.impact === 'high' ? 15 : suggestion.impact === 'medium' ? 10 : 5))
    setOptimizationScore(newScore)
  }

  const generateContent = async (type: 'headline' | 'summary' | 'post') => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/linkedin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          profile,
          context: {
            industry: 'Technology',
            experience: profile.experience.length,
            skills: profile.skills
          }
        })
      })

      if (!response.ok) throw new Error('Generation failed')

      const data = await response.json()
      
      if (type === 'headline') {
        setProfile(prev => ({ ...prev, headline: data.content }))
      } else if (type === 'summary') {
        setProfile(prev => ({ ...prev, summary: data.content }))
      }
      
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully!`)
    } catch (error) {
      console.error('Generation error:', error)
      toast.error('Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveProfile = () => {
    try {
      localStorage.setItem('linkedinProfile', JSON.stringify(profile))
      toast.success('Profile saved successfully!')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save profile')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Linkedin className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              LinkedIn Profile Optimizer
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Optimize your LinkedIn profile with AI-powered suggestions to increase visibility and engagement
          </p>
        </motion.div>

        {/* Optimization Score */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Profile Optimization Score
              </h2>
              <button
                onClick={analyzeProfile}
                disabled={isAnalyzing}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isAnalyzing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <BarChart3 className="w-4 h-4" />
                )}
                {isAnalyzing ? 'Analyzing...' : 'Analyze Profile'}
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold ${getScoreColor(optimizationScore)}`}>
                {optimizationScore}%
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      optimizationScore >= 80 ? 'bg-green-500' : 
                      optimizationScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${optimizationScore}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {optimizationScore >= 80 ? 'Excellent! Your profile is well-optimized.' :
                   optimizationScore >= 60 ? 'Good! A few improvements can boost your visibility.' :
                   'Needs improvement. Follow the suggestions below to optimize your profile.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-lg border border-gray-200 dark:border-gray-600">
              <div className="flex gap-2">
                {[
                  { id: 'profile', label: 'Profile Editor', icon: User },
                  { id: 'suggestions', label: 'AI Suggestions', icon: Sparkles },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 }
                ].map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Profile Editor Tab */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Headline Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  Professional Headline
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateContent('headline')}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Generate with AI
                  </button>
                  <button
                    onClick={() => copyToClipboard(profile.headline)}
                    className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>
              <textarea
                value={profile.headline}
                onChange={(e) => setProfile(prev => ({ ...prev, headline: e.target.value }))}
                placeholder="e.g., Senior Software Engineer | Full-Stack Developer | React & Node.js Expert"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={2}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Your headline appears under your name and should include your role, key skills, and value proposition.
              </p>
            </div>

            {/* Summary Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Professional Summary
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateContent('summary')}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors text-sm"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    Generate with AI
                  </button>
                  <button
                    onClick={() => copyToClipboard(profile.summary)}
                    className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>
              <textarea
                value={profile.summary}
                onChange={(e) => setProfile(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Write a compelling summary that highlights your experience, achievements, and career goals..."
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                rows={6}
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Your summary should tell your professional story, highlight key achievements, and include relevant keywords.
              </p>
            </div>

            {/* Skills Section */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-yellow-600" />
                Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                    <button
                      onClick={() => {
                        setProfile(prev => ({
                          ...prev,
                          skills: prev.skills.filter((_, i) => i !== index)
                        }))
                      }}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill..."
                  className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      if (input.value.trim() && !profile.skills.includes(input.value.trim())) {
                        setProfile(prev => ({
                          ...prev,
                          skills: [...prev.skills, input.value.trim()]
                        }))
                        input.value = ''
                      }
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const trendingSkills = ['AI/ML', 'Cloud Computing', 'DevOps', 'Data Analysis', 'Agile', 'Leadership']
                    const newSkills = trendingSkills.filter(skill => !profile.skills.includes(skill))
                    if (newSkills.length > 0) {
                      setProfile(prev => ({
                        ...prev,
                        skills: [...prev.skills, ...newSkills.slice(0, 3)]
                      }))
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Trending
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center">
              <button
                onClick={saveProfile}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <CheckCircle className="w-5 h-5" />
                Save Profile
              </button>
            </div>
          </motion.div>
        )}

        {/* AI Suggestions Tab */}
        {activeTab === 'suggestions' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Category Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter Suggestions</h3>
              <div className="flex flex-wrap gap-2">
                {['all', 'headline', 'summary', 'skills', 'experience', 'general'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Suggestions List */}
            <div className="space-y-4">
              {filteredSuggestions.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-600 text-center">
                  <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No suggestions yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Fill in your profile information and click "Analyze Profile" to get AI-powered suggestions.
                  </p>
                  <button
                    onClick={analyzeProfile}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Analyze Profile Now
                  </button>
                </div>
              ) : (
                filteredSuggestions
                  .sort((a, b) => b.priority - a.priority)
                  .map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border transition-all ${
                        suggestion.applied
                          ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              suggestion.impact === 'high' ? 'bg-red-100 text-red-600' :
                              suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {suggestion.impact === 'high' ? <Zap className="w-4 h-4" /> :
                               suggestion.impact === 'medium' ? <TrendingUp className="w-4 h-4" /> :
                               <Lightbulb className="w-4 h-4" />}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                {suggestion.title}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {suggestion.description}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            suggestion.impact === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {suggestion.impact.toUpperCase()} IMPACT
                          </span>
                          {suggestion.applied && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {suggestion.suggestion}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                          {suggestion.category}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(suggestion.suggestion)}
                            className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                          >
                            <Copy className="w-4 h-4" />
                            Copy
                          </button>
                          {!suggestion.applied && (
                            <button
                              onClick={() => applySuggestion(suggestion.id)}
                              className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Apply
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </motion.div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Profile Completeness */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Profile Completeness</h3>
              <div className="space-y-4">
                {[
                  { label: 'Professional Headline', completed: !!profile.headline, weight: 20 },
                  { label: 'Summary', completed: !!profile.summary, weight: 25 },
                  { label: 'Skills (5+)', completed: profile.skills.length >= 5, weight: 20 },
                  { label: 'Experience', completed: profile.experience.length > 0, weight: 20 },
                  { label: 'Education', completed: profile.education.length > 0, weight: 15 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {item.weight}% weight
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Optimization Tips */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Optimization Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    icon: Eye,
                    title: 'Increase Profile Views',
                    tip: 'Use industry keywords in your headline and summary'
                  },
                  {
                    icon: Users,
                    title: 'Build Network',
                    tip: 'Connect with colleagues and industry professionals'
                  },
                  {
                    icon: Share2,
                    title: 'Share Content',
                    tip: 'Post industry insights and engage with others\' content'
                  },
                  {
                    icon: Star,
                    title: 'Get Recommendations',
                    tip: 'Ask colleagues for recommendations and endorsements'
                  }
                ].map((tip, index) => {
                  const Icon = tip.icon
                  return (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {tip.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          {tip.tip}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
