"use client"

import Link from 'next/link'
import { ArrowRight, Sparkles, Star, Users, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { safeString } from '@/lib/suggestion-utils'

interface AISuggestion {
  id: string
  type: 'summary' | 'experience' | 'skills' | 'achievement'
  content: string
  category: string
  icon: string
  confidence: number
  preview?: string
}

export function Hero() {
  const { user, isLoaded } = useUser()
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  // Load AI suggestions for logged-in users
  useEffect(() => {
    if (isLoaded && user) {
      loadAISuggestions()
    }
  }, [isLoaded, user])

  const loadAISuggestions = async () => {
    setIsLoadingSuggestions(true)
    try {
      const response = await fetch('/api/openai/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo: {
            name: user?.fullName || 'Professional',
            title: 'Career Professional',
          },
          jobTitle: 'Professional Role',
          experience: [],
          skills: [],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error('Failed to load AI suggestions:', error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 via-background to-teal-50/30 dark:from-primary-950/20 dark:via-background dark:to-teal-950/20" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary-200/20 to-transparent dark:from-primary-800/10 blur-3xl" />
      
      <div className="relative container-width section-padding">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-primary-100/80 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-primary-200/50 dark:border-primary-800/50"
          >
            <Sparkles className="h-4 w-4" />
            <span>Join 50,000+ professionals who landed their dream jobs</span>
            <ArrowRight className="h-4 w-4" />
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            Land Your Dream Job with{' '}
            <span className="gradient-text">AI-Powered Resumes</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl lg:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Create professional, ATS-optimized resumes in minutes. Our AI tailors your resume for each job application, increasing your chances of landing interviews by 3x.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <Link href="/dashboard" className="btn-primary text-lg px-8 py-4">
              <Sparkles className="h-5 w-5 mr-2" />
              Start Building for Free
            </Link>
            <Link href="/dashboard" className="btn-secondary text-lg px-8 py-4">
              Get Started
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-teal-400 border-2 border-background flex items-center justify-center text-white text-xs font-semibold"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span className="ml-2">
                <Users className="h-4 w-4 inline mr-1" />
                50,000+ users
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="ml-1">4.9/5 rating</span>
            </div>

            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary-500" />
              <span>3x faster hiring</span>
            </div>
          </motion.div>

          {/* AI Suggestions */}
          {user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground"
            >
              <h2 className="text-lg font-bold">AI Suggestions for You</h2>
              {isLoadingSuggestions ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-muted animate-pulse" />
                  <span>Loading...</span>
                </div>
              ) : (
                <ul>
                  {aiSuggestions.map((suggestion, index) => (
                    <li key={suggestion.id || index} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary-500" />
                      <span>{safeString(suggestion.content, 'AI suggestion')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </div>

        {/* Hero Image/Demo */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 relative"
        >
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-teal-500/20 blur-3xl transform rotate-6" />
            <div className="relative bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-muted/50 px-6 py-4 border-b border-border flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">RESUME Dashboard</span>
              </div>
              <div className="p-8 bg-gradient-to-br from-background to-muted/30">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-32 bg-gradient-to-br from-primary-100 to-teal-100 dark:from-primary-900/30 dark:to-teal-900/30 rounded-xl border border-primary-200/50 dark:border-primary-800/50 flex items-center justify-center">
                      <Sparkles className="h-8 w-8 text-primary-500" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-5/6" />
                    <div className="h-3 bg-muted rounded w-4/6" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-3/4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
