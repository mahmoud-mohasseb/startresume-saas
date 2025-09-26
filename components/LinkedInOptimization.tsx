"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Linkedin, 
  User, 
  Eye, 
  TrendingUp, 
  Star,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Copy,
  RefreshCw,
  Target,
  Users,
  MessageSquare,
  Award,
  Briefcase
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface LinkedInProfile {
  headline: string
  summary: string
  experience: string[]
  skills: string[]
  achievements: string[]
  currentRole: string
  industry: string
}

interface OptimizationSuggestion {
  id: string
  category: 'headline' | 'summary' | 'experience' | 'skills' | 'engagement' | 'network'
  title: string
  description: string
  suggestion: string
  impact: 'high' | 'medium' | 'low'
  difficulty: 'easy' | 'medium' | 'hard'
  priority: number
}

interface ProfileScore {
  overall: number
  headline: number
  summary: number
  experience: number
  skills: number
  engagement: number
  completeness: number
}

const OPTIMIZATION_CATEGORIES = [
  { id: 'headline', label: 'Headline', icon: Target, color: 'blue' },
  { id: 'summary', label: 'Summary', icon: User, color: 'green' },
  { id: 'experience', label: 'Experience', icon: Briefcase, color: 'purple' },
  { id: 'skills', label: 'Skills', icon: Star, color: 'yellow' },
  { id: 'engagement', label: 'Engagement', icon: MessageSquare, color: 'pink' },
  { id: 'network', label: 'Network', icon: Users, color: 'indigo' }
]

