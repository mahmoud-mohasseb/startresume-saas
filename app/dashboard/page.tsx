"use client"

import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Eye,
  BarChart3,
  Sparkles,
  Calendar,
  TrendingUp,
  MessageSquare,
  History,
  Brain,
  Linkedin,
  Check
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { useSubscription } from '@/contexts/SubscriptionContext'

interface Resume {
  id: string
  title: string
  template_id: string
  theme_color: string
  ats_score: number
  created_at: string
  updated_at: string
}

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const { subscription, isLoading: planLoading } = useSubscription()
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchResumes()
    
    // Handle subscription success - simplified
    const success = searchParams.get('success')
    const plan = searchParams.get('plan')
    
    if (success === 'true' && plan) {
      toast.success(`🎉 Welcome to ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan!`)
      
      // Clear URL parameters
      window.history.replaceState({}, document.title, '/dashboard')
    }
  }, [searchParams])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        console.log('🔄 Page visible, refreshing data')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // DISABLED: Auto-refresh to prevent reloading
    // const interval = setInterval(() => {
    //   if (user) {
    //   }
    // }, 30000)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // clearInterval(interval)
    }
  }, [user])

  const fetchResumes = async () => {
    try {
      const response = await fetch('/api/resumes')
      if (response.ok) {
        const data = await response.json()
        setResumes(data.resumes || [])
      } else {
        throw new Error('Failed to fetch resumes')
      }
    } catch (error) {
      console.error('Error fetching resumes:', error)
      setError('Failed to load resumes')
    } finally {
      setLoading(false)
    }
  }

  const deleteResume = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      const response = await fetch(`/api/resumes/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setResumes(prev => prev.filter(resume => resume.id !== id))
      } else {
        throw new Error('Failed to delete resume')
      }
    } catch (error) {
      console.error('Error deleting resume:', error)
      alert('Failed to delete resume')
    }
  }

  const exportResume = async (resumeId: string, title: string) => {
    try {
      const response = await fetch(`/api/export?resumeId=${resumeId}&format=pdf`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_resume.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error('Failed to export resume')
      }
    } catch (error) {
      console.error('Error exporting resume:', error)
      alert('Failed to export resume. Please try again.')
    }
  }

  const getATSBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    return 'bg-red-100 text-red-800 border-red-200'
  }

  const stats = {
    totalResumes: resumes.length,
    avgATSScore: resumes.length > 0 ? Math.round(resumes.reduce((sum, r) => sum + r.ats_score, 0) / resumes.length) : 0,
    totalDownloads: resumes.length * 2, // Mock data
  }

  if (!isLoaded || planLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back, {user?.firstName || 'there'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage your resumes and track your job application success.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/create"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <Plus className="h-5 w-5" />
                Create Resume
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Resumes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalResumes}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg ATS Score</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgATSScore}%</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Downloads</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Available Usage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscription?.plan.isUnlimited ? '∞' : (subscription?.usage.remaining || 0)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <Sparkles className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {subscription?.plan.name || 'No Plan'} • Used: {subscription?.usage.current || 0}/{subscription?.plan.isUnlimited ? '∞' : (subscription?.usage.limit || 0)}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Usage This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscription?.usage.current || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This billing period • Resets monthly
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plan Status</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subscription?.plan.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${
                subscription?.plan.isActive 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-red-100 dark:bg-red-900'
              }`}>
                <Check className={`h-6 w-6 ${
                  subscription?.plan.isActive
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Plan is {subscription?.plan.isActive ? 'working properly' : 'not active'}
              </p>
            </div>
          </div>
        </div>

        {/* Resumes Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Your Resumes</h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                <button 
                  onClick={fetchResumes}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Try Again
                </button>
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No resumes yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first AI-powered resume to get started.</p>
                <Link
                  href="/dashboard/create"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Resume
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <div key={resume.id} className="border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{resume.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{resume.template_id} Template</p>
                      </div>
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white dark:border-gray-700 shadow-sm"
                        style={{ backgroundColor: resume.theme_color }}
                      />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getATSBadgeColor(resume.ats_score)}`}>
                        ATS: {resume.ats_score}%
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(resume.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/dashboard/create?resumeId=${resume.id}`}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                      <button 
                        onClick={() => exportResume(resume.id, resume.title)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </button>
                      <button 
                        onClick={() => deleteResume(resume.id)}
                        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            href="/dashboard/cover-letter"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Cover Letters</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI-tailored cover letters</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/history"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                <History className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Resume History</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your resumes</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/mock-interview"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Mock Interview</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">AI interview practice</p>
              </div>
            </div>
          </Link>

          <Link
            href="/dashboard/linkedin-optimizer"
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                <Linkedin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">LinkedIn Optimizer</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Optimize your profile</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
