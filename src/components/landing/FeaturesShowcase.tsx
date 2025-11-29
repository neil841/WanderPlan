'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Map,
  Users,
  Wallet,
  Globe,
} from 'lucide-react';

const features = [
  {
    icon: Map,
    title: 'Smart Itinerary Planning',
    description:
      'Create detailed day-by-day itineraries with intelligent suggestions. Drag-and-drop simplicity meets powerful planning tools.',
    gradient: 'from-blue-500 to-cyan-500',
    benefits: ['AI-powered suggestions', 'Drag & drop interface', 'Multi-day planning'],
  },
  {
    icon: Users,
    title: 'Real-Time Collaboration',
    description:
      'Plan together with friends and family. Share ideas, vote on activities, and make group decisions effortlessly.',
    gradient: 'from-purple-500 to-pink-500',
    benefits: ['Live collaboration', 'Voting system', 'Activity polls'],
  },
  {
    icon: Wallet,
    title: 'Budget Management',
    description:
      'Track expenses, split costs fairly, and stay on budget. See spending breakdown by category in real-time.',
    gradient: 'from-orange-500 to-red-500',
    benefits: ['Expense tracking', 'Cost splitting', 'Budget alerts'],
  },
];

interface FeatureCardProps {
  feature: typeof features[0];
  index: number;
}

function FeatureCard({ feature, index }: FeatureCardProps) {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      className="group relative"
    >
      <div className="relative h-full overflow-hidden rounded-2xl border border-gray-200/50 bg-white p-8 shadow-lg shadow-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl hover:shadow-gray-900/10">
        {/* Hover gradient background */}
        <div
          className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`}
        />

        {/* Icon */}
        <div
          className={`relative z-10 mb-6 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-3.5 shadow-lg transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon className="h-7 w-7 text-white" />
        </div>

        {/* Content */}
        <h3 className="relative z-10 mb-3 text-xl font-semibold text-gray-900 transition-colors duration-300">
          {feature.title}
        </h3>

        <p className="relative z-10 mb-4 text-gray-600 leading-relaxed">
          {feature.description}
        </p>

        {/* Benefits */}
        <ul className="relative z-10 space-y-2">
          {feature.benefits.map((benefit, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
              <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${feature.gradient}`} />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/**
 * Premium Features Showcase
 *
 * 3-feature grid with premium card design.
 * Shows value before asking for signup.
 *
 * Features:
 * - 3 core features (Smart Itinerary, Collaboration, Budget)
 * - Premium card design with hover effects
 * - Gradient icons
 * - Benefit bullets
 * - Smooth entrance animations
 * - No "Learn more" buttons (informational only)
 */
export function FeaturesShowcase() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <section className="relative bg-white px-6 py-20 sm:px-8 lg:px-12 lg:py-32">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200/50 bg-purple-50/50 px-4 py-2">
            <Globe className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Everything you need</span>
          </div>

          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Travel Planning,{' '}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Simplified
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Powerful features designed to make travel planning effortless,
            collaborative, and enjoyable for everyone.
          </p>
        </motion.div>

        {/* Feature Grid - 3 core features */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
