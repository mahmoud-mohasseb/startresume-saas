"use client"

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Save, 
  Download, 
  FileText, 
  Palette, 
  Camera, 
  Plus, 
  Minus, 
  Loader2,
  CheckCircle,
  AlertCircle,
  User,
  Briefcase,
  GraduationCap,
  Award
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'

interface PersonalInfo {
  fullName: string
  email: string
  phone: string
  location: string
  linkedin: string
  website: string
  summary: string
  profilePicture?: string
}

interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

interface Education {
  id: string
  school: string
  degree: string
  field: string
  graduationDate: string
  gpa: string
}

interface ResumeData {
  personalInfo: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: string[]
  achievements: string[]
}

interface ResumeEditorProps {
  resumeData: ResumeData
  onDataChange: (data: ResumeData) => void
  selectedTemplate: string
  onTemplateChange: (template: string) => void
  selectedColor: string
  onColorChange: (color: string) => void
  onExport: (format: 'pdf' | 'docx') => void
  isExporting: boolean
}

const templates = [
  { id: 'modern', name: 'Modern', description: 'Clean and contemporary' },
  { id: 'professional', name: 'Professional', description: 'Traditional business style' },
  { id: 'creative', name: 'Creative', description: 'Bold and artistic' },
  { id: 'minimal', name: 'Minimal', description: 'Simple and elegant' }
]

const colorOptions = [
  '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', 
  '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'
]

