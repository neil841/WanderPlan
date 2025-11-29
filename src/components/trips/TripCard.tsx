'use client';

import { motion } from 'framer-motion';
import { CSSProperties } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, ListChecks, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Trip } from '@/hooks/useTrips';
import { format, differenceInDays } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  viewMode?: 'grid' | 'list';
  index?: number;
}

/**
 * Premium TripCard Component
 *
 * Features:
 * - Gradient header with destination
 * - Hover lift animation
 * - Progress bar for planning status
 * - Countdown badge
 * - Premium shadows and borders
 * - Smooth entrance animations
 */
export function TripCard({ trip, viewMode = 'grid', index = 0 }: TripCardProps) {
  const startDate = trip.startDate ? new Date(trip.startDate) : null;
  const endDate = trip.endDate ? new Date(trip.endDate) : null;

  const dateRange = startDate && endDate
    ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
    : startDate
      ? format(startDate, 'MMM d, yyyy')
      : 'Dates not set';

  const destination = trip.destinations.length > 0
    ? trip.destinations[0]
    : null;

  const additionalDestinations = trip.destinations.length > 1
    ? trip.destinations.length - 1
    : 0;

  // Better messaging for trips without destination
  const isDestinationSet = trip.destinations.length > 0;

  // Calculate days until trip
  const daysUntil = startDate ? differenceInDays(startDate, new Date()) : null;
  const countdownText = daysUntil !== null
    ? daysUntil > 0
      ? `${daysUntil} days away`
      : daysUntil === 0
        ? 'Today!'
        : 'Past trip'
    : null;

  // Calculate planning progress (mock - replace with real data)
  const planningProgress = trip.eventCount > 0 ? Math.min((trip.eventCount / 10) * 100, 100) : 0;

  // Gradient variations for different cards
  const gradients = [
    { from: '#3b82f6', to: '#06b6d4' }, // from-blue-500 to-cyan-500
    { from: '#a855f7', to: '#ec4899' }, // from-purple-500 to-pink-500
    { from: '#f97316', to: '#ef4444' }, // from-orange-500 to-red-500
    { from: '#22c55e', to: '#10b981' }, // from-green-500 to-emerald-500
  ];
  const gradient = gradients[index % gradients.length];

  const isListView = viewMode === 'list';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.5,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      <Link href={`/trips/${trip.id}`} className="block group">
        <div className={`relative h-full overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-lg shadow-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-900/10 ${isListView ? 'flex flex-col md:flex-row' : ''
          }`}>
          {/* Gradient Header with Enhanced Visual Depth */}
          <div
            className={`relative overflow-hidden bg-gradient-to-br from-[--gradient-from] to-[--gradient-to] ${isListView
              ? 'h-48 md:h-auto md:w-80 flex-shrink-0'
              : 'h-40'
              }`}
            style={{
              '--gradient-from': gradient.from,
              '--gradient-to': gradient.to,
            } as CSSProperties}
          >
            {/* Animated Gradient Orbs for Depth */}
            <div className="absolute inset-0">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            </div>

            {/* Enhanced Background Pattern Overlay */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />

            {/* Destination Icon Watermark */}
            <div className="absolute right-4 bottom-4 opacity-10">
              <MapPin className="h-24 w-24 text-white" />
            </div>

            {/* Cover Image (if exists) */}
            {trip.coverImageUrl && (
              <img
                src={trip.coverImageUrl}
                alt={trip.name}
                className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-overlay group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            )}

            {/* Content */}
            <div className="relative z-10 flex h-full flex-col justify-between p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {isDestinationSet ? (
                    // Has destination - show destination name
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white line-clamp-1 drop-shadow-lg">
                          {destination}
                        </h3>
                        {additionalDestinations > 0 && (
                          <span className="text-xs font-medium text-white/80 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                            +{additionalDestinations}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-sm text-white/90">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{dateRange}</span>
                      </div>
                    </>
                  ) : (
                    // No destination - show inspiring call-to-action
                    <>
                      <div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                        <MapPin className="h-4 w-4 text-white" />
                        <span className="text-sm font-semibold text-white">Ready to Plan</span>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-white drop-shadow-lg">
                        Where will you go?
                      </h3>
                      <p className="text-sm text-white/90">
                        Add destinations to start planning your adventure
                      </p>
                    </>
                  )}
                </div>

                {/* Countdown Badge */}
                {countdownText && isDestinationSet && (
                  <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{countdownText}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Archived Badge */}
              {trip.isArchived && (
                <Badge variant="secondary" className="self-start bg-gray-900/80 text-white">
                  Archived
                </Badge>
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className={`flex-1 ${isListView ? 'flex flex-col' : ''}`}>
            <div className="p-6 space-y-4">
              {/* Trip Name & Description */}
              <div>
                <h4 className="mb-1 text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {trip.name}
                </h4>
                {trip.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {trip.description}
                  </p>
                )}
              </div>

              {/* Tags */}
              {trip.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {trip.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="text-xs"
                      style={tag.color ? { borderColor: tag.color, color: tag.color } : undefined}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                  {trip.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{trip.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Collaborators */}
                {trip.collaboratorCount > 0 && (
                  <div>
                    <div className="mb-1 text-xs text-gray-500">Collaborators</div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {trip.collaboratorCount}
                      </span>
                    </div>
                  </div>
                )}

                {/* Events */}
                {trip.eventCount > 0 && (
                  <div>
                    <div className="mb-1 text-xs text-gray-500">Events</div>
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {trip.eventCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Planning Progress */}
              {trip.eventCount > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="text-gray-500">Planning Progress</span>
                    <span className="font-medium text-gray-900">{Math.round(planningProgress)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${planningProgress}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                      className={`h-full rounded-full bg-gradient-to-r from-[--gradient-from] to-[--gradient-to]`}
                      style={{
                        '--gradient-from': gradient.from,
                        '--gradient-to': gradient.to,
                      } as CSSProperties}
                    />
                  </div>
                </div>
              )}

              {/* Creator Info */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={trip.creator.image || undefined} alt={trip.creator.name || 'User'} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    {trip.creator.name
                      ? trip.creator.name.substring(0, 2).toUpperCase()
                      : trip.creator.email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-500 truncate">
                  {trip.creator.name || trip.creator.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/**
 * Premium Skeleton Loader for TripCard
 */
export function TripCardSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  const isListView = viewMode === 'list';

  return (
    <div className={`h-full overflow-hidden rounded-2xl border border-gray-200/50 bg-white shadow-lg ${isListView ? 'flex flex-col md:flex-row' : ''
      }`}>
      {/* Header Skeleton */}
      <div className={`animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 ${isListView
        ? 'h-48 md:h-auto md:w-80 flex-shrink-0'
        : 'h-40'
        }`} />

      <div className={`flex-1 p-6 space-y-4 ${isListView ? 'flex flex-col' : ''}`}>
        {/* Title Skeleton */}
        <div>
          <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
        </div>

        {/* Tags Skeleton */}
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-5 w-20 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
          <div className="h-12 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Progress Skeleton */}
        <div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3 mb-2" />
          <div className="h-2 bg-gray-200 rounded-full animate-pulse" />
        </div>

        {/* Creator Skeleton */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <div className="h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
        </div>
      </div>
    </div>
  );
}
