"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import Footer from '@/components/footer'
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone,
  FileText,
  CreditCard,
  User,
  Settings,
  HelpCircle,
  ExternalLink
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: '1',
    category: 'Getting Started',
    question: 'How do I create my first resume?',
    answer: 'To create your first resume, sign up for an account and navigate to the "Create Resume" section in your dashboard. Follow our step-by-step wizard that will guide you through adding your personal information, work experience, education, and skills. Our AI will help optimize your content for better results.'
  },
  {
    id: '2',
    category: 'Getting Started',
    question: 'What information do I need to prepare before creating a resume?',
    answer: 'Before starting, gather your personal contact information, work history (including job titles, companies, dates, and achievements), education details, skills, certifications, and any relevant projects. Having this information ready will make the resume creation process much smoother.'
  },
  {
    id: '3',
    category: 'Getting Started',
    question: 'How long does it take to create a resume?',
    answer: 'Most users can create a professional resume in 15-30 minutes using our guided process. The AI-powered suggestions and templates help speed up the process significantly compared to starting from scratch.'
  },

  // Billing & Credits
  {
    id: '4',
    category: 'Billing & Credits',
    question: 'How does the credit system work?',
    answer: 'Each subscription plan comes with monthly credits that reset at the beginning of your billing cycle. Different features consume different amounts of credits: Resume Generation (5 credits), Job Tailoring (3 credits), Cover Letters (3 credits), Personal Brand Strategy (8 credits), Mock Interviews (6 credits), LinkedIn Optimization (4 credits), and Salary Coaching (2 credits).'
  },
  {
    id: '5',
    category: 'Billing & Credits',
    question: 'What happens if I run out of credits?',
    answer: 'If you run out of credits, you can either wait until your next billing cycle for them to reset, or upgrade to a higher plan with more credits. You can always view your past work and download previously created resumes without using credits.'
  },
  {
    id: '6',
    category: 'Billing & Credits',
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your subscription at any time from your billing settings. You\'ll continue to have access to your plan features until the end of your current billing period. After cancellation, you\'ll still be able to access your saved resumes but won\'t be able to create new ones.'
  },

  // Features
  {
    id: '7',
    category: 'Features',
    question: 'What is Job Tailoring and how does it work?',
    answer: 'Job Tailoring uses AI to customize your existing resume for specific job applications. Simply select a saved resume, paste the job description, and our AI will optimize your resume content to better match the job requirements, improving your chances of getting noticed by applicant tracking systems (ATS).'
  },
  {
    id: '8',
    category: 'Features',
    question: 'How accurate is the Salary Coach feature?',
    answer: 'Our Salary Coach uses current market data and industry benchmarks to provide salary estimates and negotiation strategies. While we strive for accuracy, salary ranges can vary based on location, company size, and specific circumstances. Use our suggestions as a starting point for your research.'
  },
  {
    id: '9',
    category: 'Features',
    question: 'Can I download my resume in different formats?',
    answer: 'Yes! You can download your resume as a PDF (recommended for applications) or HTML file. PDF format ensures your resume looks consistent across different devices and platforms, while HTML format allows for further customization if needed.'
  },

  // Technical Support
  {
    id: '10',
    category: 'Technical Support',
    question: 'My resume isn\'t generating properly. What should I do?',
    answer: 'If you\'re experiencing issues with resume generation, try refreshing the page and attempting again. Make sure you have sufficient credits and a stable internet connection. If the problem persists, contact our support team with details about the error you\'re seeing.'
  },
  {
    id: '11',
    category: 'Technical Support',
    question: 'I can\'t see my credits in the dashboard. Why?',
    answer: 'Credit display issues can occur due to browser caching or temporary sync issues with our payment processor. Try refreshing the page or logging out and back in. If you recently made a payment, it may take a few minutes to reflect in your account. Contact support if the issue persists.'
  },
  {
    id: '12',
    category: 'Technical Support',
    question: 'The website is running slowly. How can I improve performance?',
    answer: 'For optimal performance, use a modern browser (Chrome, Firefox, Safari, or Edge), ensure you have a stable internet connection, and try clearing your browser cache. Close unnecessary browser tabs and disable browser extensions that might interfere with the website.'
  }
]

const categories = ['All', 'Getting Started', 'Billing & Credits', 'Features', 'Technical Support']

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)

  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-blue-900 dark:via-gray-900 dark:to-teal-900">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                How can we <span className="gradient-text">help you?</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Find answers to common questions, learn how to use our features, and get the support you need.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help articles, features, or common questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border border-border rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-background text-foreground placeholder-muted-foreground"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Help Cards */}
      <section className="py-16">
        <div className="container-width section-padding">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Book className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Getting Started Guide</h3>
              <p className="text-muted-foreground mb-6">
                New to StartResume? Learn the basics and create your first professional resume in minutes.
              </p>
              <button className="btn-primary">
                View Guide
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Live Chat Support</h3>
              <p className="text-muted-foreground mb-6">
                Get instant help from our support team. We're here to answer your questions in real-time.
              </p>
              <button className="btn-primary">
                Start Chat
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
            >
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Video Tutorials</h3>
              <p className="text-muted-foreground mb-6">
                Watch step-by-step video guides to master all features and create amazing resumes.
              </p>
              <button className="btn-primary">
                Watch Videos
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground">
                Find quick answers to the most common questions about StartResume.
              </p>
            </motion.div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-background border border-border text-foreground hover:bg-muted'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-primary-600 font-medium">
                        {faq.category}
                      </span>
                      <h3 className="font-semibold text-foreground">
                        {faq.question}
                      </h3>
                    </div>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {expandedFAQ === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-border"
                      >
                        <div className="px-6 py-4">
                          <p className="text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse different categories.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-16">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Still need help?
              </h2>
              <p className="text-xl text-muted-foreground">
                Our support team is here to help you succeed. Reach out through any of these channels.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-card border border-border rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Email Support</h3>
                <p className="text-muted-foreground mb-6">
                  Send us a detailed message and we'll get back to you within 24 hours.
                </p>
                <a 
                  href="mailto:support@startresume.io"
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Us</span>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card border border-border rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Live Chat</h3>
                <p className="text-muted-foreground mb-6">
                  Get instant help from our support team during business hours.
                </p>
                <button className="btn-primary inline-flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Start Chat</span>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-card border border-border rounded-2xl p-8 text-center"
              >
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <ExternalLink className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Knowledge Base</h3>
                <p className="text-muted-foreground mb-6">
                  Browse our comprehensive guides and tutorials for detailed help.
                </p>
                <button className="btn-primary inline-flex items-center space-x-2">
                  <Book className="w-4 h-4" />
                  <span>Browse Guides</span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
