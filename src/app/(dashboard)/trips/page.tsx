import { TripList } from '@/components/trips/TripList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Trips | WanderPlan',
  description: 'View and manage your travel plans',
};

/**
 * Trips page - displays list of user's trips with filtering and search
 */
export default function TripsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <TripList />
    </div>
  );
}
