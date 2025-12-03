import { PublicHeader } from '@/components/layout/PublicHeader';
import { GuestTripList } from '@/components/guest/GuestTripList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Your Trips | WanderPlan',
  description: 'View and manage your trips',
};

/**
 * Guest Trip List Page
 *
 * Shows all trips created by guest users (stored in localStorage).
 * Encourages signup when users have 2+ trips.
 */
export default function PlanPage() {
  return (
    <>
      <PublicHeader />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <GuestTripList />
      </div>
    </>
  );
}
