'use client'

import { motion } from 'framer-motion'
import { Loader2, Sparkles } from 'lucide-react'

interface DashboardLoaderProps {
  message?: string
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'teal'
  size?: 'sm' | 'md' | 'lg'
  showSparkles?: boolean
}

const gradientClasses = {
  blue: 'bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900',
  purple: 'bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:bg-gradient-to-br dark:from-purple-900 dark:via-gray-800 dark:to-pink-900',
  green: 'bg-gradient-to-br from-green-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-green-900 dark:via-gray-800 dark:to-blue-900',
  orange: 'bg-gradient-to-br from-orange-50 via-white to-red-50 dark:bg-gradient-to-br dark:from-orange-900 dark:via-gray-800 dark:to-red-900',
  teal: 'bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:bg-gradient-to-br dark:from-teal-900 dark:via-gray-800 dark:to-cyan-900'
}

const sizeClasses = {
  sm: { spinner: 'w-6 h-6', text: 'text-sm' },
  md: { spinner: 'w-8 h-8', text: 'text-base' },
  lg: { spinner: 'w-12 h-12', text: 'text-lg' }
}

export default function DashboardLoader({
  message = 'Loading...',
  gradient = 'blue',
  size = 'md',
  showSparkles = true
}: DashboardLoaderProps) {
  const { spinner, text } = sizeClasses[size]

  return (
    <div className={`min-h-screen ${gradientClasses[gradient]} flex items-center justify-center`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="relative mb-4">
          <Loader2 className={`${spinner} animate-spin text-blue-600 dark:text-blue-400 mx-auto`} />
          {showSparkles && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sparkles className="w-4 h-4 text-blue-400 dark:text-blue-300" />
            </motion.div>
          )}
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`${text} text-gray-600 dark:text-gray-400 font-medium`}
        >
          {message}
        </motion.p>
        
        {/* Animated dots */}
        <div className="flex justify-center space-x-1 mt-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
