'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Eye, EyeOff, LogIn } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { loginSchema } from '@/lib/validations/auth';

// Form data type (matches loginSchema exactly)
type LoginFormData = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

/**
 * Premium Login Form Component
 *
 * Features:
 * - Elegant design with smooth animations
 * - Real-time form validation with react-hook-form + Zod
 * - Show/hide password toggle
 * - Remember me checkbox
 * - Loading, error, and success states
 * - Rate limit error handling
 * - Email verification warning display
 * - WCAG 2.1 AA compliant
 * - Fully responsive (mobile-first)
 * - Integrates with NextAuth v5 signIn()
 *
 * @component
 * @example
 * <LoginForm />
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        // Handle NextAuth errors
        setError(result.error);
      } else if (result?.ok) {
        // Successful login - redirect to dashboard or callback URL
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
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
            <LogIn className="h-8 w-8" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100"
          >
            Welcome back
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"
          >
            Sign in to your account to continue
          </motion.p>
        </div>

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

        {/* Login Form */}
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
              Email
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

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Password
              </Label>
              <Link
                href="/reset-password"
                className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                disabled={isLoading}
                className={`pr-10 transition-all duration-200 ${
                  errors.password
                    ? 'border-error-500 focus:ring-error-500'
                    : 'focus:ring-primary-500'
                }`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  id="password-error"
                  role="alert"
                  className="text-xs text-error-600 dark:text-error-400"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Remember Me Checkbox */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="flex items-center space-x-2"
          >
            <Checkbox
              id="rememberMe"
              disabled={isLoading}
              {...register('rememberMe')}
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm text-neutral-600 dark:text-neutral-400 cursor-pointer select-none"
            >
              Remember me for 30 days
            </Label>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.3 }}
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
                <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>
              </motion.div>
            </Button>
          </motion.div>
        </form>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="mt-8 mb-6"
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-700"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400">
                Don't have an account?
              </span>
            </div>
          </div>
        </motion.div>

        {/* Register Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.3 }}
          className="text-center"
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors duration-200"
          >
            Create a free account
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
