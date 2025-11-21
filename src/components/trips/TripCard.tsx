'use client';

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, MapPin, Users, ListChecks } from 'lucide-react';
import Link from 'next/link';
import { Trip } from '@/hooks/useTrips';
import { format } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  viewMode?: 'grid' | 'list';
}

/**
 * TripCard component displays a single trip with key information
 * Supports both grid and list view modes
 */
export function TripCard({ trip, viewMode = 'grid' }: TripCardProps) {
  const startDate = trip.startDate ? new Date(trip.startDate) : null;
  const endDate = trip.endDate ? new Date(trip.endDate) : null;

  const dateRange = startDate && endDate
    ? `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`
    : startDate
    ? format(startDate, 'MMM d, yyyy')
    : 'Dates not set';

  const destination = trip.destinations.length > 0
    ? trip.destinations[0]
    : 'No destination set';

  const additionalDestinations = trip.destinations.length > 1
    ? trip.destinations.length - 1
    : 0;

  const isListView = viewMode === 'list';

  return (
    <Link href={`/trips/${trip.id}`} className="block group">
      <Card className={`h-full transition-all hover:shadow-lg hover:border-primary/50 ${
        isListView ? 'flex flex-col md:flex-row' : ''
      }`}>
        {/* Cover Image */}
        <div className={`relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 ${
          isListView
            ? 'h-48 md:h-auto md:w-64 flex-shrink-0'
            : 'h-48'
        }`}>
          {trip.coverImageUrl ? (
            <img
              src={trip.coverImageUrl}
              alt={trip.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-16 h-16 text-primary/30" />
            </div>
          )}

          {/* Archived Badge */}
          {trip.isArchived && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-neutral-900/80 text-white">
                Archived
              </Badge>
            </div>
          )}
        </div>

        <div className={`flex-1 ${isListView ? 'flex flex-col' : ''}`}>
          {/* Header */}
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors truncate">
                  {trip.name}
                </h3>
                {trip.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {trip.description}
                  </p>
                )}
              </div>
            </div>

            {/* Tags */}
            {trip.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
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
          </CardHeader>

          {/* Content */}
          <CardContent className={`space-y-2 text-sm ${isListView ? 'flex-1' : ''}`}>
            {/* Destination */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {destination}
                {additionalDestinations > 0 && (
                  <span className="ml-1 text-xs">+{additionalDestinations} more</span>
                )}
              </span>
            </div>

            {/* Date Range */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{dateRange}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-muted-foreground">
              {trip.collaboratorCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{trip.collaboratorCount}</span>
                </div>
              )}
              {trip.eventCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4" />
                  <span>{trip.eventCount}</span>
                </div>
              )}
            </div>
          </CardContent>

          {/* Footer - Creator Info */}
          <CardFooter className="pt-3 border-t">
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={trip.creator.image || undefined} alt={trip.creator.name || 'User'} />
                <AvatarFallback className="text-xs">
                  {trip.creator.name
                    ? trip.creator.name.substring(0, 2).toUpperCase()
                    : trip.creator.email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">
                Created by {trip.creator.name || trip.creator.email}
              </span>
            </div>
          </CardFooter>
        </div>
      </Card>
    </Link>
  );
}

/**
 * Skeleton loader for TripCard
 */
export function TripCardSkeleton({ viewMode = 'grid' }: { viewMode?: 'grid' | 'list' }) {
  const isListView = viewMode === 'list';

  return (
    <Card className={`h-full ${isListView ? 'flex flex-col md:flex-row' : ''}`}>
      {/* Cover Image Skeleton */}
      <div className={`bg-neutral-200 dark:bg-neutral-800 animate-pulse ${
        isListView
          ? 'h-48 md:h-auto md:w-64 flex-shrink-0'
          : 'h-48'
      }`} />

      <div className={`flex-1 ${isListView ? 'flex flex-col' : ''}`}>
        <CardHeader className="pb-3">
          <div className="space-y-2">
            <div className="h-6 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-full" />
          </div>
          <div className="flex gap-1 mt-2">
            <div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />
            <div className="h-5 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-2/3" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/2" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-1/3" />
        </CardContent>

        <CardFooter className="pt-3 border-t">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
            <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse w-32" />
          </div>
        </CardFooter>
      </div>
    </Card>
  );
}
