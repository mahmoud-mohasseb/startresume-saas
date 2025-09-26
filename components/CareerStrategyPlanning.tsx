"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Star,
  Briefcase,
  GraduationCap,
  Users,
  Award,
  ArrowRight,
  Plus,
  X,
  Edit3,
  Save
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface CareerGoal {
  id: string
  title: string
  description: string
  category: 'promotion' | 'skill' | 'network' | 'education' | 'leadership' | 'industry'
  priority: 'high' | 'medium' | 'low'
  timeline: '3-months' | '6-months' | '1-year' | '2-years' | '5-years'
  status: 'not-started' | 'in-progress' | 'completed'
  milestones: Milestone[]
  createdAt: string
}

interface Milestone {
  id: string
  title: string
  description: string
  dueDate: string
  completed: boolean
  completedAt?: string
}

interface CareerPlan {
  id: string
  title: string
  currentRole: string
  targetRole: string
  industry: string
  goals: CareerGoal[]
  createdAt: string
  updatedAt: string
}

const GOAL_CATEGORIES = [
  { id: 'promotion', label: 'Career Advancement', icon: TrendingUp, color: 'blue' },
  { id: 'skill', label: 'Skill Development', icon: Star, color: 'purple' },
  { id: 'network', label: 'Professional Network', icon: Users, color: 'green' },
  { id: 'education', label: 'Education & Certification', icon: GraduationCap, color: 'indigo' },
  { id: 'leadership', label: 'Leadership Growth', icon: Award, color: 'orange' },
  { id: 'industry', label: 'Industry Transition', icon: Briefcase, color: 'red' }
]

const TIMELINE_OPTIONS = [
  { id: '3-months', label: '3 Months', color: 'red' },
  { id: '6-months', label: '6 Months', color: 'orange' },
  { id: '1-year', label: '1 Year', color: 'yellow' },
  { id: '2-years', label: '2 Years', color: 'green' },
  { id: '5-years', label: '5 Years', color: 'blue' }
]

