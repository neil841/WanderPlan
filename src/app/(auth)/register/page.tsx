import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Create Account | WanderPlan',
  description:
    'Create your WanderPlan account and start planning your next adventure with professional-grade travel planning tools.',
};

/**
 * User Registration Page
 *
 * @route /register
 * @access Public
 *
 * Features:
 * - Clean, modern registration form
 * - Real-time validation
 * - Password strength indicator
 * - Error and success handling
 * - Responsive design
 * - WCAG 2.1 AA compliant
 */
export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Branding & Benefits */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl font-bold text-neutral-900 dark:text-neutral-100">
                Welcome to
                <br />
                <span className="bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                  WanderPlan
                </span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">
                Professional-grade travel planning made accessible to everyone.
              </p>
            </div>

            <div className="space-y-4">
              <FeatureItem
                title="Collaborative Planning"
                description="Work together with your travel companions in real-time"
              />
              <FeatureItem
                title="Smart Organization"
                description="Keep all your trip details organized in one place"
              />
              <FeatureItem
                title="Beautiful Itineraries"
                description="Create stunning day-by-day plans with drag-and-drop"
              />
              <FeatureItem
                title="Budget Tracking"
                description="Stay on budget with expense tracking and splitting"
              />
            </div>

            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <p className="text-sm text-neutral-500 dark:text-neutral-500">
                Trusted by travelers worldwide 🌍
              </p>
            </div>
          </div>

          {/* Right Side - Registration Form */}
          <div>
            <RegisterForm />
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Feature Item Component
 * Displays a single feature benefit
 */
function FeatureItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mt-0.5">
        <svg
          className="w-4 h-4 text-primary-600 dark:text-primary-400"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </p>
      </div>
    </div>
  );
}
