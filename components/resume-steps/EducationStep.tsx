"use client"

import React from 'react'
import { StepWrapper } from './StepWrapper'
import { GraduationCap, Plus, Trash2, Building, Calendar, Award, Star, BookOpen, Users } from 'lucide-react'

interface EducationItem {
  school: string
  degree: string
  field: string
  year: string
  gpa: string
  location: string
  honors: string
  coursework: string
  activities: string
  description: string
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
  education: EducationItem[]
  skills: string[]
  certifications: any[]
  projects: any[]
  languages: any[]
  achievements: string[]
}

interface EducationStepProps {
  resumeInputs: ResumeInputs
  setResumeInputs: React.Dispatch<React.SetStateAction<ResumeInputs>>
}

export function EducationStep({ resumeInputs, setResumeInputs }: EducationStepProps) {

  const addEducation = () => {
    setResumeInputs(prev => ({
      ...prev,
      education: [
        ...prev.education,
        { 
          school: '', 
          degree: '', 
          field: '', 
          year: '', 
          gpa: '', 
          location: '',
          honors: '',
          coursework: '',
          activities: '',
          description: ''
        }
      ]
    }))
  }

  const removeEducation = (index: number) => {
    setResumeInputs(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }))
  }

  const updateEducation = (index: number, field: keyof EducationItem, value: string) => {
    setResumeInputs(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => 
        i === index ? { ...edu, [field]: value } : edu
      )
    }))
  }

  // Initialize with one education if empty
  React.useEffect(() => {
    if (resumeInputs.education.length === 0) {
      addEducation()
    }
  }, [])

  const degreeOptions = [
    'High School Diploma',
    'Associate Degree',
    "Bachelor's Degree",
    "Master's Degree",
    'MBA',
    'PhD',
    'Doctorate',
    'Certificate',
    'Professional Certification',
    'Other'
  ]

  const fieldOptions = [
    'Computer Science',
    'Business Administration',
    'Engineering',
    'Marketing',
    'Finance',
    'Psychology',
    'Medicine',
    'Law',
    'Education',
    'Arts',
    'Sciences',
    'Mathematics',
    'Communications',
    'Other'
  ]

  return (
    <StepWrapper
      title="Education"
      description="Add your educational background and qualifications"
      icon={GraduationCap}
    >
      <div className="space-y-6">
        {/* Education Forms */}
        <div className="space-y-6">
          {resumeInputs.education.map((edu, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Education #{index + 1}
                </h3>
                {resumeInputs.education.length > 1 && (
                  <button
                    onClick={() => removeEducation(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* School/University */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    School/University *
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => updateEducation(index, 'school', e.target.value)}
                      placeholder="Harvard University, MIT, etc."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={edu.location}
                    onChange={(e) => updateEducation(index, 'location', e.target.value)}
                    placeholder="Boston, MA"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Degree */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Degree *
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={edu.degree}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select degree</option>
                      {degreeOptions.map((degree) => (
                        <option key={degree} value={degree}>
                          {degree}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Field of Study */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Field of Study
                  </label>
                  <select
                    value={edu.field}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select field</option>
                    {fieldOptions.map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Graduation Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Graduation Year
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => updateEducation(index, 'year', e.target.value)}
                      placeholder="2023, May 2024, Expected 2025"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* GPA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GPA (Optional)
                  </label>
                  <input
                    type="text"
                    value={edu.gpa}
                    onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                    placeholder="3.8/4.0, 3.9, Magna Cum Laude"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                {/* Honors & Awards */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Honors & Awards</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={edu.honors}
                    onChange={(e) => updateEducation(index, 'honors', e.target.value)}
                    placeholder="Magna Cum Laude, Dean's List, Phi Beta Kappa, etc."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Relevant Coursework */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>Relevant Coursework</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={edu.coursework}
                    onChange={(e) => updateEducation(index, 'coursework', e.target.value)}
                    placeholder="Data Structures, Machine Learning, Corporate Finance, etc."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Activities & Organizations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-500" />
                      <span>Activities & Organizations</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={edu.activities}
                    onChange={(e) => updateEducation(index, 'activities', e.target.value)}
                    placeholder="Student Government, Debate Team, Engineering Club, etc."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    value={edu.description}
                    onChange={(e) => updateEducation(index, 'description', e.target.value)}
                    placeholder="Thesis topic, research projects, notable achievements, etc."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>
              </div>

              {/* Education Summary */}
              {(edu.school || edu.degree) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Preview:</strong> {edu.degree} {edu.field && `in ${edu.field}`} {edu.school && `from ${edu.school}`} {edu.year && `(${edu.year})`}
                    {edu.gpa && ` - ${edu.gpa}`}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Add Education Button */}
          <button
            onClick={addEducation}
            className="w-full flex items-center justify-center space-x-2 py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              Add Another Education
            </span>
          </button>
        </div>

        {/* Education Tips */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            💡 Education Tips
          </h4>
          <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
            <li>• <strong>Order:</strong> List your highest or most recent degree first</li>
            <li>• <strong>GPA:</strong> Only include if it's 3.5 or higher (or equivalent)</li>
            <li>• <strong>Honors:</strong> Include academic distinctions and awards</li>
            <li>• <strong>Coursework:</strong> Add relevant courses for recent graduates or career changers</li>
            <li>• <strong>Activities:</strong> Include leadership roles and relevant organizations</li>
            <li>• <strong>Details:</strong> Mention thesis topics, research, or significant projects</li>
          </ul>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                resumeInputs.education.length > 0 && resumeInputs.education[0].school 
                  ? 'bg-teal-500' : 'bg-gray-300'
              }`}></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {resumeInputs.education.length > 0 && resumeInputs.education[0].school
                  ? `${resumeInputs.education.length} education entr${resumeInputs.education.length === 1 ? 'y' : 'ies'} added`
                  : 'Add at least one education entry'}
              </span>
            </div>
            <div className="text-teal-600 text-sm font-medium">
              ✓ Ready for next step
            </div>
          </div>
        </div>
      </div>
    </StepWrapper>
  )
}
