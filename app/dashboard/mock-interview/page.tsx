"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { toast } from 'react-hot-toast'
import PlanBasedFeatureGuard from '@/components/PlanBasedFeatureGuard'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw, 
  Send,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MessageSquare,
  Lightbulb,
  Target,
  TrendingUp
} from 'lucide-react'
import { useAIFeatureForm } from '@/components/AIFeatureWrapper'

interface Question {
  id: string
  question: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface Answer {
  questionId: string
  answer: string
  feedback: string
  score: number
  strengths?: string[]
  improvements?: string[]
}

interface InterviewSession {
  id: string
  jobTitle: string
  questions: Question[]
  answers: Answer[]
  overallScore: number
  createdAt: string
}

function MockInterviewPageContent() {
  const { user } = useUser()
  const { useAIFeature, canUseFeature } = useSubscription()
  const [currentStep, setCurrentStep] = useState<'setup' | 'interview' | 'results'>('setup')
  const [jobTitle, setJobTitle] = useState('')
  const [experienceLevel, setExperienceLevel] = useState<'entry' | 'mid' | 'senior'>('mid')
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [sessionResults, setSessionResults] = useState<InterviewSession | null>(null)
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Format timer
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Generate interview questions
  const generateQuestions = async () => {
    if (!user) {
      toast.error('Please sign in to generate interview questions')
      return
    }

    if (!jobTitle.trim()) {
      toast.error('Please enter a job title')
      return
    }

    if (!canUseFeature('mock_interview')) {
      toast.error('Mock interview feature is not available in your current plan')
      return
    }

    setIsGeneratingQuestions(true)

    const success = await useAIFeature(
      'mock_interview',
      () => fetch('/api/openai/mock-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate-questions',
          jobTitle,
          experienceLevel,
          resumeData: null // Could be enhanced to include user's resume data
        }),
      }),
      (data) => {
        setQuestions(data.questions || [])
        setCurrentStep('interview')
        setTimer(0)
        setIsTimerRunning(true)
        toast.success(`Generated ${data.questions?.length || 0} interview questions! Credit deducted.`)
      },
      (error) => {
        toast.error(error || 'Failed to generate questions')
      }
    )

    setIsGeneratingQuestions(false)
  }

  // Submit answer and get feedback
  const submitAnswer = async () => {
    if (!user) {
      toast.error('Please sign in to get feedback')
      return
    }

    if (!currentAnswer.trim()) {
      toast.error('Please provide an answer')
      return
    }

    setIsGeneratingFeedback(true)

    const currentQuestion = questions[currentQuestionIndex]
    
    const success = await useAIFeature(
      'mock_interview',
      () => fetch('/api/openai/mock-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'provide-feedback',
          question: currentQuestion.question,
          answer: currentAnswer,
          jobTitle,
          experienceLevel,
          resumeData: null
        }),
      }),
      (data) => {
        const newAnswer: Answer = {
          questionId: currentQuestion.id,
          answer: currentAnswer,
          feedback: data.feedback,
          score: data.score,
          strengths: data.strengths,
          improvements: data.improvements,
        }

        setAnswers(prev => [...prev, newAnswer])
        setCurrentAnswer('')

        // Move to next question or finish
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1)
          toast.success('Answer submitted! Moving to next question. Credit deducted.')
        } else {
          // Finish interview
          finishInterview([...answers, newAnswer])
          toast.success('Interview completed! Credit deducted.')
        }
      },
      (error) => {
        toast.error(error || 'Failed to generate feedback')
      }
    )

    setIsGeneratingFeedback(false)
  }

  // Finish interview and calculate results
  const finishInterview = (allAnswers: Answer[]) => {
    setIsTimerRunning(false)
    
    const overallScore = Math.round(
      allAnswers.reduce((sum, answer) => sum + answer.score, 0) / allAnswers.length
    )

    const session: InterviewSession = {
      id: Date.now().toString(),
      jobTitle,
      questions,
      answers: allAnswers,
      overallScore,
      createdAt: new Date().toISOString(),
    }

    setSessionResults(session)
    setCurrentStep('results')
    toast.success('Interview completed! Check your results.')
  }

  // Reset interview
  const resetInterview = () => {
    setCurrentStep('setup')
    setJobTitle('')
    setExperienceLevel('mid')
    setQuestions([])
    setCurrentQuestionIndex(0)
    setCurrentAnswer('')
    setAnswers([])
    setSessionResults(null)
    setTimer(0)
    setIsTimerRunning(false)
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  // Get difficulty color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900" data-ai-feature="mock-interview">
      <div className="w-full px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2 dark:text-white">
            Mock Interview Simulator
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Practice with AI-powered interview questions and get instant feedback
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Setup Step */}
          {currentStep === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 dark:bg-gray-800 dark:border-gray-600"
            >
              <div className="flex items-center mb-6">
                <Brain className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Interview Setup
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Job Title / Position
                  </label>
                  <input
                    type="text"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g., Frontend Developer, Product Manager, Data Scientist"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                    Experience Level
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {(['entry', 'mid', 'senior'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => setExperienceLevel(level)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          experienceLevel === level
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900 dark:text-blue-300'
                            : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                        }`}
                      >
                        <div className="font-medium capitalize">{level}</div>
                        <div className="text-sm text-gray-500 mt-1 dark:text-gray-300">
                          {level === 'entry' && '0-2 years'}
                          {level === 'mid' && '3-7 years'}
                          {level === 'senior' && '8+ years'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateQuestions}
                  disabled={isGeneratingQuestions || !jobTitle.trim()}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 dark:from-blue-400 dark:to-teal-400 dark:hover:from-blue-500 dark:hover:to-teal-500"
                >
                  {isGeneratingQuestions ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Generating Questions...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Start Mock Interview</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Interview Step */}
          {currentStep === 'interview' && questions.length > 0 && (
            <motion.div
              key="interview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Progress Bar */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 dark:bg-gray-800 dark:border-gray-600">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Clock className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                    <span className="font-mono text-lg">{formatTime(timer)}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-teal-600 h-2 rounded-full transition-all duration-300 dark:from-blue-400 dark:to-teal-400"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Current Question */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 dark:bg-gray-800 dark:border-gray-600">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
                        {questions[currentQuestionIndex]?.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(questions[currentQuestionIndex]?.difficulty)}`}>
                        {questions[currentQuestionIndex]?.difficulty}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 dark:text-white">
                      {questions[currentQuestionIndex]?.question}
                    </h3>
                  </div>
                </div>

                {/* Answer Input */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Your Answer
                  </label>
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer here... Take your time to think through your response."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 resize-none"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {currentAnswer.length} characters
                    </div>
                    
                    <button
                      onClick={submitAnswer}
                      disabled={isGeneratingFeedback || !currentAnswer.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 dark:from-blue-400 dark:to-teal-400 dark:hover:from-blue-500 dark:hover:to-teal-500"
                    >
                      {isGeneratingFeedback ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>
                            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Interview'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Step */}
          {currentStep === 'results' && sessionResults && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Overall Results */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-8 dark:bg-gray-800 dark:border-gray-600">
                <div className="text-center mb-8">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">
                    Interview Complete!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Here's your performance summary for {sessionResults.jobTitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full text-2xl font-bold ${getScoreColor(sessionResults.overallScore)}`}>
                      <Star className="w-6 h-6 mr-2" />
                      {sessionResults.overallScore}%
                    </div>
                    <div className="text-sm text-gray-600 mt-2 dark:text-gray-300">
                      Overall Score
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatTime(timer)}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 dark:text-gray-300">
                      Total Time
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {sessionResults.questions.length}
                    </div>
                    <div className="text-sm text-gray-600 mt-2 dark:text-gray-300">
                      Questions Answered
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-4">
                {sessionResults.answers.map((answer, index) => {
                  const question = sessionResults.questions[index]
                  return (
                    <div key={answer.questionId} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 dark:bg-gray-800 dark:border-gray-600">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-300">
                              Question {index + 1}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                              {question.difficulty}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2 dark:text-white">
                            {question.question}
                          </h4>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(answer.score)}`}>
                          {answer.score}%
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2 dark:text-gray-300">
                            Your Answer:
                          </h5>
                          <p className="text-gray-600 bg-gray-50 rounded-lg p-3 dark:bg-gray-700 dark:text-white">
                            {answer.answer}
                          </p>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-700 mb-2 flex items-center dark:text-gray-300">
                            <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                            AI Feedback:
                          </h5>
                          <p className="text-gray-600 mb-4 dark:text-gray-300">
                            {answer.feedback}
                          </p>
                        </div>

                        {(answer.strengths?.length || 0) > 0 && (
                          <div>
                            <h5 className="font-medium text-green-700 mb-2 flex items-center dark:text-green-400">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Strengths:
                            </h5>
                            <ul className="list-disc list-inside text-green-600 space-y-1 dark:text-green-400">
                              {answer.strengths?.map((strength, i) => (
                                <li key={i}>{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {(answer.improvements?.length || 0) > 0 && (
                          <div>
                            <h5 className="font-medium text-orange-700 mb-2 flex items-center dark:text-orange-400">
                              <TrendingUp className="w-4 h-4 mr-2" />
                              Areas for Improvement:
                            </h5>
                            <ul className="list-disc list-inside text-orange-600 space-y-1 dark:text-orange-400">
                              {answer.improvements?.map((improvement, i) => (
                                <li key={i}>{improvement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4">
                <button
                  onClick={resetInterview}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-teal-700 transition-all duration-200 flex items-center space-x-2 dark:from-blue-400 dark:to-teal-400 dark:hover:from-blue-500 dark:hover:to-teal-500"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Start New Interview</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function MockInterviewPage() {
  return (
    <PlanBasedFeatureGuard feature="mock_interview">
      <MockInterviewPageContent />
    </PlanBasedFeatureGuard>
  )
}
