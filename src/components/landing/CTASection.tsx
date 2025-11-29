'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

/**
 * Premium Final CTA Section
 *
 * Conversion-focused section before footer.
 * Last chance to convert visitors.
 *
 * Features:
 * - Eye-catching gradient background
 * - Clear value proposition
 * - Trust indicators
 * - Prominent CTA button
 */
export function CTASection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="relative px-6 py-20 sm:px-8 lg:px-12 lg:py-32">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 p-12 text-center shadow-2xl shadow-blue-500/30 lg:p-16"
        >
          {/* Animated background pattern - PERFORMANCE OPTIMIZED */}
          <div className="absolute inset-0 opacity-10">
            <div
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px',
              }}
              className="absolute inset-0"
            />
          </div>

          {/* Static gradient orbs for depth - PERFORMANCE OPTIMIZED */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-sm"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Join 25,000+ travelers</span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mb-4 text-3xl font-bold text-white lg:text-5xl"
            >
              Ready to Explore the World?
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mx-auto mb-10 max-w-2xl text-lg text-blue-50 lg:text-xl"
            >
              Join thousands of travelers who trust WanderPlan to bring their dream trips
              to life. Start planning your next adventure today.
            </motion.p>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col items-center gap-6"
            >
              <Link href="/plan/new">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-10 py-5 text-lg font-semibold text-blue-600 shadow-2xl transition-all duration-200 hover:shadow-white/20"
                >
                  <span>Start Planning</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                </motion.button>
              </Link>

              {/* Sub-text */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-blue-100">
                <span>✓ No credit card required</span>
                <span className="hidden sm:inline">•</span>
                <span>✓ Unlimited trips</span>
                <span className="hidden sm:inline">•</span>
                <span>✓ Real-time collaboration</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
