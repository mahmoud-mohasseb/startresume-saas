"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import PlanBasedFeatureGuard from '@/components/PlanBasedFeatureGuard'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { 
  User, 
  Target, 
  Sparkles, 
  TrendingUp, 
  Eye, 
  MessageSquare,
  Share2,
  Download,
  Loader2,
  CheckCircle,
  Star,
  Lightbulb,
  Users,
  Globe,
  ArrowRight,
  RefreshCw
} from 'lucide-react'

interface BrandAnalysis {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  brandScore: number
}

interface BrandStrategy {
  positioning: string
  valueProposition: string
  targetAudience: string
  keyMessages: string[]
  contentPillars: string[]
  actionPlan: string[]
}

// Move BrandAssessmentStep outside the main component to prevent re-mounting
const BrandAssessmentStep = ({ 
  brandData, 
  setBrandData, 
  isAnalyzing, 
  handleAnalyze 
}: {
  brandData: any
  setBrandData: React.Dispatch<React.SetStateAction<any>>
  isAnalyzing: boolean
  handleAnalyze: () => void
}) => (
  <div className="space-y-6">
    <div className="text-center">
      <User className="w-16 h-16 text-blue-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Personal Brand Assessment
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
        Your personal brand is how you present yourself professionally to the world. Let's analyze your current position and identify opportunities to strengthen your professional presence.
      </p>
    </div>

    {/* Explanation Card */}
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
        <Lightbulb className="mr-2 w-5 h-5" />
        Why Personal Branding Matters
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
          <span className="text-blue-800 dark:text-blue-200">
            <strong>Career Growth:</strong> Stand out in competitive job markets and attract better opportunities
          </span>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
          <span className="text-blue-800 dark:text-blue-200">
            <strong>Professional Network:</strong> Build meaningful connections and establish thought leadership
          </span>
        </div>
        <div className="flex items-start space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
          <span className="text-blue-800 dark:text-blue-200">
            <strong>Business Success:</strong> Increase credibility, trust, and influence in your industry
          </span>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Industry *
        </label>
        <input
          type="text"
          value={brandData.industry}
          onChange={(e) => setBrandData(prev => ({ ...prev, industry: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-all duration-200"
          placeholder="e.g., Technology, Marketing, Finance"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Your industry context helps us understand market dynamics and competition
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Current Role *
        </label>
        <input
          type="text"
          value={brandData.role}
          onChange={(e) => setBrandData(prev => ({ ...prev, role: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-all duration-200"
          placeholder="e.g., Software Engineer, Marketing Manager"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Your current position provides baseline for brand positioning strategy
        </p>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Career Goals & Aspirations
      </label>
      <textarea
        value={brandData.goals}
        onChange={(e) => setBrandData(prev => ({ ...prev, goals: e.target.value }))}
        rows={4}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-all duration-200 resize-none"
        placeholder="Describe your career aspirations, target roles, and long-term professional objectives. Where do you see yourself in 3-5 years?"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        💡 <strong>Tip:</strong> Be specific about roles, industries, or leadership positions you're targeting
      </p>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Key Strengths & Unique Value
      </label>
      <textarea
        value={brandData.strengths}
        onChange={(e) => setBrandData(prev => ({ ...prev, strengths: e.target.value }))}
        rows={4}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-all duration-200 resize-none"
        placeholder="What are you known for? What makes you unique in your field? Include skills, achievements, and qualities that set you apart from peers."
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        💡 <strong>Tip:</strong> Think about feedback you've received, awards, successful projects, or unique combinations of skills
      </p>
    </div>

    {/* Additional Context Fields */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Years of Experience
        </label>
        <select
          value={brandData.experience}
          onChange={(e) => setBrandData(prev => ({ ...prev, experience: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 transition-all duration-200"
        >
          <option value="">Select experience level</option>
          <option value="0-2">Entry Level (0-2 years)</option>
          <option value="3-5">Mid-Level (3-5 years)</option>
          <option value="6-10">Senior Level (6-10 years)</option>
          <option value="11-15">Expert Level (11-15 years)</option>
          <option value="15+">Executive Level (15+ years)</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Target Audience
        </label>
        <input
          type="text"
          value={brandData.targetAudience}
          onChange={(e) => setBrandData(prev => ({ ...prev, targetAudience: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-all duration-200"
          placeholder="e.g., Tech recruiters, C-level executives, peers"
        />
      </div>
    </div>

    <button
      onClick={handleAnalyze}
      disabled={isAnalyzing || !brandData.industry.trim() || !brandData.role.trim()}
      className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
    >
      {isAnalyzing ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Sparkles className="w-5 h-5" />
      )}
      <span>{isAnalyzing ? 'Analyzing Your Brand...' : 'Analyze My Personal Brand'}</span>
    </button>
    
    {isAnalyzing && (
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        Our AI is analyzing your professional profile and market positioning...
      </div>
    )}
  </div>
)

function PersonalBrandPageContent() {
  const { user } = useUser()
  const { useAIFeature, canUseFeature } = useSubscription()
  const [currentStep, setCurrentStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  // Form data
  const [brandData, setBrandData] = useState({
    industry: '',
    role: '',
    experience: '',
    goals: '',
    targetAudience: '',
    currentBrand: '',
    challenges: '',
    strengths: '',
    values: '',
    uniqueValue: ''
  })
  
  const [analysis, setAnalysis] = useState<BrandAnalysis | null>(null)
  const [strategy, setStrategy] = useState<BrandStrategy | null>(null)

  const steps = [
    { id: 1, title: 'Brand Assessment', icon: User, color: 'text-blue-500' },
    { id: 2, title: 'AI Analysis', icon: Target, color: 'text-green-500' },
    { id: 3, title: 'Strategy Generation', icon: Sparkles, color: 'text-purple-500' },
    { id: 4, title: 'Action Plan', icon: TrendingUp, color: 'text-orange-500' }
  ]

  const handleAnalyze = async () => {
    if (!brandData.industry || !brandData.role) {
      toast.error('Please fill in required fields')
      return
    }

    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/personal-brand/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(brandData)
      })

      if (response.ok) {
        const data = await response.json()
        setAnalysis(data.analysis)
        setCurrentStep(2)
        toast.success('Brand analysis completed!')
      } else {
        throw new Error('Analysis failed')
      }
    } catch (error) {
      toast.error('Failed to analyze brand')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateStrategy = async () => {
    if (!user) {
      toast.error('Please sign in to generate personal brand strategy')
      return
    }

    // Validate required fields
    if (!brandData.role || !brandData.industry) {
      toast.error('Please fill in your role and industry')
      return
    }

    if (!canUseFeature('personal_brand_strategy')) {
      toast.error('Personal brand strategy is not available in your current plan')
      return
    }

    setIsGenerating(true)

    const success = await useAIFeature(
      'personal_brand_strategy',
      () => fetch('/api/personal-brand/strategy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          brandData,
          analysis: analysis
        }),
      }),
      (data) => {
        setStrategy(data.strategy)
        setCurrentStep(4)
        toast.success('Personal brand strategy generated successfully! Credit deducted.')
      },
      (error) => {
        toast.error(error || 'Failed to generate strategy')
      }
    )

    setIsGenerating(false)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <BrandAssessmentStep brandData={brandData} setBrandData={setBrandData} isAnalyzing={isAnalyzing} handleAnalyze={handleAnalyze} />
      case 2:
        return <AnalysisResultsStep />
      case 3:
        return <StrategyGenerationStep />
      case 4:
        return <ActionPlanStep />
      default:
        return <BrandAssessmentStep brandData={brandData} setBrandData={setBrandData} isAnalyzing={isAnalyzing} handleAnalyze={handleAnalyze} />
    }
  }

  const AnalysisResultsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Target className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Brand Analysis Results
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what our AI discovered about your personal brand
        </p>
      </div>

      {analysis && (
        <>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full mb-4">
              <span className="text-3xl font-bold text-green-600">{analysis.brandScore}</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Brand Strength Score</h3>
            <p className="text-gray-600 dark:text-gray-400">Out of 100</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6">
              <h4 className="font-semibold text-green-800 dark:text-green-100 mb-4 flex items-center">
                <CheckCircle className="mr-2 w-5 h-5" />
                Strengths
              </h4>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-green-700 dark:text-green-200">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-6">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-100 mb-4 flex items-center">
                <Lightbulb className="mr-2 w-5 h-5" />
                Opportunities
              </h4>
              <ul className="space-y-2">
                {analysis.opportunities.map((opportunity, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-yellow-700 dark:text-yellow-200">{opportunity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(1)}
          className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
        >
          Back
        </button>
        <button
          onClick={() => setCurrentStep(3)}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Sparkles className="w-5 h-5" />
          <span>Generate Strategy</span>
        </button>
      </div>
    </div>
  )

  const StrategyGenerationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Sparkles className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          AI Strategy Generation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Our AI will create a comprehensive personal brand strategy for you
        </p>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Strategy Generation Process
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm">Analyze your brand assessment results</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm">Identify your unique value proposition</span>
          </div>
          <div className="flex items-center space-x-3">
            <Loader2 className={`w-5 h-5 ${isGenerating ? 'animate-spin text-purple-600' : 'text-gray-400'}`} />
            <span className="text-sm">Create positioning and messaging strategy</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className={`w-5 h-5 rounded-full border-2 ${isGenerating ? 'border-gray-300' : 'border-gray-400'}`} />
            <span className="text-sm">Generate actionable implementation plan</span>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => setCurrentStep(2)}
          className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
        >
          Back
        </button>
        <button
          onClick={generateStrategy}
          disabled={isGenerating}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          <span>{isGenerating ? 'Generating Strategy...' : 'Generate My Strategy'}</span>
        </button>
      </div>
    </div>
  )

  const ActionPlanStep = () => {
    const [isExportingPDF, setIsExportingPDF] = useState(false)
    const [isSharing, setIsSharing] = useState(false)
    const [shareUrl, setShareUrl] = useState('')

    const handleExportPDF = async () => {
      if (!strategy || !analysis) {
        toast.error('No strategy data available to export')
        return
      }

      setIsExportingPDF(true)
      try {
        const response = await fetch('/api/personal-brand/export-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandData,
            analysis,
            strategy
          })
        })

        if (!response.ok) {
          throw new Error('Export failed')
        }

        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `Personal_Brand_Strategy_${brandData.industry?.replace(/\s+/g, '_') || 'Report'}_${new Date().toISOString().split('T')[0]}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success('PDF exported successfully!')
      } catch (error) {
        console.error('PDF export failed:', error)
        toast.error('Failed to export PDF. Please try again.')
      } finally {
        setIsExportingPDF(false)
      }
    }

    const handleShare = async () => {
      if (!strategy || !analysis) {
        toast.error('No strategy data available to share')
        return
      }

      setIsSharing(true)
      try {
        const response = await fetch('/api/personal-brand/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandData,
            analysis,
            strategy,
            title: `${brandData.industry} Personal Brand Strategy`
          })
        })

        if (!response.ok) {
          throw new Error('Share failed')
        }

        const result = await response.json()
        setShareUrl(result.shareUrl)
        
        // Copy to clipboard
        await navigator.clipboard.writeText(result.shareUrl)
        toast.success('Share link copied to clipboard!')
      } catch (error) {
        console.error('Share failed:', error)
        toast.error('Failed to create share link. Please try again.')
      } finally {
        setIsSharing(false)
      }
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Your Personal Brand Strategy
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Here's your comprehensive personal brand strategy with actionable steps to build and strengthen your professional presence in the market.
          </p>
        </div>

        {strategy && (
          <>
            {/* Strategy Overview */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Star className="mr-2 text-orange-600 w-6 h-6" />
                Core Brand Strategy
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                    <Target className="mr-2 w-4 h-4" />
                    Brand Positioning
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                    {strategy.positioning}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                    <Sparkles className="mr-2 w-4 h-4" />
                    Value Proposition
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                    {strategy.valueProposition}
                  </p>
                </div>
              </div>
            </div>

            {/* Target Audience & Key Messages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                <h4 className="font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                  <Users className="mr-2 text-blue-600 w-5 h-5" />
                  Target Audience
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{strategy.targetAudience}</p>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 Focus your content and networking efforts on reaching these key stakeholders
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                <h4 className="font-semibold mb-4 flex items-center text-gray-900 dark:text-white">
                  <MessageSquare className="mr-2 text-green-600 w-5 h-5" />
                  Key Messages
                </h4>
                <ul className="space-y-2">
                  {strategy.keyMessages.map((message, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{message}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    💡 Use these messages consistently across LinkedIn, networking events, and interviews
                  </p>
                </div>
              </div>
            </div>

            {/* Implementation Action Plan */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-100 mb-4 flex items-center">
                <CheckCircle className="mr-2 w-5 h-5" />
                90-Day Implementation Roadmap
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                Follow this step-by-step plan to build your personal brand systematically and effectively:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {strategy.actionPlan.map((action, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-white dark:bg-gray-800 p-4 rounded-lg">
                    <span className="bg-blue-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5 font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <span className="text-blue-700 dark:text-blue-200 text-sm leading-relaxed">{action}</span>
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Week {Math.ceil((index + 1) * 2)}: Implementation phase
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Success Metrics */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-100 mb-3 flex items-center">
                <TrendingUp className="mr-2 w-5 h-5" />
                Track Your Success
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium text-green-700 dark:text-green-300">LinkedIn Growth</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Track profile views, connection requests, and engagement rates
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium text-green-700 dark:text-green-300">Network Expansion</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Monitor new professional connections and speaking opportunities
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                  <div className="font-medium text-green-700 dark:text-green-300">Career Opportunities</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Count inbound job offers, consulting requests, and collaborations
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => setCurrentStep(3)}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            Back to Strategy
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={isExportingPDF}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isExportingPDF ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            <span>{isExportingPDF ? 'Generating PDF...' : 'Export PDF Report'}</span>
          </button>

          <button
            onClick={handleShare}
            disabled={isSharing}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isSharing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Share2 className="w-5 h-5" />
            )}
            <span>{isSharing ? 'Creating Link...' : 'Share Strategy'}</span>
          </button>

          <button
            onClick={() => {
              setCurrentStep(1)
              setBrandData({
                industry: '',
                role: '',
                experience: '',
                goals: '',
                targetAudience: '',
                currentBrand: '',
                challenges: '',
                strengths: '',
                values: '',
                uniqueValue: ''
              })
              setAnalysis(null)
              setStrategy(null)
              setShareUrl('')
            }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Create New Strategy</span>
          </button>
        </div>

        {/* Share URL Display */}
        {shareUrl && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Share Link Created!</h5>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-600 rounded-lg"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl)
                  toast.success('Link copied!')
                }}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              This link will expire in 30 days and can be shared with colleagues, mentors, or on social media.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:bg-gradient-to-br dark:from-purple-900 dark:via-gray-800 dark:to-pink-900">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Personal Brand Strategy
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Build a powerful personal brand that sets you apart from the competition
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => {
              const IconComponent = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${
                      isCompleted ? 'bg-green-600 text-white' :
                      isActive ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {isCompleted ? <CheckCircle size={20} /> : <IconComponent size={20} />}
                    </div>
                    <span className={`text-xs mt-2 font-medium ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/5 dark:shadow-blue-400/10 border border-white/20 dark:border-gray-700/30 p-8"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function PersonalBrandPage() {
  return (
    <PlanBasedFeatureGuard feature="personal_brand_strategy">
      <PersonalBrandPageContent />
    </PlanBasedFeatureGuard>
  )
}
