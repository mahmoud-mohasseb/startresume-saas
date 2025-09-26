"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Eye, 
  FileText, 
  ArrowRight, 
  Palette, 
  Star,
  Download,
  Edit,
  Filter,
  Briefcase,
  Users,
  Building,
  TrendingUp
} from 'lucide-react'
import { 
  EXECUTIVE_TEMPLATES,
  getExecutiveTemplatesByIndustry,
  getExecutiveTemplatesByLevel,
  ExecutiveTemplate
} from '@/lib/executive-templates'
import { toast } from 'react-hot-toast'

export default function TemplatesPage() {
  const router = useRouter()
  const [selectedTemplate, setSelectedTemplate] = useState<ExecutiveTemplate | null>(null)
  const [templateFilter, setTemplateFilter] = useState<{industry: string, level: string}>({
    industry: 'all',
    level: 'all'
  })

  const getFilteredTemplates = () => {
    let filtered = EXECUTIVE_TEMPLATES
    
    if (templateFilter.industry !== 'all') {
      filtered = getExecutiveTemplatesByIndustry(templateFilter.industry)
    }
    
    if (templateFilter.level !== 'all') {
      filtered = getExecutiveTemplatesByLevel(templateFilter.level)
    }
    
    return filtered
  }

  const handleTemplateSelect = (template: ExecutiveTemplate) => {
    setSelectedTemplate(template)
    
    // Check if user came from resume builder
    const urlParams = new URLSearchParams(window.location.search)
    const source = urlParams.get('source')
    
    if (source === 'resume-builder') {
      // Return to resume builder with selected template
      const returnUrl = localStorage.getItem('resumeBuilderReturnUrl')
      if (returnUrl) {
        const url = new URL(returnUrl)
        url.searchParams.set('selectedTemplate', template.name)
        localStorage.removeItem('resumeBuilderReturnUrl')
        router.push(url.toString())
        toast.success(`${template.name} template selected! Returning to resume builder...`)
        return
      }
    }
    
    // Default behavior - navigate to create page with template
    router.push(`/dashboard/create?template=${encodeURIComponent(template.name)}`)
    toast.success(`${template.name} template selected!`)
  }

  const handleApplyTemplate = (template: ExecutiveTemplate) => {
    // Navigate to create page and apply the template
    router.push(`/dashboard/create?executiveTemplate=${template.id}`)
    toast.success(`Applying ${template.name} template...`)
  }

  const industries = ['all', 'general', 'technology', 'finance', 'healthcare', 'manufacturing', 'media']
  const levels = ['all', 'c-suite', 'vp', 'director', 'senior-manager']

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case 'technology': return '💻'
      case 'finance': return '💰'
      case 'healthcare': return '🏥'
      case 'manufacturing': return '🏭'
      case 'media': return '📺'
      default: return '🏢'
    }
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'c-suite': return '👑'
      case 'vp': return '🎯'
      case 'director': return '📊'
      case 'senior-manager': return '👥'
      default: return '💼'
    }
  }

  useEffect(() => {
    // Load default template on mount
    const templates = getFilteredTemplates()
    if (templates.length > 0) {
      setSelectedTemplate(templates[0])
    }
  }, [templateFilter])

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
            Executive Resume Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg max-w-2xl mx-auto">
            Choose from our collection of professionally designed executive resume templates. 
            Preview, customize, and create your perfect resume.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-8 mb-8 p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-600/20"
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {EXECUTIVE_TEMPLATES.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Templates</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              100%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">ATS Compatible</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              <Star className="w-6 h-6 text-yellow-500 inline" />
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Professional</div>
          </div>
        </motion.div>

        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-8 mb-8 p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-gray-600/20"
        >
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Industry:
            </div>
            <select
              value={templateFilter.industry}
              onChange={(e) => setTemplateFilter({ ...templateFilter, industry: e.target.value })}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white"
            >
              {industries.map((industry) => (
                <option key={industry} value={industry}>
                  {industry === 'all' ? 'All' : getIndustryIcon(industry) + ' ' + industry.charAt(0).toUpperCase() + industry.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Level:
            </div>
            <select
              value={templateFilter.level}
              onChange={(e) => setTemplateFilter({ ...templateFilter, level: e.target.value })}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white"
            >
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level === 'all' ? 'All' : getLevelIcon(level) + ' ' + level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {getFilteredTemplates().map((template) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 transition-all duration-200 hover:shadow-lg cursor-pointer"
              onClick={() => handleTemplateSelect(template)}
            >
              {/* Template Preview */}
              <div className="relative h-48 bg-gray-50 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                <div 
                  className="absolute inset-0 p-4 text-xs overflow-hidden"
                  style={{ 
                    fontSize: '6px',
                    lineHeight: '1.2',
                    transform: 'scale(0.7)',
                    transformOrigin: 'top left'
                  }}
                  dangerouslySetInnerHTML={{ 
                    __html: `<style>${template.cssStyles}</style>${template.htmlContent}` 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: template.colorScheme }}
                  ></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {template.name}
                  </h3>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                  {template.description}
                </p>

                {/* Template Tags */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {getIndustryIcon(template.industry)} {template.industry}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {getLevelIcon(template.level)} {template.level.replace('-', ' ')}
                  </span>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTemplateSelect(template)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-3 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    Preview
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleApplyTemplate(template)
                    }}
                    className="flex-1 flex items-center justify-center gap-1 text-xs bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-2 rounded hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    <Edit className="w-3 h-3" />
                    Apply
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Selected Template Preview Modal */}
        {selectedTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: selectedTemplate.colorScheme }}
                  ></div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedTemplate.industry} • {selectedTemplate.level.replace('-', ' ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApplyTemplate(selectedTemplate)}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Apply Template
                  </button>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Template Preview */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 h-96 overflow-hidden">
                    <div 
                      className="w-full h-full overflow-hidden"
                      style={{ 
                        fontSize: '8px',
                        lineHeight: '1.2',
                        transform: 'scale(0.9)',
                        transformOrigin: 'top left'
                      }}
                      dangerouslySetInnerHTML={{ 
                        __html: `<style>${selectedTemplate.cssStyles}</style>${selectedTemplate.htmlContent}` 
                      }}
                    />
                  </div>

                  {/* Template Details */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedTemplate.description}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Key Features</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedTemplate.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Template Style</h4>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {selectedTemplate.style}
                        </span>
                        <div className="flex items-center gap-1">
                          <div 
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: selectedTemplate.colorScheme }}
                          ></div>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            Color Scheme
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-12 p-8 bg-gradient-to-r from-blue-600/10 to-teal-600/10 dark:from-blue-400/10 dark:to-teal-400/10 rounded-2xl border border-blue-200/20 dark:border-blue-400/20"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Create Your Resume?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Choose a template above and start building your professional resume with our AI-powered tools.
          </p>
          <button
            onClick={() => router.push('/dashboard/create')}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all hover:shadow-lg"
          >
            <FileText className="w-5 h-5" />
            Start Creating
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </div>
  )
}
