"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Palette, Eye } from 'lucide-react'
import { StepWrapper } from './StepWrapper'

interface TemplateStepProps {
  resumeInputs: any
  setResumeInputs: (inputs: any) => void
  setSelectedTemplate?: (template: string) => void
}

const TEMPLATE_OPTIONS = [
  {
    id: 'modern-professional',
    name: 'Modern Professional',
    description: 'Clean, modern design with blue accents',
    preview: 'bg-gradient-to-br from-blue-50 to-blue-100',
    color: 'border-blue-500',
    features: ['ATS Optimized', 'Clean Layout', 'Professional']
  },
  {
    id: 'executive',
    name: 'Executive',
    description: 'Sophisticated design for senior roles',
    preview: 'bg-gradient-to-br from-gray-50 to-gray-100',
    color: 'border-gray-500',
    features: ['Executive Level', 'Sophisticated', 'Leadership Focus']
  },
  {
    id: 'creative',
    name: 'Creative',
    description: 'Stylish design for creative professionals',
    preview: 'bg-gradient-to-br from-purple-50 to-pink-50',
    color: 'border-purple-500',
    features: ['Creative Industries', 'Unique Design', 'Portfolio Ready']
  },
  {
    id: 'technical',
    name: 'Technical',
    description: 'Perfect for tech and engineering roles',
    preview: 'bg-gradient-to-br from-green-50 to-teal-50',
    color: 'border-green-500',
    features: ['Tech Focused', 'Skills Emphasis', 'Project Showcase']
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Simple, elegant design that lets content shine',
    preview: 'bg-gradient-to-br from-gray-25 to-gray-50',
    color: 'border-gray-400',
    features: ['Clean & Simple', 'Content Focus', 'Timeless Design']
  }
]

export function TemplateStep({ resumeInputs, setResumeInputs, setSelectedTemplate }: TemplateStepProps) {
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null)

  const handleTemplateSelect = (templateId: string) => {
    const selectedTemplateData = TEMPLATE_OPTIONS.find(t => t.id === templateId)
    
    setResumeInputs({
      ...resumeInputs,
      template: templateId
    })
    
    // Also update the selectedTemplate state if provided
    if (setSelectedTemplate && selectedTemplateData) {
      setSelectedTemplate(selectedTemplateData.name)
    }
  }

  return (
    <StepWrapper
      title="Choose Your Template"
      description="Select a professional template that matches your industry and career level"
      icon={Palette}
    >
      <div className="space-y-8">
        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATE_OPTIONS.map((template) => (
            <motion.div
              key={template.id}
              className={`relative cursor-pointer rounded-xl border-2 transition-all duration-300 ${
                resumeInputs.template === template.id
                  ? `${template.color} shadow-lg shadow-blue-500/25`
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
              }`}
              onClick={() => handleTemplateSelect(template.id)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
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
                {resumeInputs.template === template.id && (
                  <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-1">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                
                {/* Hover Overlay */}
                {hoveredTemplate === template.id && (
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
        {resumeInputs.template && (
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
                  {TEMPLATE_OPTIONS.find(t => t.id === resumeInputs.template)?.name} Template Selected
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  This template will be used when generating your resume in the next step.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </StepWrapper>
  )
}
