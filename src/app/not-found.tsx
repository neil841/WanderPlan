/**
 * 404 Not Found Page
 *
 * Custom error page for when a page is not found.
 * Features:
 * - Friendly error message
 * - Helpful navigation suggestions
 * - Link back to dashboard/home
 * - Consistent WanderPlan design
 * - Responsive layout
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPinOff, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-blue-100 p-6">
            <MapPinOff className="h-16 w-16 text-blue-600" aria-hidden="true" />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="mb-2 text-6xl font-bold text-slate-900">404</h1>

        {/* Error Message */}
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">
          Page Not Found
        </h2>

        <p className="mb-8 text-lg text-slate-600">
          Oops! Looks like you've ventured off the map. The page you're looking
          for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/trips">
              <Home className="h-5 w-5" aria-hidden="true" />
              Go to Dashboard
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Helpful Suggestions */}
        <div className="mt-12 rounded-lg bg-white p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">
            Try these instead:
          </h3>
          <ul className="space-y-2 text-left text-sm text-slate-600">
            <li>
              <Link
                href="/trips"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                View your trips
              </Link>
            </li>
            <li>
              <Link
                href="/settings/profile"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Update your profile
              </Link>
            </li>
            <li>
              <Link
                href="/crm/clients"
                className="text-blue-600 hover:text-blue-700 hover:underline"
              >
                Manage your clients
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
