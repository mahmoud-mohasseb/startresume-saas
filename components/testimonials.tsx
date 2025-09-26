"use client"

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'
import { useState, useEffect } from 'react'

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Software Engineer',
      company: 'Google',
      avatar: 'SC',
      content: 'RESUME helped me land my dream job at Google! The AI tailoring feature made my resume stand out from hundreds of other applications. I got 3 interview calls in just one week.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'Product Manager',
      company: 'Microsoft',
      avatar: 'MJ',
      content: 'The ATS optimization is incredible. My resume went from getting zero responses to landing interviews at top tech companies. The mock interview feature prepared me perfectly.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Marketing Director',
      company: 'Airbnb',
      avatar: 'ER',
      content: 'I was skeptical about AI resume builders, but RESUME exceeded all expectations. The quality is professional-grade and the customization options are endless.',
      rating: 5
    },
    {
      name: 'David Kim',
      role: 'Data Scientist',
      company: 'Netflix',
      avatar: 'DK',
      content: 'The job tailoring feature is a game-changer. I can customize my resume for each application in minutes instead of hours. My interview rate increased by 300%.',
      rating: 5
    }
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [testimonials.length])

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
            Loved by <span className="gradient-text">Professionals Worldwide</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See what our users say about their success stories and career transformations.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Testimonial */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="bg-card border border-border rounded-2xl p-8 lg:p-12 shadow-xl">
              <div className="absolute top-6 left-6 text-primary-200 dark:text-primary-800">
                <Quote className="h-12 w-12" />
              </div>
              
              <div className="relative z-10">
                <div className="flex mb-6">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <blockquote className="text-xl lg:text-2xl text-foreground mb-8 leading-relaxed">
                  "{testimonials[currentIndex].content}"
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                    {testimonials[currentIndex].avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-lg text-foreground">
                      {testimonials[currentIndex].name}
                    </div>
                    <div className="text-muted-foreground">
                      {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'bg-gradient-to-r from-primary-500 to-teal-500 w-8'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
          </div>

          {/* All Testimonials Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`bg-card border border-border rounded-xl p-6 cursor-pointer transition-all duration-300 ${
                  index === currentIndex
                    ? 'ring-2 ring-primary-500 shadow-lg'
                    : 'hover:shadow-md hover:-translate-y-1'
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.company}</div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {testimonial.content}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
