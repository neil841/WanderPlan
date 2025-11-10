'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PasswordStrength } from './PasswordStrength';
import { registerSchema } from '@/lib/validations/auth';
import { z } from 'zod';

// Form input type (timezone is optional for form input)
type RegisterFormInput = z.input<typeof registerSchema>;

/**
 * Premium Registration Form Component
 *
 * Features:
 * - Elegant design with smooth animations
 * - Real-time form validation with react-hook-form + Zod
 * - Password strength indicator
 * - Show/hide password toggle
 * - Loading, error, and success states
 * - WCAG 2.1 AA compliant
 * - Fully responsive (mobile-first)
 * - Integrates with /api/auth/register endpoint
 *
 * @component
 * @example
 * <RegisterForm />
 */
export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: RegisterFormInput) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error?.message || 'Failed to create account'
        );
      }

      setSuccess(true);

      // Redirect to verify-email notice after a brief delay
      setTimeout(() => {
        router.push('/verify-email');
      }, 2000);
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
          >
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Create Account
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Start planning your next adventure
            </p>
          </motion.div>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Alert */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Alert className="bg-success-50 border-success-200 dark:bg-success-900/20 dark:border-success-800">
                <CheckCircle2 className="h-4 w-4 text-success-600 dark:text-success-400" />
                <AlertTitle className="text-success-800 dark:text-success-400">
                  Success!
                </AlertTitle>
                <AlertDescription className="text-success-700 dark:text-success-300">
                  Account created. Please check your email to verify your
                  account.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Name Fields Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label
                htmlFor="firstName"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                First Name
              </Label>
              <Input
                id="firstName"
                {...register('firstName')}
                type="text"
                placeholder="John"
                disabled={isLoading || success}
                aria-invalid={!!errors.firstName}
                aria-describedby={
                  errors.firstName ? 'firstName-error' : undefined
                }
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              />
              {errors.firstName && (
                <p
                  id="firstName-error"
                  className="text-sm text-error-600 dark:text-error-400"
                  role="alert"
                >
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label
                htmlFor="lastName"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Last Name
              </Label>
              <Input
                id="lastName"
                {...register('lastName')}
                type="text"
                placeholder="Doe"
                disabled={isLoading || success}
                aria-invalid={!!errors.lastName}
                aria-describedby={
                  errors.lastName ? 'lastName-error' : undefined
                }
                className="transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              />
              {errors.lastName && (
                <p
                  id="lastName-error"
                  className="text-sm text-error-600 dark:text-error-400"
                  role="alert"
                >
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Email
            </Label>
            <Input
              id="email"
              {...register('email')}
              type="email"
              placeholder="john.doe@example.com"
              disabled={isLoading || success}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className="transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            />
            {errors.email && (
              <p
                id="email-error"
                className="text-sm text-error-600 dark:text-error-400"
                role="alert"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label
              htmlFor="password"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter a strong password"
                disabled={isLoading || success}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? 'password-error' : 'password-strength'
                }
                className="pr-10 transition-all duration-200 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isLoading || success}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="text-sm text-error-600 dark:text-error-400"
                role="alert"
              >
                {errors.password.message}
              </p>
            )}

            {/* Password Strength Indicator */}
            <div id="password-strength">
              <PasswordStrength password={passwordValue} />
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || success}
            className="w-full h-11 text-base font-medium transition-all duration-200 mt-6"
          >
            {isLoading ? (
              <motion.div
                className="flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                <span>Creating account...</span>
              </motion.div>
            ) : success ? (
              <motion.div
                className="flex items-center justify-center gap-2"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
              >
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                <span>Account created!</span>
              </motion.div>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
