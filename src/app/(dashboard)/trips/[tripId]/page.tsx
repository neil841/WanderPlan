'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrip } from '@/hooks/useTrip';
import { TripHeader } from '@/components/trips/TripHeader';
import { TripTabs, TripTab } from '@/components/trips/TripTabs';
import { TripOverview } from '@/components/trips/TripOverview';
import { ItineraryBuilder } from '@/components/itinerary/ItineraryBuilder';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { MessageList } from '@/components/messages/MessageList';
import { IdeaList } from '@/components/ideas/IdeaList';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AlertCircle,
  Loader2,
  Construction,
  Package,
} from 'lucide-react';
import Link from 'next/link';

/**
 * Trip Details Page (OLD - DEPRECATED)
 *
 * This page now redirects to the new universal trip builder at /plan/[id]
 * The new interface supports both guest and authenticated users with a unified experience.
 *
 * @deprecated Use /plan/[id] instead
 * @page
 */
export default function TripDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.tripId as string;

  // Redirect to new universal interface
  useEffect(() => {
    if (tripId) {
      router.replace(`/plan/${tripId}`);
    }
  }, [tripId, router]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mx-auto" />
        <p className="text-sm text-muted-foreground">Redirecting to trip builder...</p>
      </div>
    </div>
  );
}
