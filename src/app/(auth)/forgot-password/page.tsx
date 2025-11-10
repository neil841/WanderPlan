import { Metadata } from 'next';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Forgot Password | WanderPlan',
  description: 'Reset your WanderPlan password',
};

/**
 * Forgot Password Page
 *
 * Public route for requesting password reset
 */
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <ForgotPasswordForm />
    </div>
  );
}
