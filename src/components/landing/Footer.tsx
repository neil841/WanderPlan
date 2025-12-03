'use client';

import Link from 'next/link';
import { Plane, Twitter, Instagram, Facebook, Linkedin, Mail } from 'lucide-react';

const footerLinks = {
  product: [
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Mobile Apps', href: '/mobile' },
    { label: 'Roadmap', href: '/roadmap' },
    { label: 'Changelog', href: '/changelog' },
  ],
  resources: [
    { label: 'Help Center', href: '/help' },
    { label: 'Blog', href: '/blog' },
    { label: 'Travel Guides', href: '/guides' },
    { label: 'API Documentation', href: '/api-docs' },
    { label: 'Community', href: '/community' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press Kit', href: '/press' },
    { label: 'Contact', href: '/contact' },
    { label: 'Partners', href: '/partners' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Security', href: '/security' },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com/wanderplan', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/wanderplan', label: 'Instagram' },
  { icon: Facebook, href: 'https://facebook.com/wanderplan', label: 'Facebook' },
  { icon: Linkedin, href: 'https://linkedin.com/company/wanderplan', label: 'LinkedIn' },
];

/**
 * Premium Footer
 *
 * Comprehensive footer with navigation, social links, and legal.
 * Makes the app feel professional and complete.
 *
 * Features:
 * - 4-column navigation (Product, Resources, Company, Legal)
 * - Social media links
 * - Newsletter signup
 * - Copyright and branding
 */
export function Footer() {
  return (
    <footer className="relative bg-gray-900 text-gray-300">
      {/* Top Wave Divider */}
      <div className="absolute top-0 left-0 right-0 rotate-180">
        <svg
          className="w-full h-12 text-gray-900"
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

      <div className="container mx-auto max-w-7xl px-6 pt-20 pb-12 sm:px-8 lg:px-12">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 transition-transform duration-200 group-hover:scale-110">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">WanderPlan</span>
            </Link>

            <p className="mb-6 text-gray-400 leading-relaxed">
              Plan your dream trips with the world's most intuitive travel planning platform.
              Trusted by 25,000+ travelers worldwide.
            </p>

            {/* Newsletter */}
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Stay Updated</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button className="rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30">
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold text-white">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold text-white">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 text-sm font-semibold text-white">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-gray-800 pt-8 sm:flex-row">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} WanderPlan. Made with ❤️ for travelers.
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-800 text-gray-400 transition-all duration-200 hover:border-gray-600 hover:bg-gray-800 hover:text-white"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
