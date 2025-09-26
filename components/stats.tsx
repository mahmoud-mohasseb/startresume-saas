"use client"

import { motion } from 'framer-motion'
import { Users, FileText, TrendingUp, Award } from 'lucide-react'

export function Stats() {
  const stats = [
    {
      icon: Users,
      value: '50,000+',
      label: 'Resumes Created',
      description: 'Professional resumes built by our users'
    },
    {
      icon: TrendingUp,
      value: '3x',
      label: 'Faster Hiring',
      description: 'Average improvement in interview callbacks'
    },
    {
      icon: FileText,
      value: '95%',
      label: 'ATS Pass Rate',
      description: 'Resumes that pass applicant tracking systems'
    },
    {
      icon: Award,
      value: '4.9/5',
      label: 'User Rating',
      description: 'Based on 10,000+ user reviews'
    }
  ]

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-width">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Trusted by Professionals Worldwide
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of job seekers who have successfully landed their dream positions using our AI-powered platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-teal-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity" />
                  <div className="relative bg-card border border-border rounded-2xl p-6 card-hover">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-teal-500 rounded-xl mb-4">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">
                      {stat.value}
                    </div>
                    <div className="text-lg font-semibold text-foreground mb-2">
                      {stat.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.description}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
