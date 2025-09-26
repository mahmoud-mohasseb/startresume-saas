"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, FileText, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser, UserButton } from '@clerk/nextjs'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoaded } = useUser()

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container-width section-padding py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <img src="/logo.svg" alt="Resume" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoaded && user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-foreground">
                  Welcome, {user.firstName || user.fullName}!
                </span>
                <Link href="/dashboard" className="btn-primary">
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <>
                <Link href="/sign-in" className="btn-secondary">
                  Sign In
                </Link>
                <Link href="/dashboard" className="btn-primary">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-border"
            >
              <div className="flex flex-col space-y-4 pt-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="flex flex-col space-y-3 pt-4">
                  {isLoaded && user ? (
                    <div className="flex flex-col space-y-3">
                      <span className="text-sm font-medium text-foreground">
                        Welcome, {user.firstName || user.fullName}!
                      </span>
                      <Link href="/dashboard" className="btn-primary">
                        Dashboard
                      </Link>
                      <UserButton afterSignOutUrl="/" />
                    </div>
                  ) : (
                    <>
                      <Link href="/sign-in" className="btn-secondary">
                        Sign In
                      </Link>
                      <Link href="/dashboard" className="btn-primary">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Go to Dashboard
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
