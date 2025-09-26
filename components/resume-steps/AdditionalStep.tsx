"use client"

import React from 'react'
import { StepWrapper } from './StepWrapper'
import { Plus, Trash2, Award, Code, Globe, Calendar, Building, ExternalLink } from 'lucide-react'

interface ProjectItem {
  name: string
  description: string
  technologies: string
  link: string
}

interface CertificationItem {
  name: string
  issuer: string
  date: string
}

interface LanguageItem {
  language: string
  proficiency: string
}

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
  certifications: CertificationItem[]
  projects: ProjectItem[]
  languages: LanguageItem[]
  achievements: string[]
}

interface AdditionalStepProps {
  resumeInputs: ResumeInputs
  setResumeInputs: React.Dispatch<React.SetStateAction<ResumeInputs>>
}

export function AdditionalStep({ resumeInputs, setResumeInputs }: AdditionalStepProps) {

  // Projects functions
  const addProject = () => {
    setResumeInputs(prev => ({
      ...prev,
      projects: [
        ...prev.projects,
        { name: '', description: '', technologies: '', link: '' }
      ]
    }))
  }

  const removeProject = (index: number) => {
    setResumeInputs(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }))
  }

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    setResumeInputs(prev => ({
      ...prev,
      projects: prev.projects.map((project, i) => 
        i === index ? { ...project, [field]: value } : project
      )
    }))
  }

  // Certifications functions
  const addCertification = () => {
    setResumeInputs(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: '', issuer: '', date: '' }
      ]
    }))
  }

  const removeCertification = (index: number) => {
    setResumeInputs(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const updateCertification = (index: number, field: keyof CertificationItem, value: string) => {
    setResumeInputs(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }))
  }

  // Languages functions
  const addLanguage = () => {
    setResumeInputs(prev => ({
      ...prev,
      languages: [
        ...prev.languages,
        { language: '', proficiency: '' }
      ]
    }))
  }

  const removeLanguage = (index: number) => {
    setResumeInputs(prev => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index)
    }))
  }

  const updateLanguage = (index: number, field: keyof LanguageItem, value: string) => {
    setResumeInputs(prev => ({
      ...prev,
      languages: prev.languages.map((lang, i) => 
        i === index ? { ...lang, [field]: value } : lang
      )
    }))
  }

  const proficiencyLevels = [
    'Native',
    'Fluent',
    'Advanced',
    'Intermediate',
    'Basic',
    'Beginner'
  ]

  return (
    <StepWrapper
      title="Additional Information"
      description="Add projects, certifications, and languages to strengthen your resume"
      icon={Plus}
    >
      <div className="space-y-8">
        
        {/* Projects Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Projects
              </h3>
            </div>
            <button
              onClick={addProject}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </button>
          </div>

          {resumeInputs.projects.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Code className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No projects added yet. Click "Add Project" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resumeInputs.projects.map((project, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Project #{index + 1}
                    </h4>
                    <button
                      onClick={() => removeProject(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Name *
                      </label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => updateProject(index, 'name', e.target.value)}
                        placeholder="E-commerce Platform, Mobile App, etc."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Technologies Used
                      </label>
                      <input
                        type="text"
                        value={project.technologies}
                        onChange={(e) => updateProject(index, 'technologies', e.target.value)}
                        placeholder="React, Node.js, MongoDB, etc."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Link
                      </label>
                      <div className="relative">
                        <ExternalLink className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          value={project.link}
                          onChange={(e) => updateProject(index, 'link', e.target.value)}
                          placeholder="https://github.com/username/project"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Project Description
                      </label>
                      <textarea
                        value={project.description}
                        onChange={(e) => updateProject(index, 'description', e.target.value)}
                        placeholder="Describe the project, your role, and key achievements..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Certifications Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Certifications
              </h3>
            </div>
            <button
              onClick={addCertification}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Certification</span>
            </button>
          </div>

          {resumeInputs.certifications.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No certifications added yet. Click "Add Certification" to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {resumeInputs.certifications.map((cert, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Certification #{index + 1}
                    </h4>
                    <button
                      onClick={() => removeCertification(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Certification Name *
                      </label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => updateCertification(index, 'name', e.target.value)}
                        placeholder="AWS Certified Solutions Architect"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Issuing Organization
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                          placeholder="Amazon Web Services"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date Obtained
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => updateCertification(index, 'date', e.target.value)}
                          placeholder="March 2024"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Languages Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Languages
              </h3>
            </div>
            <button
              onClick={addLanguage}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Language</span>
            </button>
          </div>

          {resumeInputs.languages.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No languages added yet. Click "Add Language" to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resumeInputs.languages.map((lang, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                      Language #{index + 1}
                    </h4>
                    <button
                      onClick={() => removeLanguage(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Language *
                      </label>
                      <input
                        type="text"
                        value={lang.language}
                        onChange={(e) => updateLanguage(index, 'language', e.target.value)}
                        placeholder="Spanish, French, Mandarin, etc."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Proficiency Level
                      </label>
                      <select
                        value={lang.proficiency}
                        onChange={(e) => updateLanguage(index, 'proficiency', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select proficiency</option>
                        {proficiencyLevels.map((level) => (
                          <option key={level} value={level}>
                            {level}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-100 mb-2">
            💡 Additional Information Tips
          </h4>
          <ul className="text-sm text-indigo-800 dark:text-indigo-200 space-y-1">
            <li>• <strong>Projects:</strong> Include personal, academic, or professional projects that showcase your skills</li>
            <li>• <strong>Certifications:</strong> Add relevant industry certifications and professional licenses</li>
            <li>• <strong>Languages:</strong> Include all languages you can communicate in professionally</li>
            <li>• <strong>Quality over quantity:</strong> Focus on the most relevant and impressive items</li>
          </ul>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional sections: {resumeInputs.projects.length} projects, {resumeInputs.certifications.length} certifications, {resumeInputs.languages.length} languages
              </span>
            </div>
            <div className="text-indigo-600 text-sm font-medium">
              ✓ Ready for next step
            </div>
          </div>
        </div>
      </div>
    </StepWrapper>
  )
}
