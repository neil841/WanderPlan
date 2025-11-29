'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'Do I need to create an account to start planning?',
    answer:
      'No! You can start planning immediately without signing up. Create trips, add destinations, and build your itinerary right away. You only need to create a free account when you want to save your trip permanently.',
  },
  {
    question: 'Is WanderPlan really free?',
    answer:
      'Yes! Core features including trip planning, itinerary building, and budget tracking are completely free forever. No credit card required.',
  },
  {
    question: 'Can I collaborate with friends and family?',
    answer:
      'Absolutely! Real-time collaboration is one of our core features. Invite friends and family to plan together and make group decisions effortlessly.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes. We use industry-standard encryption for all data. Your trips are private by default, and you control who can see or edit them.',
  },
  {
    question: 'Can I export my itinerary?',
    answer:
      'Yes! Export your trip as a PDF, send it via email, or share a live link. The PDF includes maps, directions, and all your notes.',
  },
];

interface FAQItemProps {
  faq: typeof faqs[0];
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ faq, index, isOpen, onToggle }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group"
    >
      <button
        onClick={onToggle}
        className="relative w-full text-left"
      >
        {/* Gradient border bottom - appears on open */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent transition-opacity duration-500 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="flex items-start justify-between gap-6 py-8 border-b border-gray-200/60 transition-colors duration-300 group-hover:border-blue-200">
          <h3
            className={`text-xl font-semibold transition-all duration-300 ${
              isOpen
                ? 'text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text'
                : 'text-gray-900 group-hover:text-blue-600'
            }`}
          >
            {faq.question}
          </h3>

          <div
            className={`flex-shrink-0 mt-1 transition-all duration-500 ${
              isOpen ? 'rotate-180 text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
            }`}
          >
            <ChevronDown className="h-6 w-6" />
          </div>
        </div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{
          height: { duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] },
          opacity: { duration: 0.3, delay: isOpen ? 0.1 : 0 },
        }}
        className="overflow-hidden"
      >
        <div className="pt-6 pb-8 pr-16">
          <p className="text-lg text-gray-600 leading-relaxed">{faq.answer}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Premium FAQ Section
 *
 * Open, breathable design that matches the landing page aesthetic.
 * Elegant gradient accents and generous spacing create a premium feel.
 *
 * Design Features:
 * - Open layout (no constraining boxes)
 * - Gradient text on active questions
 * - Subtle gradient border animations
 * - Generous whitespace and breathing room
 * - Smooth, sophisticated animations
 * - Hover states with premium feel
 *
 * UX Features:
 * - 5 essential questions
 * - One-at-a-time accordion
 * - Clear visual hierarchy
 * - Accessible keyboard navigation
 */
export function FAQSection() {
  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative bg-white px-6 py-20 sm:px-8 lg:px-12 lg:py-32">
      {/* Subtle background gradient orbs - matches hero */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-purple-400/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-20 h-96 w-96 rounded-full bg-blue-400/5 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-4xl">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-blue-50/50 px-4 py-2 backdrop-blur-sm">
            <HelpCircle className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Got questions?</span>
          </div>

          {/* Title */}
          <h2 className="mb-4 text-4xl font-bold text-gray-900 lg:text-5xl">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Everything you need to know about WanderPlan.
          </p>
        </motion.div>

        {/* FAQ Items - Open Layout */}
        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex(openIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
