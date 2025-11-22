/**
 * 403 Unauthorized/Forbidden Page
 *
 * Displayed when a user tries to access a resource they don't have permission for.
 * Features:
 * - Clear explanation of the issue
 * - Navigation back to safe areas
 * - Helpful suggestions
 * - Consistent WanderPlan design
 * - Responsive layout
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-amber-100 p-6">
            <ShieldAlert
              className="h-16 w-16 text-amber-600"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Error Code */}
        <h1 className="mb-2 text-6xl font-bold text-slate-900">403</h1>

        {/* Error Message */}
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">
          Access Denied
        </h2>

        <p className="mb-8 text-lg text-slate-600">
          You don't have permission to access this resource. This could be
          because:
        </p>

        {/* Reasons */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
          <ul className="space-y-2 text-left text-sm text-slate-600">
            <li>• You're not the owner or an admin of this trip</li>
            <li>• Your collaboration role doesn't include this permission</li>
            <li>• The resource is private or has been deleted</li>
            <li>• You need to log in or your session has expired</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg" className="gap-2">
            <Link href="/trips">
              <Home className="h-5 w-5" aria-hidden="true" />
              Go to Dashboard
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <button type="button" onClick={() => window.history.back()}>
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              Go Back
            </button>
          </Button>
        </div>

        {/* Helpful Suggestions */}
        <div className="mt-12 rounded-lg bg-blue-50 p-6 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-blue-900">
            Need access?
          </h3>
          <p className="text-sm text-blue-800">
            If you believe you should have access to this resource, please
            contact the trip owner or an administrator. They can adjust your
            collaboration permissions or send you a new invitation.
          </p>
        </div>
      </div>
    </div>
  );
}
