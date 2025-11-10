import { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Sign In | WanderPlan',
  description:
    'Sign in to your WanderPlan account to access your travel itineraries and plans',
};

/**
 * Login Page
 *
 * Features:
 * - Server-side rendered page with client-side LoginForm
 * - SEO-optimized with metadata
 * - Responsive layout with centered form
 * - Gradient background for premium feel
 *
 * Route: /login
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50/30 to-accent-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        {/* Grid Layout - Form on left, Hero on right (desktop) */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Login Form */}
          <div className="order-2 lg:order-1">
            <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>}>
              <LoginForm />
            </Suspense>
          </div>

          {/* Hero Section - Hidden on mobile */}
          <div className="order-1 lg:order-2 hidden lg:block">
            <div className="space-y-6">
              <h1 className="text-4xl xl:text-5xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                Plan your next
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  adventure
                </span>
              </h1>

              <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-md">
                WanderPlan helps you create detailed itineraries, collaborate
                with travel companions, and organize all your travel information
                in one place.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary-600 dark:text-primary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Day-by-day itineraries
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Build detailed travel plans with drag-and-drop simplicity
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary-600 dark:text-primary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Collaborate with others
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Share trips and plan together with friends and family
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-primary-600 dark:text-primary-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Interactive maps
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      Visualize your journey with routes and points of interest
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
