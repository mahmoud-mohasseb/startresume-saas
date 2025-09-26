'use client'

import { useState, useRef, useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Eye, EyeOff, Sparkles, Wand2, Download, Save, X, Check, RefreshCw, Lightbulb, Plus, AlertCircle, Target } from 'lucide-react'

interface AISuggestion {
  id: string
  type: 'summary' | 'experience' | 'skills' | 'achievement' | 'education' | 'contact' | 'general'
  content: string
  category: string
  confidence: number
  isRequired?: boolean
  fieldName?: string
}

interface RequiredField {
  section: string
  field: string
  isEmpty: boolean
  suggestions: string[]
}

interface FullResumeMarkdownEditorProps {
  resumeData?: {
    name?: string
    title?: string
    email?: string
    phone?: string
    location?: string
    linkedin?: string
    summary?: string
    experience?: Array<{
      jobTitle: string
      company: string
      duration: string
      description: string
    }>
    skills?: string[]
    education?: Array<{
      degree: string
      school: string
      year: string
    }>
  }
  onSave?: (markdownContent: string) => void
  onExportPDF?: () => void
  onExportDOCX?: () => void
}

export default function FullResumeMarkdownEditor({ 
  resumeData, 
  onSave, 
  onExportPDF, 
  onExportDOCX 
}: FullResumeMarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [isAILoading, setIsAILoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [requiredFields, setRequiredFields] = useState<RequiredField[]>([])
  const [selectedText, setSelectedText] = useState('')
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const [currentSection, setCurrentSection] = useState<string>('general')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Convert resume data to markdown format
  const generateMarkdownFromData = () => {
    let markdown = `# ${resumeData?.name || 'Your Name'}\n## ${resumeData?.title || 'Professional Title'}\n\n`
    markdown += `📧 ${resumeData?.email || 'email@example.com'} | 📱 ${resumeData?.phone || '+1 (555) 123-4567'} | 📍 ${resumeData?.location || 'City, State'}\n`
    markdown += `🔗 ${resumeData?.linkedin || 'linkedin.com/in/yourprofile'}\n\n`
    
    markdown += `## Professional Summary\n\n${resumeData?.summary || 'Write a compelling professional summary that highlights your key achievements and career objectives.'}\n\n`
    
    markdown += `## Professional Experience\n\n`
    const experience = resumeData?.experience
    if (Array.isArray(experience) && experience.length > 0) {
      experience.forEach(exp => {
        markdown += `### ${exp.jobTitle}\n**${exp.company}** | ${exp.duration}\n\n${exp.description}\n\n`
      })
    } else {
      markdown += `### Your Job Title\n**Company Name** | Duration\n\n• Achievement or responsibility\n• Another key accomplishment\n• Quantified result or impact\n\n`
    }
    
    markdown += `## Technical Skills\n\n`
    const skills = resumeData?.skills
    if (Array.isArray(skills) && skills.length > 0) {
      markdown += skills.map(skill => `- ${skill}`).join('\n') + '\n\n'
    } else {
      markdown += `- Skill 1\n- Skill 2\n- Skill 3\n\n`
    }
    
    if (resumeData?.education && Array.isArray(resumeData.education) && resumeData.education.length > 0) {
      markdown += `## Education\n\n`
      resumeData.education.forEach(edu => {
        markdown += `### ${edu.degree}\n**${edu.school}** | ${edu.year}\n\n`
      })
    } else {
      markdown += `## Education\n\n### Your Degree\n**University Name** | Year\n\n`
    }
    
    return markdown
  }

  const [markdownContent, setMarkdownContent] = useState(generateMarkdownFromData())

  // Analyze content for missing or incomplete fields
  const analyzeRequiredFields = (content: string): RequiredField[] => {
    const fields: RequiredField[] = []
    
    // Check for placeholder content that needs replacement
    const placeholders = [
      { section: 'Header', field: 'Name', pattern: /Your Name/g, suggestions: ['John Smith', 'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez'] },
      { section: 'Header', field: 'Title', pattern: /Professional Title/g, suggestions: ['Software Engineer', 'Marketing Manager', 'Data Analyst', 'Product Manager'] },
      { section: 'Contact', field: 'Email', pattern: /email@example\.com/g, suggestions: ['john.smith@email.com', 'sarah.j@gmail.com', 'michael.chen@company.com'] },
      { section: 'Contact', field: 'Phone', pattern: /\+1 \(555\) 123-4567/g, suggestions: ['+1 (555) 987-6543', '+1 (555) 234-5678', '+1 (555) 345-6789'] },
      { section: 'Contact', field: 'Location', pattern: /City, State/g, suggestions: ['New York, NY', 'San Francisco, CA', 'Austin, TX', 'Seattle, WA'] },
      { section: 'Summary', field: 'Professional Summary', pattern: /Write a compelling professional summary/g, suggestions: [
        'Results-driven software engineer with 5+ years of experience developing scalable web applications',
        'Creative marketing professional with proven track record of increasing brand awareness by 40%',
        'Data-driven analyst specializing in business intelligence and predictive modeling'
      ]},
      { section: 'Experience', field: 'Job Description', pattern: /Achievement or responsibility/g, suggestions: [
        'Led development of customer-facing web application serving 100K+ users',
        'Implemented automated testing framework reducing bugs by 60%',
        'Collaborated with cross-functional teams to deliver projects on time'
      ]}
    ]
    
    placeholders.forEach(placeholder => {
      const matches = content.match(placeholder.pattern)
      if (matches && matches.length > 0) {
        fields.push({
          section: placeholder.section,
          field: placeholder.field,
          isEmpty: true,
          suggestions: placeholder.suggestions
        })
      }
    })
    
    return fields
  }

  // Enhanced AI suggestions with comprehensive templates
  const generateAISuggestions = async (context: string, type: string): Promise<AISuggestion[]> => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const suggestionTemplates = {
      summary: [
        "Results-driven {profession} with {years}+ years of experience in {field}, specializing in {specialization} and delivering {achievement}",
        "Dynamic {title} with proven track record of {accomplishment} and expertise in {skills}, passionate about {focus_area}",
        "Innovative {profession} combining technical expertise in {technology} with business acumen to drive {outcome}",
        "Strategic {role} with demonstrated success in {area}, leading teams of {size} and managing budgets up to ${amount}",
        "Detail-oriented {profession} skilled in {skills} with a history of {achievement} and commitment to {value}"
      ],
      experience: [
        "• Led cross-functional team of {number} members to deliver {project}, resulting in {outcome} and {metric}% improvement in {area}",
        "• Implemented {technology/process} that reduced {metric} by {percentage}% and saved ${amount} annually",
        "• Developed and executed {strategy} that generated ${revenue} in new business and increased {metric} by {percentage}%",
        "• Optimized {system/process} through {method}, achieving {percentage}% reduction in {metric} and improving {outcome}",
        "• Managed {responsibility} for {duration}, overseeing ${budget} budget and delivering {number} successful projects",
        "• Collaborated with {stakeholders} to {action}, resulting in {percentage}% increase in {metric} and {outcome}",
        "• Designed and launched {product/feature} that served {users} users and generated ${revenue} in first year"
      ],
      skills: [
        "JavaScript, TypeScript, React, Node.js, Express, MongoDB",
        "Python, Django, PostgreSQL, AWS, Docker, Kubernetes",
        "Java, Spring Boot, MySQL, Apache Kafka, Redis",
        "C#, .NET Core, SQL Server, Azure, Microservices",
        "Project Management, Agile, Scrum, Leadership, Team Building",
        "Data Analysis, Machine Learning, SQL, Tableau, Power BI",
        "Digital Marketing, SEO, SEM, Google Analytics, Social Media",
        "UX/UI Design, Figma, Adobe Creative Suite, Prototyping"
      ],
      achievement: [
        "Increased team productivity by 40% through implementation of automated workflows and agile methodologies",
        "Successfully managed $2M+ annual budget with 15% cost reduction while maintaining quality standards",
        "Mentored 10+ junior developers with 90% promotion rate within 18 months",
        "Delivered 25+ projects on time and under budget, maintaining 98% client satisfaction rate",
        "Grew user base from 10K to 100K+ through strategic product improvements and marketing initiatives",
        "Reduced system downtime by 75% through proactive monitoring and infrastructure improvements"
      ],
      education: [
        "Bachelor of Science in Computer Science\n**University of Technology** | 2020",
        "Master of Business Administration (MBA)\n**Business School** | 2022",
        "Bachelor of Arts in Marketing\n**State University** | 2019",
        "Bachelor of Science in Data Science\n**Tech Institute** | 2021"
      ],
      contact: [
        "john.smith@email.com",
        "sarah.johnson@gmail.com",
        "michael.chen@company.com",
        "+1 (555) 987-6543",
        "+1 (555) 234-5678",
        "New York, NY",
        "San Francisco, CA",
        "linkedin.com/in/johnsmith",
        "linkedin.com/in/sarahjohnson"
      ]
    ]

    const templates = suggestionTemplates[type as keyof typeof suggestionTemplates] || []
    
    return templates.map((template, index) => ({
      id: `${type}-${index}`,
      type: type as AISuggestion['type'],
      content: template,
      category: type.charAt(0).toUpperCase() + type.slice(1),
      confidence: Math.floor(Math.random() * 30) + 70,
      isRequired: requiredFields.some(field => field.section.toLowerCase().includes(type))
    }))
  }

  // Detect current section based on cursor position
  const detectCurrentSection = (content: string, cursorPosition: number): string => {
    const textBeforeCursor = content.substring(0, cursorPosition)
    const lines = textBeforeCursor.split('\n')
    
    let currentSection = 'general'
    
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (line.startsWith('## Professional Summary')) {
        currentSection = 'summary'
        break
      } else if (line.startsWith('## Professional Experience')) {
        currentSection = 'experience'
        break
      } else if (line.startsWith('## Technical Skills') || line.startsWith('## Skills')) {
        currentSection = 'skills'
        break
      } else if (line.startsWith('## Education')) {
        currentSection = 'education'
        break
      } else if (line.startsWith('# ') || line.includes('@') || line.includes('📧')) {
        currentSection = 'contact'
        break
      }
    }
    
    return currentSection
  }

  const handleTextSelection = () => {
    if (!textareaRef.current) return
    
    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const selected = markdownContent.substring(start, end)
    
    if (selected.length > 0) {
      setSelectedText(selected)
      setSelectionStart(start)
      setSelectionEnd(end)
    }
    
    // Update current section
    const section = detectCurrentSection(markdownContent, start)
    setCurrentSection(section)
  }

  const handleAISuggestions = async () => {
    setIsAILoading(true)
    setShowSuggestions(true)
    
    try {
      const cursorPosition = textareaRef.current?.selectionStart || 0
      const section = detectCurrentSection(markdownContent, cursorPosition)
      setCurrentSection(section)
      
      // Analyze required fields
      const missingFields = analyzeRequiredFields(markdownContent)
      setRequiredFields(missingFields)
      
      // Generate suggestions for current section
      const aiSuggestions = await generateAISuggestions(selectedText || markdownContent, section)
      setSuggestions(aiSuggestions)
    } catch (error) {
      console.error('Failed to generate AI suggestions:', error)
    } finally {
      setIsAILoading(false)
    }
  }

  const applySuggestion = (suggestion: AISuggestion) => {
    if (!textareaRef.current) return
    
    let newContent = markdownContent
    
    if (selectedText) {
      newContent = markdownContent.substring(0, selectionStart) + 
                  suggestion.content + 
                  markdownContent.substring(selectionEnd)
    } else {
      const cursorPos = textareaRef.current.selectionStart
      newContent = markdownContent.substring(0, cursorPos) + 
                  suggestion.content + 
                  markdownContent.substring(cursorPos)
    }
    
    setMarkdownContent(newContent)
    setSelectedText('')
    
    // Re-analyze required fields after applying suggestion
    const updatedFields = analyzeRequiredFields(newContent)
    setRequiredFields(updatedFields)
    
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  const fillRequiredField = (field: RequiredField, suggestion: string) => {
    let newContent = markdownContent
    
    // Find and replace the placeholder with the suggestion
    const placeholderPatterns: { [key: string]: RegExp } = {
      'Name': /Your Name/g,
      'Title': /Professional Title/g,
      'Email': /email@example\.com/g,
      'Phone': /\+1 \(555\) 123-4567/g,
      'Location': /City, State/g,
      'Professional Summary': /Write a compelling professional summary[^.]*\./g,
      'Job Description': /Achievement or responsibility/g
    }
    
    const pattern = placeholderPatterns[field.field]
    if (pattern) {
      newContent = newContent.replace(pattern, suggestion)
      setMarkdownContent(newContent)
      
      // Update required fields
      const updatedFields = analyzeRequiredFields(newContent)
      setRequiredFields(updatedFields)
    }
  }

  const insertMarkdown = (syntax: string) => {
    if (!textareaRef.current) return

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const selectedText = markdownContent.substring(start, end)
    
    let newText = ''
    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`
        break
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`
        break
      case 'bullet':
        newText = `\n- ${selectedText || 'list item'}`
        break
      case 'number':
        newText = `\n1. ${selectedText || 'list item'}`
        break
    }

    const newContent = markdownContent.substring(0, start) + newText + markdownContent.substring(end)
    setMarkdownContent(newContent)
    
    // Restore cursor position
    setTimeout(() => {
      textareaRef.current?.focus()
      textareaRef.current?.setSelectionRange(start + newText.length, start + newText.length)
    }, 0)
  }

  const renderMarkdown = (text: string) => {
    return text
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 text-gray-900">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 text-gray-800 border-b-2 border-blue-500 pb-1">$2</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 text-gray-800">$3</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 mb-1">• $1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 mb-1">$1. $2</li>')
      .replace(/📧|📱|📍|🔗/g, '<span class="text-blue-600">$&</span>')
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      .replace(/^(.)/gm, '<p class="mb-4">$1')
      .replace(/(.*)$/gm, '$1</p>')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-lg relative">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI-Powered Resume Editor</h3>
            {requiredFields.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600">
                  {requiredFields.length} field{requiredFields.length > 1 ? 's' : ''} need{requiredFields.length === 1 ? 's' : ''} attention
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave && onSave(markdownContent)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => onExportPDF && onExportPDF()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              PDF
            </button>
            <button
              onClick={() => onExportDOCX && onExportDOCX()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              DOCX
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 p-3 flex items-center gap-2 flex-wrap bg-gray-50">
        <button
          onClick={() => insertMarkdown('bold')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Bold (**text**)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={() => insertMarkdown('italic')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Italic (*text*)"
        >
          <Italic className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          onClick={() => insertMarkdown('bullet')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Bullet List (- item)"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => insertMarkdown('number')}
          className="p-2 rounded hover:bg-gray-200 transition-colors"
          title="Numbered List (1. item)"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          onClick={() => setIsPreview(!isPreview)}
          className={`p-2 rounded transition-colors ${isPreview ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
          title="Toggle Preview"
        >
          {isPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          onClick={handleAISuggestions}
          disabled={isAILoading}
          className="p-2 rounded hover:bg-purple-100 text-purple-600 disabled:opacity-50 flex items-center gap-1 font-medium"
          title="Get AI Suggestions"
        >
          {isAILoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {isAILoading ? 'Generating...' : 'AI Suggestions'}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex h-[600px] relative">
        {/* Editor Side */}
        <div className={`${isPreview ? 'w-1/2' : 'w-full'} border-r border-gray-200`}>
          <textarea
            ref={textareaRef}
            value={markdownContent}
            onChange={(e) => {
              setMarkdownContent(e.target.value)
              const fields = analyzeRequiredFields(e.target.value)
              setRequiredFields(fields)
            }}
            onSelect={handleTextSelection}
            onClick={handleTextSelection}
            placeholder="Edit your entire resume in markdown format..."
            className="w-full h-full p-4 border-0 resize-none focus:outline-none font-mono text-sm"
          />
        </div>

        {/* Preview Side */}
        {isPreview && (
          <div className="w-1/2 overflow-auto">
            <div className="p-6 bg-white">
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(markdownContent) }}
              />
            </div>
          </div>
        )}

        {/* AI Suggestions Panel */}
        {showSuggestions && (
          <div className="absolute top-0 right-0 w-96 h-full bg-white border-l border-gray-200 shadow-lg z-10">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                AI Suggestions
                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">
                  {currentSection}
                </span>
              </h4>
              <button
                onClick={() => setShowSuggestions(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto h-full">
              {/* Required Fields Section */}
              {requiredFields.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    Required Fields
                  </h5>
                  <div className="space-y-3">
                    {requiredFields.map((field, index) => (
                      <div key={index} className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="text-sm font-medium text-amber-800 mb-2">
                          {field.section} - {field.field}
                        </div>
                        <div className="space-y-1">
                          {field.suggestions.slice(0, 2).map((suggestion, suggestionIndex) => (
                            <button
                              key={suggestionIndex}
                              onClick={() => fillRequiredField(field, suggestion)}
                              className="block w-full text-left text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-100 p-2 rounded transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Suggestions */}
              {isAILoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
                  <span className="ml-2 text-gray-600">Generating suggestions...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900 mb-3">
                    Content Suggestions
                  </h5>
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className="p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors cursor-pointer group"
                      onClick={() => applySuggestion(suggestion)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded">
                          {suggestion.category}
                        </span>
                        <div className="flex items-center gap-2">
                          {suggestion.isRequired && (
                            <AlertCircle className="w-3 h-3 text-amber-500" />
                          )}
                          <span className="text-xs text-gray-500">
                            {suggestion.confidence}%
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 group-hover:text-gray-900">
                        {suggestion.content}
                      </p>
                      <div className="flex items-center justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1">
                          <Plus className="w-3 h-3" />
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleAISuggestions}
                  disabled={isAILoading}
                  className="w-full p-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Generate New Suggestions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Markdown Guide */}
      <div className="border-t border-gray-200 p-3 text-xs text-gray-500 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">Markdown Guide:</span> 
            <span className="ml-2"># Heading</span>
            <span className="ml-2">**bold**</span>
            <span className="ml-2">*italic*</span>
            <span className="ml-2">- bullet</span>
            <span className="ml-2">1. numbered</span>
          </div>
          <div className="text-right">
            Lines: {markdownContent.split('\n').length} | 
            Characters: {markdownContent.length}
          </div>
        </div>
      </div>
    </div>
  )
}