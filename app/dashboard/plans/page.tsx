"use client"

import { PlanSelector } from '@/components/PlanSelector'

export default function PlansPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Subscription Plans
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Choose the perfect plan for your career needs. All plans include access to our AI-powered tools.
          </p>
        </div>

        {/* Plan Selector */}
        <PlanSelector />

        {/* Feature Comparison */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
            What's Included
          </h2>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">AI Features</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Resume Generation</li>
                  <li>• Cover Letter Writing</li>
                  <li>• Job Tailoring</li>
                  <li>• Mock Interviews</li>
                  <li>• LinkedIn Optimization</li>
                </ul>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Templates</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Professional Templates</li>
                  <li>• ATS-Optimized Formats</li>
                  <li>• Custom Styling</li>
                  <li>• Multiple Layouts</li>
                  <li>• Industry-Specific</li>
                </ul>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Export Options</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• PDF Download</li>
                  <li>• Word Format</li>
                  <li>• Print-Ready</li>
                  <li>• High Resolution</li>
                  <li>• Multiple Formats</li>
                </ul>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>• Email Support</li>
                  <li>• Knowledge Base</li>
                  <li>• Video Tutorials</li>
                  <li>• Community Forum</li>
                  <li>• Priority Support*</li>
                </ul>
              </div>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            * Priority support available for Standard and Pro plans
          </p>
        </div>
      </div>
    </div>
  )
}
