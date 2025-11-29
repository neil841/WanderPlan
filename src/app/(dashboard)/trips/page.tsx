'use client';

import { motion } from 'framer-motion';
import { TripList } from '@/components/trips/TripList';
import { useTrips } from '@/hooks/useTrips';
import { Plane, Plus, Map, Calendar, Users, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { differenceInDays } from 'date-fns';

/**
 * Premium My Trips Page - Enhanced
 *
 * Single source of truth for all user trips.
 * Features:
 * - Hero section with dynamic stats
 * - Real-time trip data
 * - Premium trip card grid
 * - Smooth entrance animations
 * - Performance optimized
 *
 * Route: /trips
 */
export default function TripsPage() {
  const { data: tripsData, isLoading } = useTrips({ status: 'active' });

  const trips = tripsData?.data?.trips || [];
  const totalTrips = tripsData?.data?.pagination?.total || 0;

  // Calculate upcoming trips
  const upcomingTrips = trips.filter(trip => {
    if (!trip.startDate) return false;
    return new Date(trip.startDate) > new Date();
  }).length;

  // Calculate days until next trip
  const nextTrip = trips
    .filter(trip => trip.startDate && new Date(trip.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())[0];

  const daysUntilNext = nextTrip?.startDate
    ? differenceInDays(new Date(nextTrip.startDate), new Date())
    : null;

  // Calculate total collaborators across all trips
  const totalCollaborators = trips.reduce((sum, trip) => sum + (trip.collaboratorCount || 0), 0);

  // Calculate total events across all trips
  const totalEvents = trips.reduce((sum, trip) => sum + (trip.eventCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Hero Section with Travel Motivation */}
      <div className="relative overflow-hidden rounded-3xl border border-gray-200/50 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 shadow-xl">
        {/* Static background pattern - PERFORMANCE OPTIMIZED */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Static gradient orbs for depth - PERFORMANCE OPTIMIZED */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="relative z-10 px-6 py-12 md:px-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Hero Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 backdrop-blur-sm"
            >
              <Plane className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white">Your Travel Dashboard</span>
            </motion.div>

            {/* Hero Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-4 text-4xl font-bold text-white md:text-5xl"
            >
              Your Adventures Await
            </motion.h1>

            {/* Hero Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mx-auto mb-8 max-w-2xl text-lg text-blue-50"
            >
              Plan, collaborate, and track all your trips in one place. Start your next journey today.
            </motion.p>

            {/* Hero CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Link href="/trips/new">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 shadow-lg transition-all duration-200 hover:shadow-2xl"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create New Trip</span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Quick Stats Cards - Dynamic Data */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {/* Total Trips */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2.5">
                  <Map className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalTrips}</p>
                  <p className="text-sm text-blue-100">Total Trips</p>
                </div>
              </div>
            </div>

            {/* Upcoming Trips */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2.5">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{upcomingTrips}</p>
                  <p className="text-sm text-blue-100">Upcoming</p>
                </div>
              </div>
            </div>

            {/* Days Until Next */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2.5">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {daysUntilNext !== null ? daysUntilNext : '—'}
                  </p>
                  <p className="text-sm text-blue-100">Days Until Next</p>
                </div>
              </div>
            </div>

            {/* Total Events */}
            <div className="rounded-xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/15">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2.5">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{totalEvents}</p>
                  <p className="text-sm text-blue-100">Events Planned</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trip List Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <TripList />
      </motion.div>
    </div>
  );
}
