import { PublicHeader } from '@/components/layout/PublicHeader';
import { GuestTripBuilder } from '@/components/guest/GuestTripBuilder';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Start Planning | WanderPlan',
  description: 'Start planning your trip - no signup required',
};

/**
 * Guest Trip Creation Page
 *
 * Public route that allows users to create trips without authentication.
 * Trips are stored in localStorage and can be migrated on signup.
 *
 * Flow:
 * 1. User lands here from landing page "Start Planning Free" CTA
 * 2. Creates trip with GuestTripBuilder (saves to localStorage)
 * 3. Redirected to /plan/[id] to continue planning
 * 4. Smart signup prompts appear at strategic moments
 */
export default function PlanNewPage() {
  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <GuestTripBuilder />
      </div>
    </>
  );
}
