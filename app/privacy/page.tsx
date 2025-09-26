import { Navigation } from '@/components/navigation'
import Footer from '@/components/footer'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <section className="pt-32 pb-20">
        <div className="container-width section-padding">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            
            <p className="text-xl text-muted-foreground text-center mb-16 max-w-3xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>

            <div className="prose prose-lg max-w-none">
              <p className="text-sm text-muted-foreground mb-8">Last updated: December 2024</p>

              <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
              <p className="text-muted-foreground mb-6">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This includes:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
                <li>Personal information (name, email address, phone number)</li>
                <li>Resume content and career information</li>
                <li>Usage data and analytics</li>
                <li>Device and browser information</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
              <p className="text-muted-foreground mb-6">
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
                <li>Provide and improve our services</li>
                <li>Generate AI-powered resume content</li>
                <li>Send you updates and marketing communications</li>
                <li>Analyze usage patterns and optimize our platform</li>
                <li>Provide customer support</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">Information Sharing</h2>
              <p className="text-muted-foreground mb-6">
                We do not sell, trade, or otherwise transfer your personal information to third parties except:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
                <li>With your explicit consent</li>
                <li>To trusted service providers who assist in operating our platform</li>
                <li>When required by law or to protect our rights</li>
                <li>In connection with a business transfer or acquisition</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">Data Security</h2>
              <p className="text-muted-foreground mb-8">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
              </p>

              <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
              <p className="text-muted-foreground mb-6">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground mb-8 space-y-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
                <li>Contact us with privacy concerns</li>
              </ul>

              <h2 className="text-2xl font-bold mb-4">Cookies and Tracking</h2>
              <p className="text-muted-foreground mb-8">
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie settings through your browser preferences.
              </p>

              <h2 className="text-2xl font-bold mb-4">Changes to This Policy</h2>
              <p className="text-muted-foreground mb-8">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>

              <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
              <p className="text-muted-foreground mb-8">
                If you have any questions about this privacy policy, please contact us at:
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
