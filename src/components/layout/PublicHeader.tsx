/**
 * Public Header Component
 *
 * Smart navigation that adapts based on user authentication state:
 * - Unauthenticated + no trips: Show "Start Planning" CTA
 * - Unauthenticated + has trips: Show "My Trips" + "Start Planning"
 * - Authenticated: Redirect to authenticated Header
 *
 * Features:
 * - Premium travel-themed design matching authenticated header
 * - Responsive mobile menu
 * - Guest mode awareness via localStorage
 */

'use client';

import { useState, useEffect } from 'react';
import { Menu, Plane, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getGuestTrips } from '@/lib/guest-mode';
import { motion, AnimatePresence } from 'framer-motion';

export function PublicHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [hasGuestTrips, setHasGuestTrips] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check if user has guest trips in localStorage
    const trips = getGuestTrips();
    setHasGuestTrips(trips.length > 0);
  }, [pathname]); // Re-check when route changes

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-8">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 shadow-md transition-all group-hover:shadow-lg">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="hidden text-xl font-bold text-gray-900 sm:block">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  WanderPlan
                </span>
              </span>
            </Link>

            {/* Desktop Navigation - Show "My Trips" if guest has trips */}
            {hasGuestTrips && (
              <nav className="hidden lg:flex lg:gap-1">
                <Link
                  href="/plan"
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                    isActive('/plan')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  My Trips
                </Link>
              </nav>
            )}
          </div>

          {/* Right: CTAs */}
          <div className="flex items-center gap-3">
            {/* Show different CTAs based on guest state */}
            {hasGuestTrips ? (
              <>
                {/* Desktop: New Trip + Sign Up */}
                <div className="hidden sm:flex items-center gap-3">
                  <Link href="/plan/new">
                    <Button variant="outline">New Trip</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
                {/* Mobile: Just Sign Up */}
                <div className="sm:hidden">
                  <Link href="/register">
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* No trips yet - show Start Planning CTA */}
                <div className="hidden sm:flex items-center gap-3">
                  <Link href="/login">
                    <Button variant="ghost">Log In</Button>
                  </Link>
                  <Link href="/plan/new">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      Start Planning
                    </Button>
                  </Link>
                </div>
                {/* Mobile: Just Start Planning */}
                <div className="sm:hidden">
                  <Link href="/plan/new">
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                      Start
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-72 bg-white shadow-2xl lg:hidden"
            >
              <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-4">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileNavOpen(false)}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600">
                      <Plane className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-lg font-bold">
                      <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                        WanderPlan
                      </span>
                    </span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileNavOpen(false)}
                    aria-label="Close navigation menu"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4">
                  <div className="space-y-2">
                    {/* Show My Trips if guest has trips */}
                    {hasGuestTrips && (
                      <Link
                        href="/plan"
                        onClick={() => setMobileNavOpen(false)}
                        className={`block rounded-lg px-4 py-3 text-base font-medium transition-all ${
                          isActive('/plan')
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        My Trips
                      </Link>
                    )}

                    {hasGuestTrips && (
                      <Link
                        href="/plan/new"
                        onClick={() => setMobileNavOpen(false)}
                        className="block rounded-lg px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                      >
                        New Trip
                      </Link>
                    )}
                  </div>
                </nav>

                {/* Bottom CTAs */}
                <div className="border-t p-4 space-y-3">
                  {hasGuestTrips ? (
                    <>
                      <Link href="/register" onClick={() => setMobileNavOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                          Sign Up
                        </Button>
                      </Link>
                      <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Log In
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/plan/new" onClick={() => setMobileNavOpen(false)}>
                        <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                          Start Planning
                        </Button>
                      </Link>
                      <Link href="/login" onClick={() => setMobileNavOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Log In
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
