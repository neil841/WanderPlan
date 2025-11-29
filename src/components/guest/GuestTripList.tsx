'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Plus, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getGuestTrips, type GuestTrip } from '@/lib/guest-mode';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * GuestTripList Component
 *
 * Displays all guest trips stored in localStorage.
 * Shows save prompt if user has multiple trips.
 *
 * @component
 */
export function GuestTripList() {
  const router = useRouter();
  const [trips, setTrips] = useState<GuestTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load trips from localStorage
    const loadedTrips = getGuestTrips();
    setTrips(loadedTrips);
    setIsLoading(false);
  }, []);

  const handleTripClick = (tripId: string) => {
    router.push(`/plan/${tripId}`);
  };

  const handleCreateNew = () => {
    router.push('/plan/new');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your trips...</p>
        </div>
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon={MapPin}
          title="No trips yet"
          description="Start planning your first adventure! Create a trip to get started."
          action={{
            label: 'Create Your First Trip',
            onClick: handleCreateNew,
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      {/* Header with Save Prompt */}
      {trips.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Alert className="border-blue-200 bg-blue-50">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              <strong>You have {trips.length} trips!</strong> Create a free account to save them
              permanently and collaborate with others.{' '}
              <button
                onClick={() => router.push('/register?reason=feature_limit')}
                className="font-semibold underline hover:no-underline"
              >
                Sign up now
              </button>
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Trips</h1>
          <p className="text-gray-600 mt-1">
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved locally
          </p>
        </div>
        <Button
          onClick={handleCreateNew}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Trip
        </Button>
      </div>

      {/* Trip Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map((trip, index) => (
          <motion.div
            key={trip.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card
              className="cursor-pointer hover:shadow-xl transition-all duration-200 hover:-translate-y-1 h-full"
              onClick={() => handleTripClick(trip.id)}
            >
              {/* Card Header with Gradient */}
              <div className="h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-t-lg relative overflow-hidden">
                {/* Pattern Overlay */}
                <div className="absolute inset-0 opacity-20">
                  <div
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '60px 60px',
                    }}
                    className="absolute inset-0"
                  />
                </div>

                {/* Destinations Badge */}
                {trip.destinations.length > 0 && (
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex flex-wrap gap-1">
                      {trip.destinations.slice(0, 2).map((dest) => (
                        <Badge
                          key={dest}
                          variant="secondary"
                          className="bg-white/90 text-blue-900 text-xs backdrop-blur-sm"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {dest}
                        </Badge>
                      ))}
                      {trip.destinations.length > 2 && (
                        <Badge variant="secondary" className="bg-white/90 text-blue-900 text-xs">
                          +{trip.destinations.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-2">{trip.name}</CardTitle>
                {trip.description && (
                  <CardDescription className="line-clamp-2">{trip.description}</CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Dates */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {format(new Date(trip.startDate), 'MMM d')} -{' '}
                    {format(new Date(trip.endDate), 'MMM d, yyyy')}
                  </span>
                </div>

                {/* Tags */}
                {trip.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {trip.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {trip.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{trip.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Created date */}
                <p className="text-xs text-gray-500">
                  Created {format(new Date(trip.createdAt), 'MMM d, yyyy')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Save CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 text-white shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 mb-4 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Free Forever Plan</span>
            </div>

            <h3 className="text-2xl font-bold mb-3">Save Your Trips Forever</h3>
            <p className="text-blue-50 mb-6 max-w-2xl mx-auto">
              Create a free account to save your trips permanently, access them from any device, and
              collaborate with friends.
            </p>

            <Button
              size="lg"
              variant="secondary"
              onClick={() => router.push('/register')}
              className="bg-white text-blue-600 hover:bg-white/90"
            >
              Create Free Account
            </Button>

            <p className="mt-4 text-sm text-blue-100">
              ✓ No credit card required • ✓ Free forever • ✓ 30 seconds to sign up
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
