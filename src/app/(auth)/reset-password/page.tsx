import { Metadata } from 'next';
import { Suspense } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Loader2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reset Password | WanderPlan',
  description: 'Create a new password for your WanderPlan account',
};

/**
 * Reset Password Page Loading Fallback
 */
function ResetPasswordLoading() {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary-600 dark:text-primary-400" />
        <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
          Loading...
        </p>
      </div>
    </div>
  );
}

/**
 * Reset Password Page
 *
 * Public route for confirming password reset with token
 * Uses Suspense to handle searchParams loading state
 */
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <Suspense fallback={<ResetPasswordLoading />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
