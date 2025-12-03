'use client';

import { motion } from 'framer-motion';
import { Plane, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Premium Hero Section
 *
 * Conversion-optimized hero with immediate value proposition.
 * No signup wall - direct CTA to start planning.
 *
 * Features:
 * - Clear value proposition
 * - Single centered CTA (Start Planning Free)
 * - Trust indicators below CTA
 * - Premium gradient background
 * - Performance-optimized animations
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white">
      {/* Subtle background orbs - PERFORMANCE OPTIMIZED */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="absolute -right-40 top-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/50 px-4 py-2 backdrop-blur-sm"
          >
            <Plane className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Trusted by 25,000+ travelers worldwide
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl"
          >
            Plan Your Dream Trip
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 bg-clip-text text-transparent">
              in Minutes
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mb-12 max-w-2xl text-lg text-gray-600 sm:text-xl"
          >
            Collaborative travel planning with smart itineraries, budget tracking,
            and real-time collaboration.{' '}
            <span className="font-semibold text-gray-900">
              No signup required to start.
            </span>
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-12 flex justify-center"
          >
            {/* Primary CTA - Start Planning */}
            <Link href="/plan/new">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-8 py-4 font-semibold text-white shadow-lg shadow-blue-500/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/40"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Planning
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </motion.button>
            </Link>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Collaborate in real-time</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>AI-powered itineraries</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Built-in budget tracking</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-12 text-white"
          viewBox="0 0 1440 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0 48h1440V0s-187.5 48-480 48S480 0 480 0 292.5 48 0 48z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
