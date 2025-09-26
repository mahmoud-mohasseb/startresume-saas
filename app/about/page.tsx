import { Navigation } from '@/components/navigation'
import Footer from '@/components/footer'
import { Users, Target, Award, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
              About <span className="gradient-text">RESUME</span>
            </h1>
            
            <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
              We're on a mission to help professionals land their dream jobs with AI-powered resume creation and career tools.
            </p>

            <div className="grid md:grid-cols-2 gap-12 mb-20">
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Story</h2>
                <p className="text-muted-foreground mb-4">
                  Founded in 2024, RESUME was born from the frustration of seeing talented professionals struggle with resume creation. We realized that even the most qualified candidates were being overlooked due to poorly formatted or non-ATS-optimized resumes.
                </p>
                <p className="text-muted-foreground">
                  Our team of career experts, designers, and AI engineers came together to create a platform that democratizes access to professional resume writing, making it possible for anyone to create compelling, ATS-friendly resumes in minutes.
                </p>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground mb-4">
                  To empower every professional with the tools they need to showcase their talents effectively and land their dream job. We believe that career success shouldn't be limited by resume writing skills.
                </p>
                <p className="text-muted-foreground">
                  Through cutting-edge AI technology and beautiful design, we're making professional resume creation accessible to everyone, regardless of their background or experience level.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-8 mb-20">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold mb-2">50,000+</h3>
                <p className="text-sm text-muted-foreground">Users Served</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold mb-2">3x</h3>
                <p className="text-sm text-muted-foreground">Higher Interview Rate</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold mb-2">95%</h3>
                <p className="text-sm text-muted-foreground">ATS Compatibility</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="font-semibold mb-2">5 min</h3>
                <p className="text-sm text-muted-foreground">Average Creation Time</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Transform Your Career?</h2>
              <p className="text-muted-foreground mb-6">
                Join thousands of professionals who have successfully landed their dream jobs with our AI-powered platform.
              </p>
              <a href="/dashboard" className="btn-primary">
                Get Started Today
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
