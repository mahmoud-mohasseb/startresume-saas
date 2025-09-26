"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye, 
  Check, 
  Palette, 
  FileText, 
  Sparkles,
  Grid3X3,
  List,
  Search
} from 'lucide-react'
import { 
  getTemplateDesigns, 
  getTemplateDesign, 
  setLastUsedTemplate, 
  getLastUsedTemplate,
  TemplateDesign 
} from '@/lib/cookies'

interface TemplateSelectorProps {
  onTemplateSelect: (template: TemplateDesign) => void
  selectedTemplateId?: string
  className?: string
}

export function TemplateSelector({ 
  onTemplateSelect, 
  selectedTemplateId, 
  className = '' 
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateDesign[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(selectedTemplateId || null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDesign | null>(null)

  useEffect(() => {
    loadTemplates()
    
    // Load last used template if no template is selected
    if (!selectedTemplateId) {
      const lastUsed = getLastUsedTemplate()
      if (lastUsed) {
        setSelectedTemplate(lastUsed)
        const template = getTemplateDesign(lastUsed)
        if (template) {
          onTemplateSelect(template)
        }
      }
    }
  }, [selectedTemplateId, onTemplateSelect])

  const loadTemplates = () => {
    const availableTemplates = getTemplateDesigns()
    setTemplates(availableTemplates)
  }

  const handleTemplateSelect = (template: TemplateDesign) => {
    setSelectedTemplate(template.id)
    setLastUsedTemplate(template.id)
    onTemplateSelect(template)
  }

  const handlePreview = (template: TemplateDesign) => {
    setPreviewTemplate(template)
  }

  const closePreview = () => {
    setPreviewTemplate(null)
  }

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Choose Template Design
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Select a professional template for your resume
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white capitalize"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'All Categories' : category}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid/List */}
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
          : 'space-y-4'
      }`}>
        {filteredTemplates.map((template) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative border-2 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-gray-500'
            } ${viewMode === 'list' ? 'flex items-center p-4' : 'p-4'}`}
          >
            {/* Template Preview */}
            <div className={`${viewMode === 'list' ? 'w-32 h-20 flex-shrink-0 mr-4' : 'w-full h-48 mb-4'} bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative`}>
              <div 
                className="w-full h-full p-2 text-xs overflow-hidden"
                style={{ 
                  fontFamily: template.category === 'classic' ? 'serif' : 'sans-serif',
                  fontSize: viewMode === 'list' ? '6px' : '8px',
                  lineHeight: '1.2'
                }}
                dangerouslySetInnerHTML={{ 
                  __html: `<style>${template.cssStyles}</style>${template.htmlContent}` 
                }}
              />
              
              {/* Preview Overlay */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                <button
                  onClick={() => handlePreview(template)}
                  className="bg-white/90 text-gray-800 px-3 py-1 rounded-lg text-sm font-medium flex items-center space-x-1 hover:bg-white transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {/* Template Info */}
            <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {template.description}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: template.colorScheme }}
                  />
                  <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full capitalize">
                    {template.category}
                  </span>
                </div>
              </div>

              {/* Select Button */}
              <button
                onClick={() => handleTemplateSelect(template)}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  selectedTemplate === template.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {selectedTemplate === template.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Selected</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Use Template</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Try adjusting your search or category filter
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {previewTemplate.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {previewTemplate.description}
                </p>
              </div>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div 
                className="bg-white border border-gray-200 rounded-lg p-8 mx-auto"
                style={{ maxWidth: '800px' }}
                dangerouslySetInnerHTML={{ 
                  __html: `<style>${previewTemplate.cssStyles}</style>${previewTemplate.htmlContent}` 
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={closePreview}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleTemplateSelect(previewTemplate)
                  closePreview()
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center space-x-2"
              >
                <Check className="w-4 h-4" />
                <span>Use This Template</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
