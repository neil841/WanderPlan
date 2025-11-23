'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
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
 * Trip Details Page
 *
 * Main trip details page with header, tabs, and content sections
 * Currently implements the Overview tab, with placeholders for other tabs
 *
 * Features:
 * - Dynamic trip data loading
 * - Tab navigation
 * - Loading states
 * - Error handling
 * - 404 handling
 * - Responsive design
 * - Premium animations
 * - WCAG 2.1 AA compliant
 *
 * @page
 */
export default function TripDetailsPage() {
  const params = useParams();
  const tripId = params?.tripId as string;

  const [activeTab, setActiveTab] = useState<TripTab>('overview');

  const {
    data: trip,
    isLoading,
    isError,
    error,
  } = useTrip({ tripId });

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <div className="relative h-48 md:h-64 lg:h-80 w-full bg-gradient-to-br from-primary/20 to-primary/10 animate-pulse rounded-t-xl" />

        {/* Tabs Skeleton */}
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-4 py-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24" />
              ))}
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    const is404 = errorMessage.includes("not found") || errorMessage.includes("404");
    const is403 = errorMessage.includes("Forbidden") || errorMessage.includes("403");

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full"
        >
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  {is404 ? (
                    <Package className="w-8 h-8 text-destructive" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  )}
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">
                    {is404 ? "Trip Not Found" : is403 ? "Access Denied" : "Error Loading Trip"}
                  </h2>
                  <p className="text-muted-foreground">
                    {is404
                      ? "The trip you are looking for does not exist or has been deleted."
                      : is403
                      ? "You do not have permission to view this trip."
                      : errorMessage}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Link href="/trips">
                    <Button variant="outline">Back to Trips</Button>
                  </Link>
                  {!is404 && !is403 && (
                    <Button onClick={() => window.location.reload()}>
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // No data (shouldn't happen if no error, but defensive)
  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Render Tab Content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <TripOverview trip={trip} />
            </motion.div>
          </AnimatePresence>
        );

      case 'itinerary':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="itinerary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ItineraryBuilder trip={trip} />
            </motion.div>
          </AnimatePresence>
        );

      case 'budget':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="budget"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <BudgetOverview trip={trip} />
            </motion.div>
          </AnimatePresence>
        );

      case 'messages':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="messages"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <MessageList tripId={trip.id} />
            </motion.div>
          </AnimatePresence>
        );

      case 'ideas':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key="ideas"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <IdeaList tripId={trip.id} />
            </motion.div>
          </AnimatePresence>
        );

      case 'calendar':
      case 'map':
      case 'documents':
      case 'collaborators':
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-dashed">
                <CardContent className="py-12">
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Construction className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold capitalize">
                        {activeTab} Coming Soon
                      </h3>
                      <p className="text-sm text-muted-foreground max-w-md">
                        This feature is under development and will be available in a future update.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Trip Header */}
      <TripHeader trip={trip} />

      {/* Tab Navigation */}
      <TripTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        eventCount={trip.stats.eventCount}
        documentCount={trip.stats.documentCount}
        collaboratorCount={trip.stats.collaboratorCount}
      />

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
}
