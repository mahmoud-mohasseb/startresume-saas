'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface DashboardPageLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  gradient?: 'blue' | 'purple' | 'green' | 'orange' | 'teal'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl' | 'full'
  centered?: boolean
  showHeader?: boolean
  headerActions?: ReactNode
  className?: string
}

const gradientClasses = {
  blue: 'bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900',
  purple: 'bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:bg-gradient-to-br dark:from-purple-900 dark:via-gray-800 dark:to-pink-900',
  green: 'bg-gradient-to-br from-green-50 via-white to-blue-50 dark:bg-gradient-to-br dark:from-green-900 dark:via-gray-800 dark:to-blue-900',
  orange: 'bg-gradient-to-br from-orange-50 via-white to-red-50 dark:bg-gradient-to-br dark:from-orange-900 dark:via-gray-800 dark:to-red-900',
  teal: 'bg-gradient-to-br from-teal-50 via-white to-cyan-50 dark:bg-gradient-to-br dark:from-teal-900 dark:via-gray-800 dark:to-cyan-900'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full'
}

export default function DashboardPageLayout({
  children,
  title,
  subtitle,
  gradient = 'blue',
  maxWidth = '6xl',
  centered = false,
  showHeader = true,
  headerActions,
  className = ''
}: DashboardPageLayoutProps) {
  const containerClass = maxWidth === 'full' 
    ? 'w-full px-4 sm:px-6 lg:px-8' 
    : `container mx-auto px-4 ${maxWidthClasses[maxWidth]}`

  return (
    <div className={`min-h-screen ${gradientClasses[gradient]} ${className}`}>
      <div className={`${containerClass} py-8 ${centered ? 'flex items-center justify-center min-h-screen' : ''}`}>
        {showHeader && (title || subtitle || headerActions) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`mb-8 ${centered ? 'text-center' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
                    {subtitle}
                  </p>
                )}
              </div>
              {headerActions && (
                <div className="flex items-center space-x-4">
                  {headerActions}
                </div>
              )}
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
