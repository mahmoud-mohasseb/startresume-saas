'use client'

import { Navigation } from '@/components/navigation'
import Footer from '@/components/footer'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
              Contact <span className="gradient-text">Us</span>
            </h1>
            
            <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Reach out to us through any of the channels below.
            </p>

            <div className="max-w-2xl mx-auto">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6 text-center">Get in touch</h2>
                  <p className="text-muted-foreground mb-8 text-center">
                    We're here to help and answer any question you might have. We look forward to hearing from you.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <p className="text-muted-foreground">support@startresume.io</p>
                        <p className="text-sm text-muted-foreground">We'll respond within 24 hours</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Phone</h3>
                        <p className="text-muted-foreground">+40 21 123 4567</p>
                        <p className="text-sm text-muted-foreground">Mon-Fri 9am-6pm EET</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Office</h3>
                        <p className="text-muted-foreground">Calea Victoriei 120<br />Sector 1<br />Bucharest, Romania</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Business Hours</h3>
                        <p className="text-muted-foreground">Monday - Friday: 9:00 AM - 6:00 PM EET<br />Saturday - Sunday: Closed</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 mt-8">
                  <h3 className="font-semibold text-primary-800 mb-2">Need immediate help?</h3>
                  <p className="text-primary-700 text-sm mb-4">
                    Check out our comprehensive FAQ section for instant answers to common questions.
                  </p>
                  <div className="flex justify-center space-x-6">
                    <a href="/help" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Help Center →
                    </a>
                    <a href="/dashboard" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Dashboard →
                    </a>
                    <a href="/billing" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Billing →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
