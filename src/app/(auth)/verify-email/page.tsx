/**
 * Email Verification Page
 * Handles email verification via token in URL query params
 *
 * Route: /verify-email?token=xxx
 * Access: Public
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type VerificationState = 'loading' | 'success' | 'error' | 'already-verified';

interface VerificationResult {
  message: string;
  email?: string;
  alreadyVerified?: boolean;
}

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerificationState>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams?.get('token');

      if (!token) {
        setState('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data: VerificationResult = await response.json();

        if (response.ok) {
          if (data.alreadyVerified) {
            setState('already-verified');
          } else {
            setState('success');
          }
          setMessage(data.message);
          setEmail(data.email || '');
        } else {
          setState('error');
          setMessage(data.message || 'Verification failed');
        }
      } catch (error) {
        setState('error');
        setMessage('An unexpected error occurred');
        console.error('[Verification Error]:', error);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    router.push('/login');
  };

  const handleResendEmail = async () => {
    // This would typically call an API to resend verification email
    // For now, redirect to login where they can request a new email
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50/30 to-accent-50/20 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-8">
          {/* Loading State */}
          {state === 'loading' && (
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30"
              >
                <Loader2 className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Verifying your email
              </h2>

              <p className="text-neutral-600 dark:text-neutral-400">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {/* Success State */}
          {state === 'success' && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-success-100 dark:bg-success-900/30"
              >
                <CheckCircle2 className="h-8 w-8 text-success-600 dark:text-success-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Email verified!
              </h2>

              <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                {message}
              </p>

              {email && (
                <p className="text-sm text-neutral-500 dark:text-neutral-500 mb-8">
                  {email}
                </p>
              )}

              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Already Verified State */}
          {state === 'already-verified' && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30"
              >
                <Mail className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Already verified
              </h2>

              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                {message}
              </p>

              <Button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
              >
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Error State */}
          {state === 'error' && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-error-100 dark:bg-error-900/30"
              >
                <XCircle className="h-8 w-8 text-error-600 dark:text-error-400" />
              </motion.div>

              <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                Verification failed
              </h2>

              <p className="text-neutral-600 dark:text-neutral-400 mb-8">
                {message}
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleResendEmail}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                >
                  Request New Verification Email
                </Button>

                <Button
                  onClick={() => router.push('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Need help?{' '}
              <Link
                href="/support"
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
              >
                Contact support
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/**
 * Email Verification Page
 * Wrapped in Suspense for useSearchParams
 */
export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-primary-50/30 to-accent-50/20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
