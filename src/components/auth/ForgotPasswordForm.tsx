'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { passwordResetRequestSchema } from '@/lib/validations/auth';

// Form data type
type ForgotPasswordFormData = {
  email: string;
};

/**
 * Forgot Password Form Component
 *
 * Features:
 * - Email input for password reset request
 * - Real-time form validation with react-hook-form + Zod
 * - Loading, error, and success states
 * - Smooth animations with Framer Motion
 * - WCAG 2.1 AA compliant
 * - Fully responsive (mobile-first)
 * - Link back to login page
 *
 * @component
 * @example
 * <ForgotPasswordForm />
 */
export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to send reset email');
      }

      // Success - show message
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 p-6 md:p-8 lg:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg"
          >
            <Mail className="h-8 w-8" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100"
          >
            Forgot password?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
          >
            No worries! Enter your email and we&apos;ll send you reset instructions.
          </motion.p>
        </div>

        {/* Success State */}
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Alert className="bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800">
                <CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-400" />
                <AlertTitle className="text-success-900 dark:text-success-100">
                  Check your email
                </AlertTitle>
                <AlertDescription className="text-success-800 dark:text-success-200">
                  If an account exists with that email, you&apos;ll receive password reset instructions shortly.
                </AlertDescription>
              </Alert>

              <div className="space-y-4 pt-2">
                <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                  Didn&apos;t receive the email? Check your spam folder or try again.
                </p>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSuccess(false);
                    setError(null);
                  }}
                >
                  Send another email
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Error Alert */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mb-6"
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="space-y-2"
                >
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    disabled={isLoading}
                    className={`transition-all duration-200 ${
                      errors.email
                        ? 'border-error-500 focus:ring-error-500'
                        : 'focus:ring-primary-500'
                    }`}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    {...register('email')}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        id="email-error"
                        role="alert"
                        className="text-xs text-error-600 dark:text-error-400"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <motion.div
                      className="flex items-center justify-center gap-2"
                      whileTap={{ scale: isLoading ? 1 : 0.98 }}
                    >
                      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      <span>{isLoading ? 'Sending...' : 'Send reset instructions'}</span>
                    </motion.div>
                  </Button>
                </motion.div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
