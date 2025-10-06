"use client"

import React, { useState, useEffect } from 'react'
import { StepWrapper } from './StepWrapper'
import { ExportButtons } from '@/components/ExportButtons'
import { Editor } from '@/components/Editor'
import { Eye, Edit, Sparkles, Loader2, Save, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface ResumeInputs {
  name: string
  title: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  summary: string
  experience: any[]
  education: any[]
  skills: string[]
  certifications: any[]
  projects: any[]
  languages: any[]
  achievements: string[]
}

interface ReviewStepProps {
  resumeInputs: ResumeInputs
  selectedTemplate: string
  generatedContent: string
  setGeneratedContent: (content: string) => void
  isGenerating: boolean
  onGenerate: () => void
  onSave: (content: string) => void
  atsScore?: number
}

export function ReviewStep({
  resumeInputs,
  selectedTemplate,
  generatedContent,
  setGeneratedContent,
  isGenerating,
  onGenerate,
  onSave,
  atsScore
}: ReviewStepProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  // Initialize edited content when generated content changes
  useEffect(() => {
    console.log('🔍 ReviewStep useEffect triggered - generatedContent changed:', {
      hasContent: !!generatedContent,
      length: generatedContent?.length || 0,
      preview: generatedContent?.substring(0, 100) || 'No content',
      currentStep: 'Review & Generate (Step 8)',
      generatedContentType: typeof generatedContent,
      isString: typeof generatedContent === 'string',
      isNotEmpty: generatedContent && generatedContent.length > 0
    })
    
    if (generatedContent && generatedContent.length > 0) {
      setEditedContent(generatedContent)
      console.log('✅ ReviewStep: Edited content updated with generated content')
      console.log('✅ ReviewStep: Content preview:', generatedContent.substring(0, 200))
    } else {
      console.log('⚠️ ReviewStep: No generated content available or content is empty')
      console.log('⚠️ ReviewStep: generatedContent value:', generatedContent)
    }
  }, [generatedContent])

  // Handle CKEditor save with better error handling
  const handleEditorSave = async (content: string) => {
    try {
      console.log('Editor save triggered with content length:', content.length)
      console.log('Content preview:', content.substring(0, 200) + '...')
      
      // Update local state first
      setEditedContent(content)
      setGeneratedContent(content)
      
      // Save to database
      await onSave(content)
      
      toast.success('Content saved successfully!')
    } catch (error) {
      console.error('Editor save error:', error)
      toast.error(`Failed to save: ${error.message || 'Unknown error'}`)
      throw error
    }
  }

  // Manual save changes function
  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      console.log('Manual save triggered with content length:', editedContent.length)
      console.log('Content preview:', editedContent.substring(0, 200) + '...')
      
      // Update generated content
      setGeneratedContent(editedContent)
      
      // Save to database
      await onSave(editedContent)
      
      // Exit edit mode
      setIsEditing(false)
      
      toast.success('Changes saved successfully!')
    } catch (error) {
      console.error('Manual save error:', error)
      toast.error(`Failed to save changes: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
  }

  // Debug render state
  console.log('🎯 ReviewStep render called with:', {
    isEditing,
    isGenerating,
    hasGeneratedContent: !!generatedContent,
    generatedContentLength: generatedContent?.length || 0,
    generatedContentPreview: generatedContent?.substring(0, 100) || 'No content',
    onGenerateType: typeof onGenerate,
    renderCondition: !generatedContent || generatedContent.length === 0 ? 'SHOW_GENERATION' : 'SHOW_CONTENT'
  })

  const handleRegenerateResume = async () => {
    console.log('Regenerate button clicked!')
    
    setIsEditing(false)
    
    try {
      console.log('Calling onGenerate function...')
      await onGenerate()
      console.log('onGenerate completed successfully')
      toast.success('Resume regenerated successfully!')
    } catch (error) {
      console.error('Error calling onGenerate:', error)
      toast.error(`Failed to regenerate resume: ${error.message || 'Unknown error'}`)
    }
  }

  // Handle CKEditor content changes
  const handleEditorChange = (content: string) => {
    setEditedContent(content)
  }

  return (
    <StepWrapper
      title="Review & Generate"
      description="Generate your resume and make final edits"
      icon={Eye}
    >
      <div className="space-y-8">
        {!generatedContent || generatedContent.length === 0 ? (
          // Generation Step
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to Generate Your Resume!
              </h3>
              
              {/* Template Preview */}
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Selected Template:
                </p>
                <p className="font-semibold text-blue-600 dark:text-blue-400 text-lg">
                  {selectedTemplate}
                </p>
              </div>

              {/* Resume Summary */}
              <div className="mb-8 text-left bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Resume Summary:
                </h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Name: {resumeInputs.name || 'Not provided'}</li>
                  <li>• Title: {resumeInputs.title || 'Not provided'}</li>
                  <li>• Email: {resumeInputs.email || 'Not provided'}</li>
                  <li>• Experience: {resumeInputs.experience?.length || 0} entries</li>
                  <li>• Education: {resumeInputs.education?.length || 0} entries</li>
                  <li>• Skills: {resumeInputs.skills?.length || 0} skills</li>
                  <li>• Projects: {resumeInputs.projects?.length || 0} projects</li>
                  <li>• Certifications: {resumeInputs.certifications?.length || 0} certifications</li>
                  <li>• Languages: {resumeInputs.languages?.length || 0} languages</li>
                  <li>• Template: {selectedTemplate}</li>
                </ul>
                
                {/* Debug info */}
                <div className="mt-4 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs">
                  <strong>Debug Info:</strong>
                  <div>Generated Content Length: {generatedContent?.length || 0}</div>
                  <div>Generated Content Type: {typeof generatedContent}</div>
                  <div>Generated Content Preview: {generatedContent?.substring(0, 50) || 'No content'}</div>
                  <div>Resume Inputs: {JSON.stringify(resumeInputs).length} chars</div>
                  <div>Has Summary: {!!resumeInputs.summary}</div>
                  <div>Has Experience: {resumeInputs.experience?.length > 0}</div>
                  <div>Selected Template: {selectedTemplate}</div>
                  <div>Is Generating: {isGenerating}</div>
                </div>
              </div>

              <button
                onClick={() => {
                  console.log('Generate button clicked!')
                  console.log('Resume inputs:', resumeInputs)
                  console.log('Is generating:', isGenerating)
                  onGenerate()
                }}
                disabled={isGenerating}
                className="inline-flex items-center space-x-2 px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {isGenerating ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Sparkles className="w-6 h-6" />
                )}
                <span>{isGenerating ? 'Generating...' : 'Generate Resume'}</span>
              </button>
            </div>
          </div>
        ) : (
          // Generated Resume Display & Edit
          <div className="space-y-6">
            {/* Header with Actions */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  🎉 Your Resume is Ready!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Generated using the {selectedTemplate} template.
                </p>
                {atsScore !== undefined && (
                  <p className="text-gray-600 dark:text-gray-400">
                    ATS Score: {atsScore}%
                  </p>
                )}
              </div>
              
              <div className="flex items-center space-x-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Resume</span>
                    </button>
                    <button
                      onClick={handleRegenerateResume}
                      disabled={isGenerating}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      <span>{isGenerating ? 'Regenerating...' : 'Regenerate'}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSaveChanges}
                      disabled={isSaving}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span>Cancel</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Export Buttons */}
            {!isEditing && (
              <div className="flex justify-center">
                <ExportButtons
                  content={generatedContent}
                  filename={`${resumeInputs.name.replace(/\s+/g, '_')}_Resume`}
                  selectedTemplate={selectedTemplate}
                  showPreview={true}
                />
              </div>
            )}

            {/* Resume Content - Edit or Preview */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {isEditing ? (
                // CKEditor for editing
                <div className="p-6">
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      Edit Your Resume
                    </h4>
                    <p className="text-sm text-gray-600">
                      Make any final adjustments to your resume content. You can edit text, formatting, and layout.
                    </p>
                  </div>
                  
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      initialContent={editedContent}
                      onContentChange={handleEditorChange}
                      onSave={handleEditorSave}
                      placeholder="Your resume content will appear here..."
                      className="min-h-[600px]"
                    />
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">
                      💡 Editing Tips
                    </h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use the toolbar to format text, add bullet points, and adjust styling</li>
                      <li>• Keep the overall structure and template design intact</li>
                      <li>• Add or remove sections as needed for your specific role</li>
                      <li>• Ensure all information is accurate and up-to-date</li>
                    </ul>
                  </div>
                </div>
              ) : (
                // Preview mode
                <div className="max-h-96 overflow-auto p-6">
                  <div 
                    dangerouslySetInnerHTML={{ __html: generatedContent }}
                    className="prose max-w-none"
                  />
                </div>
              )}
            </div>

            {/* Actions Footer */}
            {!isEditing && (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleRegenerateResume}
                  disabled={isGenerating}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  <span>{isGenerating ? 'Regenerating...' : 'Generate New Version'}</span>
                </button>
                <button
                  onClick={() => router.push('/dashboard/history')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Resumes
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </StepWrapper>
  )
}
