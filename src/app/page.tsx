'use client';

import { PublicHeader } from '@/components/layout/PublicHeader';
import { HeroSection } from '@/components/landing/HeroSection';
import { FeaturesShowcase } from '@/components/landing/FeaturesShowcase';
import { SocialProofSection } from '@/components/landing/SocialProofSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';

/**
 * WanderPlan Landing Page - Conversion Optimized
 *
 * Complete redesign focused on:
 * 1. Immediate value - no signup wall
 * 2. Clear CTAs - "Start Planning Free"
 * 3. Trust building - social proof, testimonials
 * 4. Question handling - comprehensive FAQ
 * 5. Professional feel - premium footer
 *
 * User Flow:
 * Landing → Start Planning Free → Guest Trip Creation → Smart Signup Prompts
 *
 * NO signup required to start planning!
 */
export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main className="min-h-screen bg-white">
        {/* Hero Section with Immediate CTA */}
        <HeroSection />

        {/* Features Showcase - 6 features */}
        <FeaturesShowcase />

        {/* Social Proof - Testimonials & Stats */}
        <SocialProofSection />

        {/* FAQ Section - 10 questions */}
        <FAQSection />

        {/* Final CTA - Conversion focused */}
        <CTASection />

        {/* Premium Footer - Comprehensive navigation */}
        <Footer />
      </main>
    </>
  );
}
