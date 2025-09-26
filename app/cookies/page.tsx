import { Navigation } from '@/components/navigation'
import Footer from '@/components/footer'

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
              Cookie <span className="gradient-text">Policy</span>
            </h1>
            
            <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
              This policy explains how we use cookies and similar technologies on our website.
            </p>

            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-muted-foreground mb-8">Last updated: December 2024</p>

              <h2 className="text-2xl font-bold mb-4">What Are Cookies</h2>
              <p className="text-muted-foreground mb-8">
                Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and analyzing how you use our site.
              </p>

              <h2 className="text-2xl font-bold mb-4">Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold mb-3">Essential Cookies</h3>
              <p className="text-muted-foreground mb-6">
                These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility.
              </p>

              <h3 className="text-xl font-semibold mb-3">Analytics Cookies</h3>
              <p className="text-muted-foreground mb-6">
                We use analytics cookies to understand how visitors interact with our website. This helps us improve our services and user experience.
              </p>

              <h3 className="text-xl font-semibold mb-3">Functional Cookies</h3>
              <p className="text-muted-foreground mb-6">
                These cookies enable enhanced functionality and personalization, such as remembering your login details and preferences.
              </p>

              <h3 className="text-xl font-semibold mb-3">Marketing Cookies</h3>
              <p className="text-muted-foreground mb-8">
                These cookies track your online activity to help advertisers deliver more relevant advertising or to limit how many times you see an ad.
              </p>

              <h2 className="text-2xl font-bold mb-4">Third-Party Cookies</h2>
              <p className="text-muted-foreground mb-6">
                We may use third-party services that set cookies on our behalf, including:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
                <li>Google Analytics for website analytics</li>
                <li>Stripe for payment processing</li>
                <li>Clerk for user authentication</li>
                <li>Social media platforms for sharing functionality</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">Managing Cookies</h2>
              <p className="text-muted-foreground mb-6">
                You can control and manage cookies in several ways:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
                <li>Browser settings: Most browsers allow you to refuse cookies or delete existing ones</li>
                <li>Opt-out tools: Many advertising networks provide opt-out mechanisms</li>
                <li>Privacy settings: Adjust your privacy preferences in your account settings</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">Cookie Consent</h2>
              <p className="text-muted-foreground mb-8">
                By continuing to use our website, you consent to our use of cookies as described in this policy. You can withdraw your consent at any time by adjusting your browser settings or contacting us.
              </p>

              <h2 className="text-2xl font-bold mb-4">Updates to This Policy</h2>
              <p className="text-muted-foreground mb-8">
                We may update this cookie policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons.
              </p>

              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-8">
                If you have any questions about our use of cookies, please contact us at:
              </p>
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-muted-foreground">
                  Email: privacy@startresume.io<br />
                  Address: Calea Victoriei 120, Sector 1, Bucharest, Romania<br />
                  Phone: +40 21 123 4567
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
