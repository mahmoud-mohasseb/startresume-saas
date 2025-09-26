import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@/components/theme-provider'
import { CookieConsent } from '@/components/CookieConsent'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'
import { SubscriptionProvider } from '../contexts/SubscriptionContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'StartResume - AI-Powered Resume Builder',
    template: '%s | StartResume'
  },
  description: 'Create professional, ATS-optimized resumes with AI assistance. Get hired faster with our intelligent resume builder that tailors your resume to each job application.',
  keywords: [
    'resume builder',
    'AI resume',
    'ATS optimized',
    'job application',
    'career',
    'professional resume',
    'resume templates',
    'cover letter',
    'job search'
  ],
  authors: [{ name: 'StartResume Team' }],
  creator: 'StartResume',
  publisher: 'StartResume',
  metadataBase: new URL('https://startresume.io'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://startresume.io',
    title: 'StartResume - AI-Powered Resume Builder',
    description: 'Create professional, ATS-optimized resumes with AI assistance. Get hired faster with our intelligent resume builder.',
    siteName: 'StartResume',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'StartResume - AI-Powered Resume Builder',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StartResume - AI-Powered Resume Builder',
    description: 'Create professional, ATS-optimized resumes with AI assistance. Get hired faster with our intelligent resume builder.',
    images: ['/og-image.png'],
    creator: '@startresume',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/icon.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.json" />
        </head>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SubscriptionProvider>
              <GlobalErrorBoundary>
                <Toaster position="top-right" />
                
                {/* Prevent accidental page refreshes in AI features */}
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      // Prevent accidental form submissions that cause page refresh
                      document.addEventListener('DOMContentLoaded', function() {
                        document.addEventListener('submit', function(e) {
                          const form = e.target;
                          if (form.tagName === 'FORM' && !form.hasAttribute('data-allowed-submit')) {
                            console.log('⚠️ Preventing potential page refresh from form submission');
                            // Don't prevent if it's a known safe form
                            if (!form.closest('.ai-feature-wrapper') && !form.hasAttribute('data-ai-form')) {
                              // Allow Clerk forms and other essential forms
                              if (!form.closest('[data-clerk-form]') && !form.closest('.clerk-form')) {
                                e.preventDefault();
                                console.log('🛡️ Form submission prevented to avoid page refresh');
                              }
                            }
                          }
                        });
                        
                        // Log when AI features are accessed
                        document.addEventListener('click', function(e) {
                          const target = e.target;
                          if (target.closest('[data-ai-feature]')) {
                            console.log('🤖 AI Feature accessed:', target.closest('[data-ai-feature]').dataset.aiFeature);
                          }
                        });
                      });
                    `
                  }}
                />
                
                {children}
                <CookieConsent />
              </GlobalErrorBoundary>
            </SubscriptionProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
