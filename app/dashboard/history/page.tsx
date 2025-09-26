"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import { createAdminClient } from '@/lib/supabase'
import { 
  FileText, 
  Calendar, 
  Download, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  MoreVertical,
  Star,
  Copy
} from 'lucide-react'
import Link from 'next/link'

interface Resume {
  id: string
  title: string
  html_content: string
  json_content: any
  ats_score: number
  created_at: string
  updated_at: string
}

export default function HistoryPage() {
  const { user } = useUser()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'score'>('updated')
  const [isExporting, setIsExporting] = useState<string | null>(null)

  // Load resumes on mount
  useEffect(() => {
    if (user) {
      loadResumes()
    }
  }, [user])

  const loadResumes = async () => {
    if (!user) return

    try {
      setIsLoading(true)
      
      const response = await fetch('/api/resumes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch resumes')
      }

      const data = await response.json()
      setResumes(data.resumes || [])
    } catch (error) {
      console.error('Error loading resumes:', error)
      toast.error('Failed to load resumes')
    } finally {
      setIsLoading(false)
    }
  }

  // Delete resume
  const deleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to delete resume')
      }

      setResumes(prev => prev.filter(r => r.id !== resumeId))
      toast.success('Resume deleted successfully')
    } catch (error) {
      console.error('Error deleting resume:', error)
      toast.error('Failed to delete resume')
    }
  }

  // Export resume
  const exportResume = async (resume: Resume, format: 'pdf' | 'docx') => {
    try {
      setIsExporting(resume.id)
      
      const response = await fetch(`/api/export?resumeId=${resume.id}&format=${format}`)

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${resume.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${format.toUpperCase()} exported successfully`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Export failed, please try again')
    } finally {
      setIsExporting(null)
    }
  }

  // Generate smart duplicate name
  const generateDuplicateName = (originalTitle: string, existingTitles: string[]) => {
    // Remove existing copy suffixes to get base name
    const baseTitle = originalTitle.replace(/\s*\(Copy\s*\d*\)$/, '').trim()
    
    // Check if base name already exists
    if (!existingTitles.includes(baseTitle)) {
      return baseTitle
    }
    
    // Find existing copies
    const copyPattern = new RegExp(`^${baseTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\(Copy\\s*(\\d*)\\)$`)
    const existingCopyNumbers = existingTitles
      .map(title => {
        const match = title.match(copyPattern)
        if (match) {
          return match[1] ? parseInt(match[1]) : 1
        }
        return null
      })
      .filter(num => num !== null)
      .sort((a, b) => a - b)
    
    // Find next available number
    let nextNumber = 1
    if (existingCopyNumbers.length > 0) {
      // Check for gaps in numbering
      for (let i = 1; i <= existingCopyNumbers[existingCopyNumbers.length - 1] + 1; i++) {
        if (!existingCopyNumbers.includes(i)) {
          nextNumber = i
          break
        }
      }
    }
    
    return nextNumber === 1 ? `${baseTitle} (Copy)` : `${baseTitle} (Copy ${nextNumber})`
  }

  // Duplicate resume
  const duplicateResume = async (resume: Resume) => {
    try {
      const existingTitles = resumes.map(r => r.title)
      const newTitle = generateDuplicateName(resume.title, existingTitles)
      
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTitle,
          html_content: resume.html_content,
          json_content: resume.json_content,
          ats_score: resume.ats_score || 0
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to duplicate resume')
      }

      await loadResumes()
      toast.success('Resume duplicated successfully')
    } catch (error) {
      console.error('Error duplicating resume:', error)
      toast.error('Failed to duplicate resume')
    }
  }

  // Filter and sort resumes
  const filteredResumes = resumes
    .filter(resume => 
      resume.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'score':
          return b.ats_score - a.ats_score
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Get ATS score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Extract clean preview text from HTML content
  const getCleanPreview = (htmlContent: string) => {
    if (!htmlContent) return 'No content available'
    
    // Remove style tags and their content
    let cleanText = htmlContent
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    
    // Convert HTML to plain text
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = cleanText
    
    // Get text content and clean it up
    let textContent = tempDiv.textContent || tempDiv.innerText || ''
    
    // Remove extra whitespace and normalize
    textContent = textContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
    
    // Extract meaningful content (skip CSS-like content)
    const lines = textContent.split('\n').filter(line => {
      const trimmed = line.trim()
      return trimmed.length > 0 && 
             !trimmed.includes('font-family:') &&
             !trimmed.includes('color:') &&
             !trimmed.includes('margin:') &&
             !trimmed.includes('padding:') &&
             !trimmed.includes('background:') &&
             !trimmed.startsWith('{') &&
             !trimmed.startsWith('}') &&
             !trimmed.includes('px') &&
             !trimmed.includes('#')
    })
    
    // Join meaningful lines and limit length
    const preview = lines.join(' ').substring(0, 200)
    return preview || 'Resume content'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
                Resume History
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Manage your saved resumes and cover letters
              </p>
            </div>
            
            <Link
              href="/dashboard/create"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Resume</span>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search resumes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:placeholder-gray-400"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 dark:bg-gray-800 dark:text-white dark:border-gray-600"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Date Created</option>
              <option value="title">Title</option>
              <option value="score">ATS Score</option>
            </select>
          </div>
        </motion.div>

        {/* Resume Grid */}
        {filteredResumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 dark:bg-gray-800/70 dark:border-gray-600/20 max-w-md mx-auto">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No resumes found' : 'No resumes yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Create your first resume to get started'
                }
              </p>
              {!searchTerm && (
                <Link
                  href="/dashboard/create"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-200"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Resume</span>
                </Link>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredResumes.map((resume, index) => (
              <motion.div
                key={resume.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-200 dark:bg-gray-800/70 dark:border-gray-600/20"
              >
                {/* Resume Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2">
                      {resume.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(resume.updated_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 py-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <button
                        onClick={() => duplicateResume(resume)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Duplicate</span>
                      </button>
                      <button
                        onClick={() => deleteResume(resume.id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ATS Score */}
                <div className="mb-4">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    resume.ats_score >= 80 
                      ? 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/30' 
                      : resume.ats_score >= 60 
                        ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/30'
                        : 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/30'
                  }`}>
                    <Star className="w-4 h-4 mr-1" />
                    ATS Score: {resume.ats_score}%
                  </div>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4 h-32 overflow-hidden">
                  <div className="text-xs text-gray-600 dark:text-gray-300 line-clamp-6">
                    {getCleanPreview(resume.html_content)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/dashboard/create?resumeId=${resume.id}`}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Link>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => exportResume(resume, 'pdf')}
                      disabled={isExporting === resume.id}
                      className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 dark:text-red-400 border border-red-600 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                    >
                      {isExporting === resume.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 dark:border-red-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>PDF</span>
                    </button>
                    
                    <button
                      onClick={() => exportResume(resume, 'docx')}
                      disabled={isExporting === resume.id}
                      className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 disabled:opacity-50 transition-colors"
                    >
                      {isExporting === resume.id ? (
                        <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>DOCX</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
