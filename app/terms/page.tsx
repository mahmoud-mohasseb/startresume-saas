import { Navigation } from '@/components/navigation'
import Footer from '@/components/footer'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            
            <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
              Please read these terms carefully before using our service. By using RESUME, you agree to these terms.
            </p>

            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-muted-foreground mb-8">Last updated: December 2024</p>

              <h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2>
              <p className="text-muted-foreground mb-8">
                By accessing and using RESUME, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>

              <h2 className="text-2xl font-bold mb-4">Use License</h2>
              <p className="text-muted-foreground mb-6">
                Permission is granted to temporarily download one copy of RESUME per device for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
                <li>modify or copy the materials</li>
                <li>use the materials for any commercial purpose or for any public display</li>
                <li>attempt to reverse engineer any software contained on the website</li>
                <li>remove any copyright or other proprietary notations from the materials</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">User Accounts</h2>
              <p className="text-muted-foreground mb-8">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>

              <h2 className="text-2xl font-bold mb-4">Content</h2>
              <p className="text-muted-foreground mb-8">
                Our service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post to the service, including its legality, reliability, and appropriateness.
              </p>

              <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
              <p className="text-muted-foreground mb-8">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service, to understand our practices.
              </p>

              <h2 className="text-2xl font-bold mb-4">Prohibited Uses</h2>
              <p className="text-muted-foreground mb-6">
                You may not use our service:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">Termination</h2>
              <p className="text-muted-foreground mb-8">
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>

              <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
              <p className="text-muted-foreground mb-8">
                The information on this website is provided on an "as is" basis. To the fullest extent permitted by law, this Company excludes all representations, warranties, conditions and terms.
              </p>

              <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground mb-8">
                In no event shall RESUME, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>

              <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
              <p className="text-muted-foreground mb-8">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
              </p>

              <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
              <p className="text-muted-foreground mb-8">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-muted-foreground">
                  Email: legal@startresume.io<br />
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
