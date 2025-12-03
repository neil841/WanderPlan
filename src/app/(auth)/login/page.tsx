'use client';

import { Metadata } from 'next';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import {  Plane, Globe, Map, Calendar } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

/**
 * Premium Login Page
 *
 * Features:
 * - Premium travel-themed design matching landing page
 * - Animated gradient backgrounds
 * - Split layout: Form on left, benefits on right
 * - Fully responsive
 * - SEO-optimized with metadata
 *
 * Route: /login
 */
export default function LoginPage() {
  const benefits = [
    {
      icon: Map,
      title: 'Smart Itinerary Planning',
      description: 'Create day-by-day itineraries with intelligent suggestions',
    },
    {
      icon: Globe,
      title: 'Global Destinations',
      description: 'Explore and plan trips to over 150+ countries worldwide',
    },
    {
      icon: Calendar,
      title: 'Trip Timeline',
      description: 'Visualize your entire journey on an interactive calendar',
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Animated background gradients - matching landing page */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -left-1/4 -top-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -right-1/4 top-1/3 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/15 to-pink-400/15 blur-3xl"
        />
      </div>

      {/* Main Content */}
      <div className="relative flex min-h-screen items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Login Form - Left Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="flex items-center justify-center"
            >
              <Suspense
                fallback={
                  <div className="flex h-[400px] w-full max-w-md items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  </div>
                }
              >
                <LoginForm />
              </Suspense>
            </motion.div>

            {/* Benefits Section - Right Side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
              className="hidden items-center lg:flex"
            >
              <div className="space-y-8">
                {/* Header */}
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/50 px-4 py-2 backdrop-blur-sm"
                  >
                    <Plane className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Travel Made Simple</span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="mb-4 text-4xl font-bold leading-tight text-gray-900 xl:text-5xl"
                  >
                    Welcome back to
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                      WanderPlan
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="max-w-md text-lg leading-relaxed text-gray-600"
                  >
                    Continue planning your dream adventures with intelligent tools,
                    real-time collaboration, and seamless organization.
                  </motion.p>
                </div>

                {/* Benefits List */}
                <div className="space-y-6 pt-4">
                  {benefits.map((benefit, index) => {
                    const Icon = benefit.icon;
                    return (
                      <motion.div
                        key={benefit.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                        className="flex items-start gap-4"
                      >
                        <div className="flex-shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-2.5 shadow-lg">
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{benefit.title}</h3>
                          <p className="mt-1 text-sm text-gray-600">{benefit.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Social Proof */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="rounded-2xl border border-gray-200/50 bg-white/50 p-6 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <img
                        src="https://i.pravatar.cc/150?img=12"
                        alt="User avatar"
                        className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      />
                      <img
                        src="https://i.pravatar.cc/150?img=47"
                        alt="User avatar"
                        className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      />
                      <img
                        src="https://i.pravatar.cc/150?img=32"
                        alt="User avatar"
                        className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      />
                      <img
                        src="https://i.pravatar.cc/150?img=65"
                        alt="User avatar"
                        className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">25,000+ Travelers</p>
                      <p className="text-xs text-gray-600">Trust WanderPlan worldwide</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
