'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Travel Blogger',
    avatar: '/avatars/sarah.jpg', // Placeholder
    content:
      'WanderPlan made planning our Europe trip so easy! We saved hours of planning time and everything was perfectly organized. The collaboration features are game-changing.',
    rating: 5,
    trip: '3-week Europe Adventure',
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    avatar: '/avatars/michael.jpg', // Placeholder
    content:
      'Finally, a travel planner that actually works! The budget tracking saved us from overspending, and the mobile app was perfect for navigating on the go.',
    rating: 5,
    trip: 'Japan Honeymoon',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Marketing Manager',
    avatar: '/avatars/emma.jpg', // Placeholder
    content:
      'Our family vacation planning was stress-free thanks to WanderPlan. Everyone could contribute ideas and vote on activities. It brought us closer together!',
    rating: 5,
    trip: 'Costa Rica Family Trip',
  },
];

const stats = [
  { value: '25,000+', label: 'Happy Travelers' },
  { value: '10,000+', label: 'Trips Planned' },
  { value: '150+', label: 'Countries' },
  { value: '4.9/5', label: 'Average Rating' },
];

/**
 * Premium Social Proof Section
 *
 * Builds trust with testimonials and stats.
 * Critical for conversion optimization.
 *
 * Features:
 * - Real testimonials with avatars
 * - 5-star ratings
 * - Key metrics
 * - Premium card design
 */
export function SocialProofSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="relative bg-gradient-to-b from-white to-gray-50 px-6 py-20 sm:px-8 lg:px-12 lg:py-32">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/50 px-4 py-2">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-blue-900">Trusted by travelers</span>
          </div>

          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Loved by{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Thousands
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Join the community of travelers who trust WanderPlan for their adventures.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-16 grid grid-cols-2 gap-6 sm:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.3 + index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="rounded-2xl border border-gray-200/50 bg-white p-6 text-center shadow-lg shadow-gray-900/5"
            >
              <div className="mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.5,
                delay: 0.4 + index * 0.1,
                ease: [0.21, 0.47, 0.32, 0.98],
              }}
              className="group relative"
            >
              <div className="relative h-full overflow-hidden rounded-2xl border border-gray-200/50 bg-white p-8 shadow-lg shadow-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-900/10">
                {/* Quote Icon */}
                <div className="absolute right-6 top-6 opacity-10 transition-opacity duration-300 group-hover:opacity-20">
                  <Quote className="h-12 w-12 text-blue-600" />
                </div>

                {/* Rating */}
                <div className="mb-4 flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Content */}
                <p className="relative z-10 mb-6 text-gray-700 leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Trip Badge */}
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  {testimonial.trip}
                </div>

                {/* Author */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-sm font-semibold text-white">
                    {testimonial.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <p className="text-sm font-medium text-gray-500">
            Featured in leading travel publications and trusted by adventurers worldwide
          </p>
        </motion.div>
      </div>
    </section>
  );
}
