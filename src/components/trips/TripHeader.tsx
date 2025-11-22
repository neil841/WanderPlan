'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Edit,
  Share2,
  Archive,
  MoreVertical,
  Calendar,
  MapPin,
  ArrowLeft,
  Trash2,
  Copy,
  Eye,
  FileDown,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TripDetails } from '@/hooks/useTrip';
import { format } from 'date-fns';
import { EditTripDialog } from './EditTripDialog';
import { ExportPDFDialog } from './ExportPDFDialog';
import { useInvalidateTrip } from '@/hooks/useTrip';

interface TripHeaderProps {
  trip: TripDetails;
}

/**
 * TripHeader Component
 *
 * Displays trip title, metadata, cover image, and action buttons
 * Includes edit, share, archive, and delete actions based on user permissions
 *
 * Features:
 * - Premium gradient header design
 * - Responsive layout (mobile-first)
 * - Permission-based action buttons
 * - Smooth animations
 * - WCAG 2.1 AA compliant
 *
 * @component
 */
export function TripHeader({ trip }: TripHeaderProps) {
  const router = useRouter();
  const invalidateTrip = useInvalidateTrip();
  const [isArchiving, setIsArchiving] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const canEdit = trip.userRole === 'owner' || trip.userRole === 'ADMIN';
  const canDelete = trip.userRole === 'owner';

  const formatDateRange = () => {
    if (!trip.startDate) return null;

    const start = new Date(trip.startDate);
    const end = trip.endDate ? new Date(trip.endDate) : null;

    if (!end || start.getTime() === end.getTime()) {
      return format(start, 'MMM d, yyyy');
    }

    // Same month
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${format(start, 'MMM d')} - ${format(end, 'd, yyyy')}`;
    }

    // Different months
    return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
  };

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      const response = await fetch(`/api/trips/${trip.id}/archive`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to archive trip');
      }

      // Invalidate trip cache to refresh data
      invalidateTrip(trip.id);

      // Show success message
      alert(data.message || 'Trip archived successfully');

      // Redirect to trips list
      router.push('/trips');
    } catch (error) {
      console.error('Failed to archive trip:', error);
      alert(error instanceof Error ? error.message : 'Failed to archive trip');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/trips/${trip.id}/duplicate`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to duplicate trip');
      }

      // Show success message
      alert('Trip duplicated successfully!');

      // Redirect to the new duplicated trip
      if (data.data?.id) {
        router.push(`/trips/${data.data.id}`);
      } else {
        router.push('/trips');
      }
    } catch (error) {
      console.error('Failed to duplicate trip:', error);
      alert(error instanceof Error ? error.message : 'Failed to duplicate trip');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/trips/${trip.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to delete trip');
      }

      // Show success message
      alert('Trip deleted successfully');

      // Redirect to trips list
      router.push('/trips');
    } catch (error) {
      console.error('Failed to delete trip:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete trip');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative w-full"
    >
      {/* Cover Image or Gradient Background */}
      <div className="relative h-48 md:h-64 lg:h-80 w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
        {trip.coverImageUrl ? (
          <img
            src={trip.coverImageUrl}
            alt={trip.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 opacity-90" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Back Button */}
        <Link
          href="/trips"
          className="absolute top-4 left-4 md:top-6 md:left-6"
        >
          <Button
            variant="secondary"
            size="sm"
            className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Back to Trips</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2">
          {/* View Mode Badge */}
          {trip.visibility === 'PUBLIC' && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              <Eye className="w-3 h-3 mr-1" />
              Public
            </Badge>
          )}

          {trip.visibility === 'SHARED' && (
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              <Share2 className="w-3 h-3 mr-1" />
              Shared
            </Badge>
          )}

          {/* Primary Actions (Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
              onClick={() => router.push(`/trips/${trip.id}/share`)}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>

            {canEdit && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>

          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {/* Mobile: Show primary actions */}
              <div className="md:hidden">
                <DropdownMenuItem onClick={() => router.push(`/trips/${trip.id}/share`)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Trip
                </DropdownMenuItem>

                {canEdit && (
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Trip
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
              </div>

              {/* Additional Actions */}
              <DropdownMenuItem onClick={() => setIsExportDialogOpen(true)}>
                <FileDown className="w-4 h-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>

              <DropdownMenuItem onClick={handleDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate Trip
              </DropdownMenuItem>

              {canEdit && (
                <DropdownMenuItem onClick={handleArchive} disabled={isArchiving}>
                  <Archive className="w-4 h-4 mr-2" />
                  {trip.isArchived ? 'Unarchive' : 'Archive'} Trip
                </DropdownMenuItem>
              )}

              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Trip
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Trip Title & Metadata */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-3"
          >
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg">
              {trip.name}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-white/90 text-sm md:text-base">
              {/* Destinations */}
              {trip.destinations.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">
                    {trip.destinations.slice(0, 2).join(', ')}
                    {trip.destinations.length > 2 && ` +${trip.destinations.length - 2}`}
                  </span>
                </div>
              )}

              {/* Dates */}
              {formatDateRange() && (
                <>
                  <span className="text-white/50">•</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">{formatDateRange()}</span>
                  </div>
                </>
              )}

              {/* Creator */}
              {trip.userRole !== 'owner' && (
                <>
                  <span className="text-white/50">•</span>
                  <span className="text-sm">
                    by <span className="font-medium">{trip.creator.name}</span>
                  </span>
                </>
              )}
            </div>

            {/* Tags */}
            {trip.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {trip.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/20"
                    style={tag.color ? { backgroundColor: tag.color + '40' } : undefined}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edit Trip Dialog */}
      <EditTripDialog
        trip={trip}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={() => {
          // Refresh trip data after successful update
          invalidateTrip(trip.id);
        }}
      />

      {/* Export PDF Dialog */}
      <ExportPDFDialog
        tripId={trip.id}
        tripName={trip.name}
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
      />
    </motion.div>
  );
}
