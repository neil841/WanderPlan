'use client';

import { SessionProvider } from 'next-auth/react';
import { PublicHeader } from '@/components/layout/PublicHeader';
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
 * Full-featured trip planning interface for guest users.
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
 * - Lock icons on gated features
 * - Smooth animations and transitions
 * - Contextual signup prompts
 * - Auto-save to localStorage
 */
export default function TripBuilderPage({ params }: TripBuilderPageProps) {
  return (
    <SessionProvider>
      <PublicHeader />
      <TripBuilderLayout tripId={params.id}>
        {/* FREE TABS */}
        <OverviewTab tripId={params.id} />
        <ItineraryTab tripId={params.id} />
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
    </SessionProvider>
  );
}
