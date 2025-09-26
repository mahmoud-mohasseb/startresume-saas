import { Hero } from '@/components/hero'
import { Stats } from '@/components/stats'
import { Features } from '@/components/features'
import { Testimonials } from '@/components/testimonials'
import { PricingSection } from '@/components/pricing-section'
import { FAQ } from '@/components/faq'
import Footer from '@/components/footer'
import { Navigation } from '@/components/navigation'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <Stats />
      <Features />
      <Testimonials />
      <PricingSection />
      <FAQ />
      <Footer />
    </main>
  )
}
