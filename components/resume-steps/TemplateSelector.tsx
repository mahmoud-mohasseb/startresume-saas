"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Palette, Eye, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TemplateSelectorProps {
  selectedTemplate: string
  onTemplateSelect: (templateName: string) => void
  className?: string
  autoGenerate?: boolean
}

const TEMPLATE_STYLES = [
  {
    name: 'Modern Professional',
    description: 'Clean, modern design with blue accents',
    color: 'from-blue-500 to-blue-600',
    preview: 'bg-gradient-to-br from-blue-50 to-blue-100',
    features: ['ATS Optimized', 'Clean Layout', 'Professional']
  },
  {
    name: 'Executive',
    description: 'Sophisticated design for senior roles',
    color: 'from-gray-700 to-gray-800',
    preview: 'bg-gradient-to-br from-gray-50 to-gray-100',
    features: ['Executive Level', 'Sophisticated', 'Leadership Focus']
  },
  {
    name: 'Creative',
    description: 'Stylish design for creative professionals',
    color: 'from-purple-500 to-pink-500',
    preview: 'bg-gradient-to-br from-purple-50 to-pink-50',
    features: ['Creative Industries', 'Unique Design', 'Portfolio Ready']
  },
  {
    name: 'Technical',
    description: 'Perfect for tech and engineering roles',
    color: 'from-green-500 to-teal-500',
    preview: 'bg-gradient-to-br from-green-50 to-teal-50',
    features: ['Tech Focused', 'Skills Emphasis', 'Project Showcase']
  },
  {
    name: 'Minimalist',
    description: 'Simple, elegant design that lets content shine',
    color: 'from-gray-500 to-gray-600',
    preview: 'bg-gradient-to-br from-gray-25 to-gray-50',
    features: ['Clean & Simple', 'Content Focus', 'Timeless Design']
  }
]

export function TemplateSelector({ 
  selectedTemplate, 
  onTemplateSelect, 
  className = '',
  autoGenerate = false
}: TemplateSelectorProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)
  const router = useRouter()

  // Check if user is returning from templates page with a selected template
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const templateFromUrl = urlParams.get('selectedTemplate')
    if (templateFromUrl) {
      console.log('Template selected from templates page:', templateFromUrl)
      onTemplateSelect(templateFromUrl)
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [onTemplateSelect])

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
            <Palette className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Template
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Select a professional template that matches your industry and career level. 
          All templates are ATS-optimized and fully customizable.
        </p>
      </div>

      {/* Auto-generation info */}
      {autoGenerate && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🚀 Smart Template Selection
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Select a template and your resume will be automatically generated with all your inputs applied. 
            You'll be taken directly to the preview where you can make final edits.
          </p>
        </div>
      )}

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATE_STYLES.map((template) => (
          <motion.div
            key={template.name}
            className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 ${
              selectedTemplate === template.name
                ? 'border-blue-500 shadow-lg shadow-blue-500/25'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
            onClick={() => onTemplateSelect(template.name)}
            onMouseEnter={() => setHoveredTemplate(template.name)}
            onMouseLeave={() => setHoveredTemplate(null)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Template Preview */}
            <div className={`h-48 rounded-t-xl ${template.preview} relative overflow-hidden`}>
              {/* Mock Resume Content */}
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                <div className="h-1 bg-gray-400 rounded w-full mt-3"></div>
                <div className="h-1 bg-gray-400 rounded w-5/6"></div>
                <div className="h-1 bg-gray-400 rounded w-4/5"></div>
                <div className="space-y-1 mt-4">
                  <div className="h-2 bg-gray-700 rounded w-1/3"></div>
                  <div className="h-1 bg-gray-500 rounded w-full"></div>
                  <div className="h-1 bg-gray-500 rounded w-4/5"></div>
                </div>
              </div>
              
              {/* Selection Indicator */}
              {selectedTemplate === template.name && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
              
              {/* Hover Overlay */}
              {hoveredTemplate === template.name && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/20 flex items-center justify-center"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg">
                    <Eye className="w-6 h-6 text-blue-500 mx-auto" />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {template.description}
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-1">
                {template.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Template Info */}
      {selectedTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100">
                {selectedTemplate} Template Selected
              </h4>
              <p className="text-sm text-green-800 dark:text-green-200">
                {autoGenerate 
                  ? "Your resume will be generated with this template when you have enough content."
                  : "This template will be used when generating your resume."
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