export default function CareerStrategyPlanning() {
  const [careerPlan, setCareerPlan] = useState<CareerPlan | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'roadmap' | 'progress'>('overview')
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<CareerGoal | null>(null)
  const [newGoal, setNewGoal] = useState<Partial<CareerGoal>>({
    title: '',
    description: '',
    category: 'promotion',
    priority: 'medium',
    timeline: '1-year',
    milestones: []
  })

  // Initialize or load career plan
  useEffect(() => {
    loadCareerPlan()
  }, [])

  const loadCareerPlan = () => {
    const saved = localStorage.getItem('careerPlan')
    if (saved) {
      setCareerPlan(JSON.parse(saved))
    } else {
      // Create initial plan
      const initialPlan: CareerPlan = {
        id: Date.now().toString(),
        title: 'My Career Strategy',
        currentRole: '',
        targetRole: '',
        industry: '',
        goals: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setCareerPlan(initialPlan)
    }
  }

  const saveCareerPlan = (plan: CareerPlan) => {
    const updatedPlan = { ...plan, updatedAt: new Date().toISOString() }
    setCareerPlan(updatedPlan)
    localStorage.setItem('careerPlan', JSON.stringify(updatedPlan))
    toast.success('Career plan saved successfully!')
  }

  const addGoal = () => {
    if (!careerPlan || !newGoal.title || !newGoal.description) {
      toast.error('Please fill in all required fields')
      return
    }

    const goal: CareerGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category as any,
      priority: newGoal.priority as any,
      timeline: newGoal.timeline as any,
      status: 'not-started',
      milestones: [],
      createdAt: new Date().toISOString()
    }

    const updatedPlan = {
      ...careerPlan,
      goals: [...careerPlan.goals, goal]
    }

    saveCareerPlan(updatedPlan)
    setNewGoal({ title: '', description: '', category: 'promotion', priority: 'medium', timeline: '1-year', milestones: [] })
    setShowGoalForm(false)
  }

  const updateGoalStatus = (goalId: string, status: CareerGoal['status']) => {
    if (!careerPlan) return

    const updatedPlan = {
      ...careerPlan,
      goals: careerPlan.goals.map(goal =>
        goal.id === goalId ? { ...goal, status } : goal
      )
    }

    saveCareerPlan(updatedPlan)
  }

  const getCategoryInfo = (category: string) => {
    return GOAL_CATEGORIES.find(cat => cat.id === category) || GOAL_CATEGORIES[0]
  }

  const getTimelineColor = (timeline: string) => {
    return TIMELINE_OPTIONS.find(t => t.id === timeline)?.color || 'gray'
  }

  const getProgressStats = () => {
    if (!careerPlan) return { total: 0, completed: 0, inProgress: 0, notStarted: 0 }

    const total = careerPlan.goals.length
    const completed = careerPlan.goals.filter(g => g.status === 'completed').length
    const inProgress = careerPlan.goals.filter(g => g.status === 'in-progress').length
    const notStarted = careerPlan.goals.filter(g => g.status === 'not-started').length

    return { total, completed, inProgress, notStarted }
  }

  if (!careerPlan) return <div>Loading...</div>

  const stats = getProgressStats()

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Career Strategy Planning</h1>
        <p className="text-blue-100 mb-6">Plan, track, and achieve your career goals with strategic roadmapping</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-blue-100">Total Goals</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-green-300">{stats.completed}</div>
            <div className="text-sm text-blue-100">Completed</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-yellow-300">{stats.inProgress}</div>
            <div className="text-sm text-blue-100">In Progress</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold text-gray-300">{stats.notStarted}</div>
            <div className="text-sm text-blue-100">Not Started</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: Target },
          { id: 'goals', label: 'Goals', icon: Star },
          { id: 'roadmap', label: 'Roadmap', icon: Calendar },
          { id: 'progress', label: 'Progress', icon: TrendingUp }
        ].map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Career Plan Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Career Plan Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Role</label>
                    <input
                      type="text"
                      value={careerPlan.currentRole}
                      onChange={(e) => saveCareerPlan({ ...careerPlan, currentRole: e.target.value })}
                      placeholder="e.g., Senior Software Engineer"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Target Role</label>
                    <input
                      type="text"
                      value={careerPlan.targetRole}
                      onChange={(e) => saveCareerPlan({ ...careerPlan, targetRole: e.target.value })}
                      placeholder="e.g., Engineering Manager"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                    <input
                      type="text"
                      value={careerPlan.industry}
                      onChange={(e) => saveCareerPlan({ ...careerPlan, industry: e.target.value })}
                      placeholder="e.g., Technology, Finance, Healthcare"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Quick Stats</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Goals:</span>
                        <span className="font-medium">{stats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Completion Rate:</span>
                        <span className="font-medium">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Active Goals:</span>
                        <span className="font-medium">{stats.inProgress}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
                    <div className="space-y-2">
                      {careerPlan.goals.slice(0, 3).map(goal => (
                        <div key={goal.id} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            goal.status === 'completed' ? 'bg-green-500' :
                            goal.status === 'in-progress' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`} />
                          <span className="text-sm text-gray-600 truncate">{goal.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Goal Categories Overview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Goals by Category</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {GOAL_CATEGORIES.map(category => {
                  const categoryGoals = careerPlan.goals.filter(g => g.category === category.id)
                  const Icon = category.icon
                  
                  return (
                    <div key={category.id} className="text-center">
                      <div className={`mx-auto w-12 h-12 rounded-lg bg-${category.color}-100 flex items-center justify-center mb-2`}>
                        <Icon className={`w-6 h-6 text-${category.color}-600`} />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{categoryGoals.length}</div>
                      <div className="text-xs text-gray-500">{category.label}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'roadmap' && (
          <motion.div
            key="roadmap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Career Roadmap</h2>
              
              {/* Timeline View */}
              <div className="space-y-8">
                {TIMELINE_OPTIONS.map(timeline => {
                  const timelineGoals = careerPlan.goals.filter(g => g.timeline === timeline.id)
                  
                  if (timelineGoals.length === 0) return null
                  
                  return (
                    <div key={timeline.id} className="relative">
                      <div className="flex items-center mb-4">
                        <div className={`w-4 h-4 rounded-full bg-${timeline.color}-500 mr-3`} />
                        <h3 className="text-lg font-semibold text-gray-900">{timeline.label}</h3>
                        <span className="ml-2 text-sm text-gray-500">({timelineGoals.length} goals)</span>
                      </div>
                      
                      <div className="ml-8 space-y-3">
                        {timelineGoals.map(goal => {
                          const categoryInfo = getCategoryInfo(goal.category)
                          const CategoryIcon = categoryInfo.icon
                          
                          return (
                            <div key={goal.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                              <div className={`p-1.5 rounded-md bg-${categoryInfo.color}-100`}>
                                <CategoryIcon className={`w-4 h-4 text-${categoryInfo.color}-600`} />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{goal.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    goal.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {goal.status.replace('-', ' ')}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {goal.priority} priority
                                  </span>
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Progress Tracking</h2>
              
              {/* Progress Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                      <div className="text-sm text-green-700">Completed</div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
                      <div className="text-sm text-yellow-700">In Progress</div>
                    </div>
                    <Clock className="w-8 h-8 text-yellow-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-600">{stats.notStarted}</div>
                      <div className="text-sm text-gray-700">Not Started</div>
                    </div>
                    <Target className="w-8 h-8 text-gray-500" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                      </div>
                      <div className="text-sm text-blue-700">Completion Rate</div>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
              </div>
              
              {/* Progress by Priority */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress by Priority</h3>
                <div className="space-y-4">
                  {['high', 'medium', 'low'].map(priority => {
                    const priorityGoals = careerPlan.goals.filter(g => g.priority === priority)
                    const completedPriority = priorityGoals.filter(g => g.status === 'completed').length
                    const progressPercent = priorityGoals.length > 0 ? (completedPriority / priorityGoals.length) * 100 : 0
                    
                    return (
                      <div key={priority} className="flex items-center space-x-4">
                        <div className="w-20 text-sm font-medium text-gray-700 capitalize">{priority}</div>
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              priority === 'high' ? 'bg-red-500' :
                              priority === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <div className="w-16 text-sm text-gray-600">
                          {completedPriority}/{priorityGoals.length}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              {/* Recent Achievements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  {careerPlan.goals
                    .filter(g => g.status === 'completed')
                    .slice(0, 5)
                    .map(goal => {
                      const categoryInfo = getCategoryInfo(goal.category)
                      const CategoryIcon = categoryInfo.icon
                      
                      return (
                        <div key={goal.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CategoryIcon className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{goal.title}</h4>
                            <p className="text-sm text-gray-600">{categoryInfo.label}</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                      )
                    })}
                  
                  {careerPlan.goals.filter(g => g.status === 'completed').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No completed goals yet. Keep working towards your objectives!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Add Goal Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Career Goals</h2>
              <button
                onClick={() => setShowGoalForm(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Goal</span>
              </button>
            </div>

            {/* Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careerPlan.goals.map(goal => {
                const categoryInfo = getCategoryInfo(goal.category)
                const CategoryIcon = categoryInfo.icon
                
                return (
                  <motion.div
                    key={goal.id}
                    layout
                    className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg bg-${categoryInfo.color}-100`}>
                        <CategoryIcon className={`w-5 h-5 text-${categoryInfo.color}-600`} />
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full bg-${getTimelineColor(goal.timeline)}-100 text-${getTimelineColor(goal.timeline)}-800`}>
                          {goal.timeline}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          goal.priority === 'high' ? 'bg-red-100 text-red-800' :
                          goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {goal.priority}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{goal.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        goal.status === 'completed' ? 'text-green-600' :
                        goal.status === 'in-progress' ? 'text-yellow-600' :
                        'text-gray-600'
                      }`}>
                        {goal.status.replace('-', ' ').toUpperCase()}
                      </span>
                      
                      <select
                        value={goal.status}
                        onChange={(e) => updateGoalStatus(goal.id, e.target.value as any)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Add Goal Modal */}
            {showGoalForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add New Goal</h3>
                    <button
                      onClick={() => setShowGoalForm(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Goal title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <textarea
                      placeholder="Goal description"
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <select
                        value={newGoal.category}
                        onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {GOAL_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                      
                      <select
                        value={newGoal.timeline}
                        onChange={(e) => setNewGoal({ ...newGoal, timeline: e.target.value as any })}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {TIMELINE_OPTIONS.map(option => (
                          <option key={option.id} value={option.id}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <select
                      value={newGoal.priority}
                      onChange={(e) => setNewGoal({ ...newGoal, priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      onClick={() => setShowGoalForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={addGoal}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add Goal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