export function ResumeEditor({
  resumeData,
  onDataChange,
  selectedTemplate,
  onTemplateChange,
  selectedColor,
  onColorChange,
  onExport,
  isExporting
}: ResumeEditorProps) {
  const { user } = useUser()
  const [activeTab, setActiveTab] = useState('personal')
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [supabase, setSupabase] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Initialize Supabase client
  useEffect(() => {
    const initSupabase = async () => {
      try {
        const { createClient } = await import('@/lib/supabase')
        setSupabase(createClient())
      } catch (error) {
        console.error('Failed to initialize Supabase:', error)
      }
    }
    initSupabase()
  }, [])

  // Autosave functionality
  const saveResume = useCallback(async () => {
    if (!user || !supabase || isSaving) return

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('resumes')
        .upsert({
          user_id: user.id,
          title: resumeData.personalInfo.fullName || 'Untitled Resume',
          json_content: resumeData,
          template_id: selectedTemplate,
          theme_color: selectedColor,
          profile_picture_url: resumeData.personalInfo.profilePicture,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error
      
      setLastSaved(new Date())
      toast.success('Resume saved successfully')
    } catch (error) {
      console.error('Error saving resume:', error)
      toast.error('Failed to save resume')
    } finally {
      setIsSaving(false)
    }
  }, [user, supabase, resumeData, selectedTemplate, selectedColor, isSaving])

  // Auto-save every 5 seconds
  useEffect(() => {
    const interval = setInterval(saveResume, 5000)
    return () => clearInterval(interval)
  }, [saveResume])

  // Profile picture upload
  const handleProfilePictureUpload = async (file: File) => {
    if (!supabase || !user) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName)

      onDataChange({
        ...resumeData,
        personalInfo: {
          ...resumeData.personalInfo,
          profilePicture: publicUrl
        }
      })

      toast.success('Profile picture uploaded successfully')
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      toast.error('Failed to upload profile picture')
    } finally {
      setIsUploading(false)
    }
  }

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: ''
    }
    onDataChange({
      ...resumeData,
      experience: [...resumeData.experience, newExperience]
    })
  }

  const removeExperience = (id: string) => {
    onDataChange({
      ...resumeData,
      experience: resumeData.experience.filter(exp => exp.id !== id)
    })
  }

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    onDataChange({
      ...resumeData,
      experience: resumeData.experience.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    })
  }

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      school: '',
      degree: '',
      field: '',
      graduationDate: '',
      gpa: ''
    }
    onDataChange({
      ...resumeData,
      education: [...resumeData.education, newEducation]
    })
  }

  const removeEducation = (id: string) => {
    onDataChange({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id)
    })
  }

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    onDataChange({
      ...resumeData,
      education: resumeData.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    })
  }

  const addSkill = () => {
    onDataChange({
      ...resumeData,
      skills: [...resumeData.skills, '']
    })
  }

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...resumeData.skills]
    newSkills[index] = value
    onDataChange({
      ...resumeData,
      skills: newSkills
    })
  }

  const removeSkill = (index: number) => {
    onDataChange({
      ...resumeData,
      skills: resumeData.skills.filter((_, i) => i !== index)
    })
  }

  const tabs = [
    { id: 'personal', name: 'Personal Info', icon: User },
    { id: 'experience', name: 'Experience', icon: Briefcase },
    { id: 'education', name: 'Education', icon: GraduationCap },
    { id: 'skills', name: 'Skills & Achievements', icon: Award }
  ]

  return (
    <div className="bg-card border border-border rounded-xl shadow-lg">
      {/* Toolbar */}
      <div className="border-b border-border p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Template Selector */}
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <select
              value={selectedTemplate}
              onChange={(e) => onTemplateChange(e.target.value)}
              className="px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-1">
              {colorOptions.map(color => (
                <button
                  key={color}
                  onClick={() => onColorChange(color)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    selectedColor === color ? 'border-foreground scale-110' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Profile Picture Upload */}
          <div className="flex items-center gap-2">
            <Camera className="h-4 w-4 text-muted-foreground" />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleProfilePictureUpload(file)
              }}
              className="hidden"
              id="profile-upload"
            />
            <label
              htmlFor="profile-upload"
              className="px-3 py-2 border border-input rounded-lg bg-background text-sm cursor-pointer hover:bg-accent transition-colors flex items-center gap-2"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              Upload Photo
            </label>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => onExport('pdf')}
              disabled={isExporting}
              className="btn-secondary flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              PDF
            </button>
            <button
              onClick={() => onExport('docx')}
              disabled={isExporting}
              className="btn-secondary flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              DOCX
            </button>
          </div>
        </div>

        {/* Save Status */}
        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : lastSaved ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Saved {lastSaved.toLocaleTimeString()}</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <span>Unsaved changes</span>
            </>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'personal' && (
            <motion.div
              key="personal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) => onDataChange({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, fullName: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) => onDataChange({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, email: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) => onDataChange({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, phone: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) => onDataChange({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, location: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="New York, NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) => onDataChange({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Website</label>
                  <input
                    type="url"
                    value={resumeData.personalInfo.website}
                    onChange={(e) => onDataChange({
                      ...resumeData,
                      personalInfo: { ...resumeData.personalInfo, website: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="https://johndoe.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Professional Summary</label>
                <textarea
                  value={resumeData.personalInfo.summary}
                  onChange={(e) => onDataChange({
                    ...resumeData,
                    personalInfo: { ...resumeData.personalInfo, summary: e.target.value }
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="Brief summary of your professional background and key achievements..."
                />
              </div>
            </motion.div>
          )}

          {activeTab === 'experience' && (
            <motion.div
              key="experience"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <button
                  onClick={addExperience}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Experience
                </button>
              </div>

              {resumeData.experience.map((exp, index) => (
                <div key={exp.id} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Experience #{index + 1}
                    </span>
                    {resumeData.experience.length > 1 && (
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="text-destructive hover:text-destructive/80 p-1"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Position</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Job Title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Start Date</label>
                      <input
                        type="month"
                        value={exp.startDate}
                        onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">End Date</label>
                      <input
                        type="month"
                        value={exp.endDate}
                        onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'education' && (
            <motion.div
              key="education"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Education</h3>
                <button
                  onClick={addEducation}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Education
                </button>
              </div>

              {resumeData.education.map((edu, index) => (
                <div key={edu.id} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">
                      Education #{index + 1}
                    </span>
                    {resumeData.education.length > 1 && (
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="text-destructive hover:text-destructive/80 p-1"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">School</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="University Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Bachelor's, Master's, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Field of Study</label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Computer Science, Business, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Graduation Date</label>
                      <input
                        type="month"
                        value={edu.graduationDate}
                        onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">GPA (Optional)</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="3.8/4.0"
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div
              key="skills"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Skills</h3>
                  <button
                    onClick={addSkill}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Skill
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resumeData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateSkill(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter skill"
                      />
                      <button
                        onClick={() => removeSkill(index)}
                        className="text-destructive hover:text-destructive/80 p-2"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                <textarea
                  value={resumeData.achievements.join('\n')}
                  onChange={(e) => onDataChange({
                    ...resumeData,
                    achievements: e.target.value.split('\n').filter(a => a.trim())
                  })}
                  rows={6}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  placeholder="List your achievements, certifications, awards, etc. (one per line)"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
