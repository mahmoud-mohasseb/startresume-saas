"use client"

import { motion } from 'framer-motion'
import { 
  Sparkles, 
  Target, 
  Shield, 
  Edit3, 
  MessageSquare, 
  Download,
  ArrowRight
} from 'lucide-react'

export function Features() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Resume Generation',
      description: 'Create professional resumes in seconds with our advanced AI that understands your industry and role.',
      benefits: ['Industry-specific content', 'Role-optimized formatting', 'Instant generation']
    },
    {
      icon: Target,
      title: 'Smart Job Tailoring',
      description: 'Automatically customize your resume for each job application with AI-powered keyword optimization.',
      benefits: ['Job description analysis', 'Keyword optimization', 'Match scoring']
    },
    {
      icon: Shield,
      title: 'ATS Optimization',
      description: 'Ensure your resume passes applicant tracking systems with our 95% success rate optimization.',
      benefits: ['ATS-friendly formatting', 'Keyword density analysis', 'Compatibility testing']
    },
    {
      icon: Edit3,
      title: 'Live Editor',
      description: 'Edit your resume in real-time with our intuitive WYSIWYG editor and instant preview.',
      benefits: ['Real-time preview', 'Drag & drop sections', 'Custom styling']
    },
    {
      icon: MessageSquare,
      title: 'AI Mock Interviews',
      description: 'Practice with AI-powered mock interviews tailored to your target role and industry.',
      benefits: ['Role-specific questions', 'Performance feedback', 'Improvement suggestions']
    },
    {
      icon: Download,
      title: 'Export Anywhere',
      description: 'Download your resume in multiple formats including PDF, DOCX, and shareable links.',
      benefits: ['Multiple formats', 'High-quality output', 'Instant downloads']
    }
  ]

  return (
    <section id="features" className="section-padding">
      <div className="container-width">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Everything You Need to <span className="gradient-text">Land Your Dream Job</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our comprehensive suite of AI-powered tools helps you create, optimize, and perfect your job application materials.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-teal-500/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative bg-card border border-border rounded-2xl p-8 card-hover h-full">
                  <div className="flex items-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-primary-500 to-teal-500 rounded-xl mr-4">
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-gradient-to-r from-primary-500 to-teal-500 rounded-full mr-3" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-center text-primary-600 dark:text-primary-400 font-medium text-sm group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                    Learn more
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-950/50 dark:to-teal-950/50 rounded-2xl p-8 border border-primary-200/50 dark:border-primary-800/50">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Career?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who have successfully landed their dream jobs using our AI-powered platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                <Sparkles className="h-4 w-4 mr-2" />
                Start Building for Free
              </button>
              <button className="btn-secondary">
                View Live Demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
