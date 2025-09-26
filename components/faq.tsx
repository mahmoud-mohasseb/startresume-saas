"use client"

import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useState } from 'react'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "How does the AI resume builder work?",
      answer: "Our AI analyzes your input information, job descriptions, and industry best practices to generate professional, ATS-optimized resumes. It uses advanced natural language processing to create compelling content that highlights your strengths and matches job requirements."
    },
    {
      question: "Can I customize the AI-generated resume?",
      answer: "Absolutely! Our live editor allows you to modify every aspect of your resume. You can edit text, change formatting, adjust colors, add or remove sections, and upload your profile picture. The AI provides a strong foundation that you can personalize to your liking."
    },
    {
      question: "What makes your resumes ATS-friendly?",
      answer: "Our resumes are designed with ATS systems in mind. We use proper formatting, standard section headers, avoid complex graphics that confuse scanners, optimize keyword density, and ensure compatibility with major ATS platforms used by employers."
    },
    {
      question: "How many resume templates do you offer?",
      answer: "We offer 20+ professional templates ranging from modern and creative designs to traditional and executive formats. Each template is fully customizable and optimized for different industries and career levels."
    },
    {
      question: "Can I export my resume in different formats?",
      answer: "Yes! You can export your resume as PDF (recommended for applications), DOCX (for further editing), or generate shareable links. All exports maintain professional formatting and are optimized for both digital and print use."
    },
    {
      question: "What is the job tailoring feature?",
      answer: "Our job tailoring feature analyzes job descriptions and automatically adjusts your resume content, keywords, and emphasis to match specific positions. This significantly increases your chances of passing ATS screening and catching recruiters' attention."
    },
    {
      question: "How do mock interviews work?",
      answer: "Our AI conducts realistic mock interviews based on your target role and industry. It asks relevant questions, provides real-time feedback on your responses, and offers improvement suggestions to help you prepare for actual interviews."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we take data security seriously. All information is encrypted in transit and at rest. We never share your personal data with third parties, and you can delete your account and data at any time. We're GDPR and CCPA compliant."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. There are no cancellation fees, and you'll retain access to your paid features until the end of your billing period."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee. If you're not satisfied with our service within the first 30 days, contact our support team for a full refund, no questions asked."
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="section-padding bg-muted/30">
      <div className="container-width">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about our AI-powered resume builder and career tools.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              viewport={{ once: true }}
              className="mb-4"
            >
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-foreground pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <Minus className="h-5 w-5 text-primary-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
                
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5 text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-card border border-border rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our support team is here to help you succeed. Get in touch and we'll respond within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Contact Support
              </button>
              <button className="btn-secondary">
                Schedule a Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })
        }}
      />
    </section>
  )
}
