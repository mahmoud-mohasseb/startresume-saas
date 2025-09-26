"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StepWrapperProps {
  title: string
  description: string
  icon: LucideIcon
  children: React.ReactNode
  className?: string
}

export function StepWrapper({ 
  title, 
  description, 
  icon: Icon, 
  children, 
  className = '' 
}: StepWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`space-y-6 ${className}`}
    >
      {/* Step Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mx-auto mb-4">
          <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {description}
        </p>
      </div>

      {/* Step Content */}
      <div className="max-w-4xl mx-auto">
        {children}
      </div>
    </motion.div>
  )
}
