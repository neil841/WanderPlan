'use client';

/**
 * Global Error Boundary
 *
 * Catches unhandled errors in the application and displays a friendly error page.
 * Features:
 * - Error recovery with "Try again" button
 * - Navigation back to safety
 * - Error details in development mode
 * - Consistent WanderPlan design
 * - Responsive layout
 *
 * Note: This must be a client component in Next.js App Router
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-red-100 p-6">
            <AlertTriangle
              className="h-16 w-16 text-red-600"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="mb-2 text-6xl font-bold text-slate-900">500</h1>

        {/* Error Message */}
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">
          Something Went Wrong
        </h2>

        <p className="mb-8 text-lg text-slate-600">
          We encountered an unexpected error while processing your request.
          Don't worry, our team has been notified and we're working on it!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button onClick={reset} size="lg" className="gap-2">
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
            Try Again
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/trips">
              <Home className="h-5 w-5" aria-hidden="true" />
              Go to Dashboard
            </Link>
          </Button>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-12 rounded-lg bg-red-50 p-6 text-left shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-red-900">
              Error Details (Development Only):
            </h3>
            <div className="overflow-auto rounded bg-red-100 p-4">
              <p className="mb-2 text-sm font-medium text-red-900">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-700">Digest: {error.digest}</p>
              )}
              {error.stack && (
                <pre className="mt-3 whitespace-pre-wrap text-xs text-red-800">
                  {error.stack}
                </pre>
              )}
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-12 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            What can you do?
          </h3>
          <ul className="space-y-2 text-left text-sm text-slate-600">
            <li>• Try refreshing the page or clicking "Try Again"</li>
            <li>• Go back to your dashboard and try a different action</li>
            <li>
              • If the problem persists, please contact our support team
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
