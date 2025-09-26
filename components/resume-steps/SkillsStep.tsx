"use client"

import React, { useState } from 'react'
import { StepWrapper } from './StepWrapper'
import { AISuggestions } from './AISuggestions'
import { Award, Plus, X, Tag } from 'lucide-react'

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

interface AISuggestion {
  id: string
  type: 'summary' | 'experience' | 'skills' | 'achievement'
  content: string
  category: string
  icon: string
  confidence: number
  preview?: string
}

interface SkillsStepProps {
  resumeInputs: ResumeInputs
  setResumeInputs: React.Dispatch<React.SetStateAction<ResumeInputs>>
  aiSuggestions: AISuggestion[]
  onApplySuggestion: (suggestion: AISuggestion) => void
  isGenerating: boolean
  selectedSuggestions: string[]
}

export function SkillsStep({
  resumeInputs,
  setResumeInputs,
  aiSuggestions,
  onApplySuggestion,
  isGenerating,
  selectedSuggestions
}: SkillsStepProps) {
  const [newSkill, setNewSkill] = useState('')

  const addSkill = (skill: string) => {
    if (skill.trim() && !resumeInputs.skills.includes(skill.trim())) {
      setResumeInputs(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }))
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setResumeInputs(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill)
      setNewSkill('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  // Generate role and industry-specific skill suggestions
  const generateSkillSuggestions = (): AISuggestion[] => {
    const title = resumeInputs.title.toLowerCase()
    const suggestions: AISuggestion[] = []

    // Software Engineering Skills
    if (title.includes('engineer') || title.includes('developer') || title.includes('software')) {
      suggestions.push(
        {
          id: 'skills-tech-1',
          type: 'skills',
          content: 'JavaScript, TypeScript, React, Node.js',
          category: 'Frontend Development',
          icon: '💻',
          confidence: 95,
          preview: 'Essential frontend technologies'
        },
        {
          id: 'skills-tech-2',
          type: 'skills',
          content: 'Python, Django, PostgreSQL, Redis',
          category: 'Backend Development',
          icon: '⚙️',
          confidence: 90,
          preview: 'Backend and database technologies'
        },
        {
          id: 'skills-tech-3',
          type: 'skills',
          content: 'AWS, Docker, Kubernetes, CI/CD',
          category: 'DevOps & Cloud',
          icon: '☁️',
          confidence: 88,
          preview: 'Cloud and deployment technologies'
        }
      )
    }

    // Marketing Skills
    if (title.includes('marketing') || title.includes('growth')) {
      suggestions.push(
        {
          id: 'skills-marketing-1',
          type: 'skills',
          content: 'Google Analytics, SEO, SEM, Social Media Marketing',
          category: 'Digital Marketing',
          icon: '📈',
          confidence: 92,
          preview: 'Core digital marketing skills'
        },
        {
          id: 'skills-marketing-2',
          type: 'skills',
          content: 'Content Marketing, Email Marketing, Marketing Automation',
          category: 'Content & Automation',
          icon: '📝',
          confidence: 88,
          preview: 'Content creation and automation tools'
        },
        {
          id: 'skills-marketing-3',
          type: 'skills',
          content: 'Adobe Creative Suite, Canva, Video Editing',
          category: 'Creative Tools',
          icon: '🎨',
          confidence: 85,
          preview: 'Design and creative software'
        }
      )
    }

    // Sales Skills
    if (title.includes('sales') || title.includes('account')) {
      suggestions.push(
        {
          id: 'skills-sales-1',
          type: 'skills',
          content: 'Salesforce, HubSpot, CRM Management, Lead Generation',
          category: 'Sales Tools',
          icon: '💰',
          confidence: 90,
          preview: 'Essential sales and CRM platforms'
        },
        {
          id: 'skills-sales-2',
          type: 'skills',
          content: 'Negotiation, Relationship Building, Account Management',
          category: 'Sales Skills',
          icon: '🤝',
          confidence: 88,
          preview: 'Core sales competencies'
        }
      )
    }

    // Data & Analytics Skills
    if (title.includes('data') || title.includes('analyst') || title.includes('scientist')) {
      suggestions.push(
        {
          id: 'skills-data-1',
          type: 'skills',
          content: 'Python, R, SQL, Pandas, NumPy',
          category: 'Programming & Analysis',
          icon: '📊',
          confidence: 95,
          preview: 'Data analysis programming languages'
        },
        {
          id: 'skills-data-2',
          type: 'skills',
          content: 'Tableau, Power BI, Excel, Data Visualization',
          category: 'Visualization Tools',
          icon: '📈',
          confidence: 90,
          preview: 'Data visualization and reporting tools'
        },
        {
          id: 'skills-data-3',
          type: 'skills',
          content: 'Machine Learning, TensorFlow, Scikit-learn, Statistics',
          category: 'Advanced Analytics',
          icon: '🤖',
          confidence: 85,
          preview: 'Machine learning and statistical analysis'
        }
      )
    }

    // Design Skills
    if (title.includes('design') || title.includes('ux') || title.includes('ui')) {
      suggestions.push(
        {
          id: 'skills-design-1',
          type: 'skills',
          content: 'Figma, Sketch, Adobe XD, Prototyping',
          category: 'Design Tools',
          icon: '🎨',
          confidence: 95,
          preview: 'Essential design and prototyping tools'
        },
        {
          id: 'skills-design-2',
          type: 'skills',
          content: 'User Research, Usability Testing, Wireframing',
          category: 'UX Research',
          icon: '🔍',
          confidence: 88,
          preview: 'User experience research methods'
        }
      )
    }

    // Management Skills
    if (title.includes('manager') || title.includes('director') || title.includes('lead')) {
      suggestions.push(
        {
          id: 'skills-mgmt-1',
          type: 'skills',
          content: 'Team Leadership, Project Management, Strategic Planning',
          category: 'Leadership',
          icon: '👥',
          confidence: 90,
          preview: 'Core leadership and management skills'
        },
        {
          id: 'skills-mgmt-2',
          type: 'skills',
          content: 'Agile, Scrum, Jira, Confluence',
          category: 'Project Management',
          icon: '📋',
          confidence: 85,
          preview: 'Project management methodologies and tools'
        }
      )
    }

    // General Professional Skills
    suggestions.push(
      {
        id: 'skills-general-1',
        type: 'skills',
        content: 'Communication, Problem Solving, Critical Thinking',
        category: 'Soft Skills',
        icon: '🧠',
        confidence: 80,
        preview: 'Essential soft skills for any role'
      },
      {
        id: 'skills-general-2',
        type: 'skills',
        content: 'Microsoft Office, Google Workspace, Slack',
        category: 'Productivity Tools',
        icon: '💼',
        confidence: 75,
        preview: 'Common workplace productivity tools'
      }
    )

    return suggestions.filter(suggestion => 
      !suggestion.content.split(', ').some(skill => 
        resumeInputs.skills.includes(skill.trim())
      )
    )
  }

  const skillSuggestions = generateSkillSuggestions()
  const allSuggestions = [...aiSuggestions, ...skillSuggestions]

  // Categorize existing skills
  const categorizeSkills = () => {
    const categories = {
      'Technical': [] as string[],
      'Soft Skills': [] as string[],
      'Tools & Software': [] as string[],
      'Other': [] as string[]
    }

    resumeInputs.skills.forEach(skill => {
      const skillLower = skill.toLowerCase()
      if (skillLower.includes('javascript') || skillLower.includes('python') || skillLower.includes('react') || 
          skillLower.includes('node') || skillLower.includes('sql') || skillLower.includes('html') || 
          skillLower.includes('css') || skillLower.includes('java') || skillLower.includes('c++')) {
        categories['Technical'].push(skill)
      } else if (skillLower.includes('communication') || skillLower.includes('leadership') || 
                 skillLower.includes('teamwork') || skillLower.includes('problem') || 
                 skillLower.includes('management') || skillLower.includes('negotiation')) {
        categories['Soft Skills'].push(skill)
      } else if (skillLower.includes('office') || skillLower.includes('excel') || skillLower.includes('photoshop') || 
                 skillLower.includes('figma') || skillLower.includes('slack') || skillLower.includes('jira') ||
                 skillLower.includes('salesforce') || skillLower.includes('tableau')) {
        categories['Tools & Software'].push(skill)
      } else {
        categories['Other'].push(skill)
      }
    })

    return categories
  }

  const categorizedSkills = categorizeSkills()

  return (
    <StepWrapper
      title="Skills & Expertise"
      description="Showcase your technical and professional skills"
      icon={Award}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skills Input & Display */}
        <div className="space-y-6">
          {/* Add New Skill */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Skills
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., JavaScript, Project Management, Adobe Photoshop"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <button
                onClick={handleAddSkill}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Skills Display by Category */}
          <div className="space-y-4">
            {Object.entries(categorizedSkills).map(([category, skills]) => (
              skills.length > 0 && (
                <div key={category}>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {category} ({skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Skills Tips */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
              💡 Skills Tips
            </h4>
            <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1">
              <li>• Include both technical and soft skills</li>
              <li>• Be specific (e.g., "React.js" instead of "Frontend")</li>
              <li>• Add 8-15 skills for optimal impact</li>
              <li>• Include tools and technologies you've used</li>
              <li>• Match skills to your target job requirements</li>
            </ul>
          </div>
        </div>

        {/* AI Suggestions */}
        <div>
          <AISuggestions
            suggestions={allSuggestions}
            onApplySuggestion={onApplySuggestion}
            selectedSuggestions={selectedSuggestions}
            isGenerating={isGenerating}
            title="Skill Suggestions"
            className="h-fit sticky top-4"
          />
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mt-8 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              resumeInputs.skills.length >= 5 ? 'bg-orange-500' : 'bg-gray-300'
            }`}></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {resumeInputs.skills.length >= 5
                ? `${resumeInputs.skills.length} skills added - Great!`
                : `Add at least 5 skills (${resumeInputs.skills.length}/5)`}
            </span>
          </div>
          {resumeInputs.skills.length >= 5 && (
            <div className="text-orange-600 text-sm font-medium">
              ✓ Ready for next step
            </div>
          )}
        </div>
      </div>
    </StepWrapper>
  )
}
