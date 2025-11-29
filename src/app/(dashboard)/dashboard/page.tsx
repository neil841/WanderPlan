'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Dashboard Page - Redirects to My Trips
 * 
 * Consolidated view: Dashboard and My Trips show the same content,
 * so we redirect to /trips for a single source of truth.
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/trips');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        <p className="mt-4 text-sm text-gray-600">Loading your trips...</p>
      </div>
    </div>
  );
}