export default function LinkedInOptimization() {
  const [profile, setProfile] = useState<LinkedInProfile>({
    headline: '',
    summary: '',
    experience: [],
    skills: [],
    achievements: [],
    currentRole: '',
    industry: ''
  })
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([])
  const [profileScore, setProfileScore] = useState<ProfileScore>({
    overall: 0,
    headline: 0,
    summary: 0,
    experience: 0,
    skills: 0,
    engagement: 0,
    completeness: 0
  })
  const [activeTab, setActiveTab] = useState<'profile' | 'suggestions' | 'score'>('profile')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Load profile from localStorage or resume data
  useEffect(() => {
    loadProfileData()
  }, [])

  const loadProfileData = async () => {
    // Try to load from localStorage first
    const savedProfile = localStorage.getItem('linkedinProfile')
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
      return
    }

    // Try to load from recent resume data via API
    try {
      const response = await fetch('/api/resumes')
      if (response.ok) {
        const data = await response.json()
        const resumes = data.resumes || []
        
        if (resumes.length > 0) {
          const latestResume = resumes[0]
          const resumeData = latestResume.json_content
          
          if (resumeData) {
            setProfile({
              headline: resumeData.personalInfo?.title || '',
              summary: resumeData.personalInfo?.summary || '',
              experience: resumeData.experience?.map((exp: any) => `${exp.position} at ${exp.company}`) || [],
              skills: resumeData.skills || [],
              achievements: resumeData.achievements || [],
              currentRole: resumeData.personalInfo?.title || '',
              industry: resumeData.personalInfo?.industry || ''
            })
            return
          }
        }
      }
    } catch (error) {
      console.error('Failed to load resume data:', error)
    }

    // Fallback to localStorage resume data
    const resumeData = localStorage.getItem('currentResumeData')
    if (resumeData) {
      const data = JSON.parse(resumeData)
      setProfile({
        headline: data.personalInfo?.title || '',
        summary: data.personalInfo?.summary || '',
        experience: data.experience?.map((exp: any) => `${exp.position} at ${exp.company}`) || [],
        skills: data.skills || [],
        achievements: data.achievements || [],
        currentRole: data.personalInfo?.title || '',
        industry: ''
      })
    }
  }

  const saveProfile = (updatedProfile: LinkedInProfile) => {
    setProfile(updatedProfile)
    localStorage.setItem('linkedinProfile', JSON.stringify(updatedProfile))
  }

  const analyzeProfile = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate API call for profile analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Calculate scores based on profile completeness and quality
      const scores = calculateProfileScores(profile)
      setProfileScore(scores)
      
      // Generate suggestions
      const newSuggestions = generateOptimizationSuggestions(profile, scores)
      setSuggestions(newSuggestions)
      
      toast.success('Profile analysis completed!')
    } catch (error) {
      toast.error('Failed to analyze profile')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateProfileScores = (profile: LinkedInProfile): ProfileScore => {
    const headlineScore = profile.headline ? Math.min(100, profile.headline.length * 2) : 0
    const summaryScore = profile.summary ? Math.min(100, profile.summary.length / 5) : 0
    const experienceScore = Math.min(100, profile.experience.length * 25)
    const skillsScore = Math.min(100, profile.skills.length * 10)
    const completenessScore = [
      profile.headline,
      profile.summary,
      profile.currentRole,
      profile.industry
    ].filter(Boolean).length * 25

    const overall = Math.round(
      (headlineScore + summaryScore + experienceScore + skillsScore + completenessScore) / 5
    )

    return {
      overall,
      headline: headlineScore,
      summary: summaryScore,
      experience: experienceScore,
      skills: skillsScore,
      engagement: 75, // Simulated
      completeness: completenessScore
    }
  }

  const generateOptimizationSuggestions = (profile: LinkedInProfile, scores: ProfileScore): OptimizationSuggestion[] => {
    const suggestions: OptimizationSuggestion[] = []

    // Headline suggestions
    if (scores.headline < 80) {
      suggestions.push({
        id: 'headline-1',
        category: 'headline',
        title: 'Optimize Your Headline',
        description: 'Your headline is the first thing people see. Make it compelling and keyword-rich.',
        suggestion: `${profile.currentRole || 'Professional'} | ${profile.industry || 'Industry Expert'} | Driving Results Through Innovation`,
        impact: 'high',
        difficulty: 'easy',
        priority: 1
      })
    }

    // Summary suggestions
    if (scores.summary < 70) {
      suggestions.push({
        id: 'summary-1',
        category: 'summary',
        title: 'Enhance Your Summary',
        description: 'A strong summary showcases your value proposition and achievements.',
        suggestion: 'Experienced professional with proven track record of delivering exceptional results. Skilled in strategic planning, team leadership, and driving organizational growth. Passionate about innovation and continuous improvement.',
        impact: 'high',
        difficulty: 'medium',
        priority: 2
      })
    }

    // Skills suggestions
    if (scores.skills < 80) {
      const skillSuggestions = [
        'Strategic Planning', 'Leadership', 'Project Management', 'Data Analysis',
        'Digital Marketing', 'Business Development', 'Team Management', 'Process Improvement'
      ]
      
      suggestions.push({
        id: 'skills-1',
        category: 'skills',
        title: 'Add Relevant Skills',
        description: 'Skills help you appear in more searches and showcase your expertise.',
        suggestion: skillSuggestions.filter(skill => !profile.skills.includes(skill)).slice(0, 5).join(', '),
        impact: 'medium',
        difficulty: 'easy',
        priority: 3
      })
    }

    // Engagement suggestions
    suggestions.push({
      id: 'engagement-1',
      category: 'engagement',
      title: 'Increase Profile Engagement',
      description: 'Regular posting and engagement boost your visibility.',
      suggestion: 'Share industry insights, comment on posts in your field, and publish articles about your expertise.',
      impact: 'medium',
      difficulty: 'medium',
      priority: 4
    })

    return suggestions.sort((a, b) => a.priority - b.priority)
  }

  const generateContent = async (type: 'headline' | 'summary') => {
    setIsGenerating(true)
    
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      let generatedContent = ''
      
      if (type === 'headline') {
        const headlines = [
          `${profile.currentRole || 'Senior Professional'} | ${profile.industry || 'Industry'} Expert | Driving Growth & Innovation`,
          `Experienced ${profile.currentRole || 'Leader'} | Strategic Thinker | Results-Driven Professional`,
          `${profile.currentRole || 'Executive'} | Transforming Businesses Through Strategic Leadership`
        ]
        generatedContent = headlines[Math.floor(Math.random() * headlines.length)]
      } else {
        generatedContent = `Accomplished ${profile.currentRole || 'professional'} with extensive experience in ${profile.industry || 'various industries'}. Proven track record of driving organizational growth, leading high-performing teams, and delivering exceptional results. Passionate about innovation, strategic planning, and creating value for stakeholders. Committed to continuous learning and professional development.`
      }
      
      const updatedProfile = {
        ...profile,
        [type]: generatedContent
      }
      
      saveProfile(updatedProfile)
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully!`)
    } catch (error) {
      toast.error(`Failed to generate ${type}`)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateSkillsSuggestions = async () => {
    setIsGenerating(true)
    
    try {
      // First try AI-powered generation
      const response = await fetch('/api/linkedin/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'skills',
          profile,
          targetRole: profile.currentRole,
          industry: profile.industry
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const newSkills = data.content.split(', ').filter((skill: string) => 
          skill.trim() && !profile.skills.includes(skill.trim())
        )
        
        const updatedProfile = {
          ...profile,
          skills: [...profile.skills, ...newSkills.slice(0, 10)]
        }
        
        saveProfile(updatedProfile)
        toast.success(`Added ${newSkills.length} new skills!`)
        return
      }
    } catch (error) {
      console.warn('AI skills generation failed, using fallback:', error)
    }

    // Fallback: Generate role and industry-specific skills
    const roleBasedSkills = getRoleBasedSkills(profile.currentRole)
    const industryBasedSkills = getIndustryBasedSkills(profile.industry)
    const generalSkills = [
      'Strategic Planning', 'Leadership', 'Project Management', 'Data Analysis',
      'Communication', 'Problem Solving', 'Team Management', 'Process Improvement',
      'Digital Transformation', 'Innovation', 'Customer Focus', 'Agile Methodology'
    ]

    // Combine and filter skills
    const allSuggestedSkills = [
      ...roleBasedSkills,
      ...industryBasedSkills,
      ...generalSkills
    ].filter((skill, index, arr) => 
      arr.indexOf(skill) === index && // Remove duplicates
      !profile.skills.includes(skill) // Don't include existing skills
    )

    const newSkills = allSuggestedSkills.slice(0, 8)
    
    const updatedProfile = {
      ...profile,
      skills: [...profile.skills, ...newSkills]
    }
    
    saveProfile(updatedProfile)
    toast.success(`Added ${newSkills.length} role & industry-specific skills!`)
    setIsGenerating(false)
  }

  // Get skills based on role/position
  const getRoleBasedSkills = (role: string): string[] => {
    const roleKey = role.toLowerCase()
    
    if (roleKey.includes('software') || roleKey.includes('developer') || roleKey.includes('engineer')) {
      return [
        'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git',
        'API Development', 'Cloud Computing', 'DevOps', 'Agile Development',
        'System Design', 'Database Management', 'Testing', 'CI/CD'
      ]
    }
    
    if (roleKey.includes('marketing') || roleKey.includes('digital marketing')) {
      return [
        'Digital Marketing', 'SEO/SEM', 'Social Media Marketing', 'Content Marketing',
        'Google Analytics', 'Email Marketing', 'PPC Advertising', 'Marketing Automation',
        'Brand Management', 'Campaign Management', 'A/B Testing', 'Lead Generation'
      ]
    }
    
    if (roleKey.includes('sales') || roleKey.includes('business development')) {
      return [
        'Sales Strategy', 'Lead Generation', 'CRM Management', 'Negotiation',
        'Account Management', 'Pipeline Management', 'Customer Acquisition',
        'Relationship Building', 'Market Research', 'Proposal Writing'
      ]
    }
    
    if (roleKey.includes('manager') || roleKey.includes('director') || roleKey.includes('executive')) {
      return [
        'Strategic Planning', 'Team Leadership', 'Budget Management', 'Performance Management',
        'Change Management', 'Stakeholder Management', 'Decision Making',
        'Organizational Development', 'Talent Management', 'Cross-functional Collaboration'
      ]
    }
    
    if (roleKey.includes('data') || roleKey.includes('analyst') || roleKey.includes('scientist')) {
      return [
        'Data Analysis', 'SQL', 'Python', 'R', 'Tableau', 'Power BI',
        'Statistical Analysis', 'Machine Learning', 'Data Visualization',
        'Excel', 'Business Intelligence', 'Predictive Analytics'
      ]
    }
    
    if (roleKey.includes('design') || roleKey.includes('ux') || roleKey.includes('ui')) {
      return [
        'UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Prototyping',
        'User Research', 'Wireframing', 'Design Systems', 'Usability Testing',
        'Visual Design', 'Interaction Design', 'Design Thinking'
      ]
    }
    
    if (roleKey.includes('hr') || roleKey.includes('human resources')) {
      return [
        'Talent Acquisition', 'Employee Relations', 'Performance Management',
        'Compensation & Benefits', 'Training & Development', 'HR Analytics',
        'Employment Law', 'Organizational Development', 'Conflict Resolution'
      ]
    }
    
    if (roleKey.includes('finance') || roleKey.includes('accounting')) {
      return [
        'Financial Analysis', 'Budgeting & Forecasting', 'Financial Modeling',
        'Excel', 'SAP', 'QuickBooks', 'Risk Management', 'Compliance',
        'Financial Reporting', 'Cost Analysis', 'Investment Analysis'
      ]
    }
    
    return []
  }

  // Get skills based on industry
  const getIndustryBasedSkills = (industry: string): string[] => {
    const industryKey = industry.toLowerCase()
    
    if (industryKey.includes('technology') || industryKey.includes('tech') || industryKey.includes('software')) {
      return [
        'Cloud Computing', 'Artificial Intelligence', 'Machine Learning',
        'Cybersecurity', 'DevOps', 'API Integration', 'Microservices',
        'Digital Transformation', 'SaaS', 'Mobile Development'
      ]
    }
    
    if (industryKey.includes('finance') || industryKey.includes('banking') || industryKey.includes('fintech')) {
      return [
        'Risk Management', 'Regulatory Compliance', 'Financial Modeling',
        'Investment Analysis', 'Portfolio Management', 'Trading',
        'Blockchain', 'Cryptocurrency', 'Financial Planning', 'Audit'
      ]
    }
    
    if (industryKey.includes('healthcare') || industryKey.includes('medical') || industryKey.includes('pharma')) {
      return [
        'Healthcare Management', 'Clinical Research', 'Regulatory Affairs',
        'Medical Device', 'Patient Care', 'Healthcare Analytics',
        'HIPAA Compliance', 'Electronic Health Records', 'Quality Assurance'
      ]
    }
    
    if (industryKey.includes('retail') || industryKey.includes('ecommerce') || industryKey.includes('e-commerce')) {
      return [
        'E-commerce', 'Inventory Management', 'Supply Chain', 'Customer Experience',
        'Merchandising', 'Retail Analytics', 'Point of Sale', 'Omnichannel',
        'Customer Service', 'Vendor Management'
      ]
    }
    
    if (industryKey.includes('manufacturing') || industryKey.includes('industrial')) {
      return [
        'Lean Manufacturing', 'Six Sigma', 'Quality Control', 'Supply Chain Management',
        'Process Optimization', 'Safety Management', 'Production Planning',
        'Equipment Maintenance', 'ISO Standards', 'Continuous Improvement'
      ]
    }
    
    if (industryKey.includes('education') || industryKey.includes('academic')) {
      return [
        'Curriculum Development', 'Educational Technology', 'Learning Management Systems',
        'Student Assessment', 'Instructional Design', 'Online Learning',
        'Educational Research', 'Classroom Management', 'Academic Administration'
      ]
    }
    
    if (industryKey.includes('consulting') || industryKey.includes('advisory')) {
      return [
        'Management Consulting', 'Business Analysis', 'Strategy Development',
        'Process Improvement', 'Change Management', 'Client Management',
        'Problem Solving', 'Presentation Skills', 'Research & Analysis'
      ]
    }
    
    if (industryKey.includes('media') || industryKey.includes('advertising') || industryKey.includes('creative')) {
      return [
        'Content Creation', 'Social Media Management', 'Brand Strategy',
        'Creative Direction', 'Video Production', 'Graphic Design',
        'Digital Advertising', 'Public Relations', 'Content Strategy'
      ]
    }
    
    return []
  }

  const applySuggestion = (suggestion: OptimizationSuggestion) => {
    let updatedProfile = { ...profile }
    
    switch (suggestion.category) {
      case 'headline':
        updatedProfile.headline = suggestion.suggestion
        break
      case 'summary':
        updatedProfile.summary = suggestion.suggestion
        break
      case 'skills':
        const newSkills = suggestion.suggestion.split(', ').filter(skill => 
          !profile.skills.includes(skill)
        )
        updatedProfile.skills = [...profile.skills, ...newSkills]
        break
    }
    
    saveProfile(updatedProfile)
    toast.success('Suggestion applied!')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
        <div className="flex items-center space-x-3 mb-4">
          <Linkedin className="w-8 h-8" />
          <h1 className="text-3xl font-bold">LinkedIn Profile Optimization</h1>
        </div>
        <p className="text-blue-100 mb-6">Optimize your LinkedIn profile to attract opportunities and build your professional brand</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{profileScore.overall}%</div>
            <div className="text-sm text-blue-100">Overall Score</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{suggestions.length}</div>
            <div className="text-sm text-blue-100">Suggestions</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{profileScore.completeness}%</div>
            <div className="text-sm text-blue-100">Completeness</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'profile', label: 'Profile Editor', icon: User },
          { id: 'suggestions', label: 'Suggestions', icon: Lightbulb },
          { id: 'score', label: 'Score Analysis', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Profile Editor</h2>
                <button
                  onClick={analyzeProfile}
                  disabled={isAnalyzing}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Profile'}</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Headline */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Professional Headline</label>
                    <button
                      onClick={() => generateContent('headline')}
                      disabled={isGenerating}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <Star className="w-4 h-4" />
                      <span>Generate AI Headline</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={profile.headline}
                      onChange={(e) => saveProfile({ ...profile, headline: e.target.value })}
                      placeholder="e.g., Senior Software Engineer | Full-Stack Developer | Tech Innovation Leader"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => copyToClipboard(profile.headline)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {profile.headline.length}/220 characters
                  </p>
                </div>

                {/* Summary */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Professional Summary</label>
                    <button
                      onClick={() => generateContent('summary')}
                      disabled={isGenerating}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <Star className="w-4 h-4" />
                      <span>Generate AI Summary</span>
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      value={profile.summary}
                      onChange={(e) => saveProfile({ ...profile, summary: e.target.value })}
                      placeholder="Write a compelling summary that highlights your expertise, achievements, and value proposition..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    <button
                      onClick={() => copyToClipboard(profile.summary)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {profile.summary.length}/2000 characters
                  </p>
                </div>

                {/* Current Role & Industry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
                    <input
                      type="text"
                      value={profile.currentRole}
                      onChange={(e) => saveProfile({ ...profile, currentRole: e.target.value })}
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <input
                      type="text"
                      value={profile.industry}
                      onChange={(e) => saveProfile({ ...profile, industry: e.target.value })}
                      placeholder="e.g., Technology, Finance, Healthcare"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 py-1 px-2 rounded-md">{skill}</span>
                    ))}
                  </div>
                  <button
                    onClick={generateSkillsSuggestions}
                    disabled={isGenerating}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1 mt-2"
                  >
                    <Star className="w-4 h-4" />
                    <span>Generate AI Skills</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'suggestions' && (
          <motion.div
            key="suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Optimization Suggestions</h2>
              <span className="text-sm text-gray-500">{suggestions.length} suggestions available</span>
            </div>

            <div className="grid gap-6">
              {suggestions.map(suggestion => {
                const categoryInfo = OPTIMIZATION_CATEGORIES.find(cat => cat.id === suggestion.category)
                const CategoryIcon = categoryInfo?.icon || Target
                
                return (
                  <div key={suggestion.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${categoryInfo?.color}-100`}>
                          <CategoryIcon className={`w-5 h-5 text-${categoryInfo?.color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{suggestion.title}</h3>
                          <p className="text-sm text-gray-600">{suggestion.description}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(suggestion.impact)}`}>
                          {suggestion.impact} impact
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {suggestion.difficulty}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700 font-medium mb-2">Suggested Content:</p>
                      <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => applySuggestion(suggestion)}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Apply Suggestion</span>
                      </button>
                      <button
                        onClick={() => copyToClipboard(suggestion.suggestion)}
                        className="flex items-center space-x-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
