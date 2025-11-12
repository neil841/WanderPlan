import { TripCreateForm } from '@/components/trips/TripCreateForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Trip | WanderPlan',
  description: 'Plan your next adventure',
};

/**
 * Trip creation page
 * Allows users to create a new trip with all necessary details
 */
export default function NewTripPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <TripCreateForm />
    </div>
  );
}
