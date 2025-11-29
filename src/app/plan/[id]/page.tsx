'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { Header } from '@/components/layout/Header';
import { TripBuilderLayout } from '@/components/plan/TripBuilderLayout';
import { OverviewTab } from '@/components/plan/OverviewTab';
import { ItineraryTab } from '@/components/plan/ItineraryTab';
import { BudgetTab } from '@/components/plan/BudgetTab';
import { CalendarTab } from '@/components/plan/CalendarTab';
import { MapTab } from '@/components/plan/MapTab';
import { MessagesTab } from '@/components/plan/MessagesTab';
import { IdeasTab } from '@/components/plan/IdeasTab';
import { PollsTab } from '@/components/plan/PollsTab';
import { CollaboratorsTab } from '@/components/plan/CollaboratorsTab';
import { ActivityTab } from '@/components/plan/ActivityTab';

interface TripBuilderPageProps {
  params: {
    id: string;
  };
}

/**
 * Trip Builder Page
 *
 * Universal trip planning interface for both guest and authenticated users.
 * Includes ALL 11 features: 6 FREE + 5 GATED with premium tab UI.
 *
 * FREE Features:
 * - Overview: Trip statistics and analytics
 * - Itinerary: Day-by-day event planning
 * - Budget: Expense tracking with categories
 * - Calendar: Calendar view of events
 * - Map: Interactive location visualization
 * - Weather: Weather forecasts (in Overview)
 *
 * GATED Features (Require Account):
 * - Messages: Real-time chat
 * - Ideas: Suggestions with voting
 * - Polls: Group decision-making
 * - Collaborators: Team management
 * - Activity: Activity feed tracking
 *
 * Features:
 * - Premium responsive tab navigation (11 tabs)
 * - Mobile dropdown menu for tab overflow
 * - Lock icons on gated features (for guest users)
 * - Smooth animations and transitions
 * - Contextual signup prompts (for guest users)
 * - Auto-save to localStorage (guest) or database (authenticated)
 */
export default function TripBuilderPage({ params }: TripBuilderPageProps) {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  // Only render after hydration to avoid SSR mismatch with SessionProvider
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing during SSR to prevent useSession errors
  if (!mounted) {
    return null;
  }

  // IMPORTANT: Determine if this is a guest trip or authenticated trip
  const isGuestTrip = params.id.startsWith('guest-');

  // Only show authenticated header if:
  // 1. User has active session AND
  // 2. Trip is NOT a guest trip (i.e., it's a database trip)
  const isAuthenticated = status === 'authenticated' && !isGuestTrip;

  // Prepare user data for authenticated header
  const user = session?.user ? {
    id: session.user.id || '',
    name: session.user.name || `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim() || 'User',
    email: session.user.email || '',
    image: session.user.avatarUrl || session.user.image || null,
  } : undefined;

  return (
    <>
      {isAuthenticated && user ? (
        <Header user={user} />
      ) : (
        <PublicHeader />
      )}
      <TripBuilderLayout tripId={params.id}>
        {/* FREE TABS */}
        <OverviewTab tripId={params.id} isAuthenticated={isAuthenticated} />
        <ItineraryTab tripId={params.id} isAuthenticated={isAuthenticated} />
        <BudgetTab tripId={params.id} />
        <CalendarTab tripId={params.id} />
        <MapTab tripId={params.id} />

        {/* GATED TABS */}
        <MessagesTab tripId={params.id} />
        <IdeasTab tripId={params.id} />
        <PollsTab tripId={params.id} />
        <CollaboratorsTab tripId={params.id} />
        <ActivityTab tripId={params.id} />
      </TripBuilderLayout>
    </>
  );
}
