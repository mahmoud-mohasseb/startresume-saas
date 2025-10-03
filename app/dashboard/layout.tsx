"use client"

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Home, MessageSquare, History, Brain, Linkedin, Target, Menu, X, Star, DollarSign, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'
import PlanBasedCreditWidget from '@/components/PlanBasedCreditWidget'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
    }
  }, [isLoaded, user, router])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu when clicking outside or pressing escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-800 dark:to-teal-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isActive = (path: string) => pathname === path

  const navigationItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      color: 'text-blue-500 dark:text-blue-400'
    },
    {
      href: '/dashboard/create',
      label: 'Create Resume',
      icon: FileText,
      color: 'text-emerald-500 dark:text-emerald-400'
    },
    {
      href: '/dashboard/job-tailoring',
      label: 'Job Tailoring',
      icon: Target,
      color: 'text-red-500 dark:text-red-400'
    },
    {
      href: '/dashboard/salary-negotiation',
      label: 'Salary Coach',
      icon: DollarSign,
      color: 'text-green-500 dark:text-green-400'
    },
    {
      href: '/dashboard/personal-brand',
      label: 'Personal Brand',
      icon: Star,
      color: 'text-yellow-500 dark:text-yellow-400'
    },
    {
      href: '/dashboard/cover-letter',
      label: 'Cover Letter',
      icon: MessageSquare,
      color: 'text-purple-500 dark:text-purple-400'
    },
    {
      href: '/dashboard/history',
      label: 'History',
      icon: History,
      color: 'text-orange-500 dark:text-orange-400'
    },
    {
      href: '/dashboard/mock-interview',
      label: 'Mock Interview',
      icon: Brain,
      color: 'text-pink-500 dark:text-pink-400'
    },
    {
      href: '/dashboard/linkedin-optimizer',
      label: 'LinkedIn Optimizer',
      icon: Linkedin,
      color: 'text-blue-600 dark:text-blue-400'
    }
  ]

  const SidebarNavLink = ({ item }: { item: typeof navigationItems[0] }) => {
    const IconComponent = item.icon
    return (
      <Link 
        href={item.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
          isActive(item.href)
            ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-500/25'
            : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-900/20'
        }`}
        title={!isSidebarExpanded ? item.label : undefined}
      >
        <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive(item.href) ? 'text-white' : item.color}`} />
        {isSidebarExpanded && (
          <span className="leading-none truncate">{item.label}</span>
        )}
      </Link>
    )
  }

  return (
    <SubscriptionProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/30 shadow-lg transition-all duration-300 z-40 ${
        isSidebarExpanded ? 'lg:w-64' : 'lg:w-20'
      }`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/20 dark:border-gray-700/30 flex-shrink-0">
            {isSidebarExpanded && (
              <Link href="/" className="flex items-center">
                <img 
                  src="/logo.svg" 
                  alt="StartResume" 
                  className="h-8 w-auto"
                  style={{ maxWidth: '120px' }}
                />
              </Link>
            )}
            
            <button
              onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-colors"
            >
              {isSidebarExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <SidebarNavLink key={item.href} item={item} />
            ))}
          </nav>

          {/* Credit Widget */}
          {isSidebarExpanded && (
            <div className="px-4 pb-4">
              <PlanBasedCreditWidget />
            </div>
          )}

          {/* User Section */}
          <div className="p-4 border-t border-white/20 dark:border-gray-700/30 flex-shrink-0">
            <div className={`flex items-center gap-3 ${!isSidebarExpanded && 'justify-center'}`}>
              <UserButton />
              {isSidebarExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="lg:hidden relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 shadow-lg sticky top-0 z-50">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Mobile Logo */}
            <Link href="/" className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="StartResume" 
                className="h-8 w-auto"
                style={{ maxWidth: '100px' }}
              />
            </Link>
            
            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3">
              <UserButton />
              <button
                onClick={() => {
                  console.log('Mobile menu toggled:', !isMobileMenuOpen)
                  setIsMobileMenuOpen(!isMobileMenuOpen)
                }}
                className="flex items-center justify-center p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-colors lg:hidden border border-gray-200 dark:border-gray-700"
                aria-label="Toggle mobile menu"
                type="button"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Dropdown */}
          <div 
            className={`absolute top-full left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 shadow-xl transition-all duration-300 ease-in-out z-40 ${
              isMobileMenuOpen 
                ? 'opacity-100 visible transform translate-y-0' 
                : 'opacity-0 invisible transform -translate-y-2'
            }`}
            style={{ 
              display: isMobileMenuOpen ? 'block' : 'none' // Fallback for older browsers
            }}
          >
            <nav className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
              {navigationItems.map((item) => {
                const IconComponent = item.icon
                return (
                  <Link 
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 block w-full ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/80 dark:hover:bg-blue-900/20'
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive(item.href) ? 'text-white' : item.color}`} />
                    <span className="leading-none">{item.label}</span>
                  </Link>
                )
              })}
              
              {/* Mobile Credit Widget */}
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <PlanBasedCreditWidget />
              </div>
            </nav>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-20'
        }`}>
          <div className="min-h-screen w-full">
            {children}
          </div>
        </main>
      </div>
    </SubscriptionProvider>
  )
}
