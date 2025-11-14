/**
 * Trip Activity Feed Page
 *
 * Displays chronological activity log for the trip
 */

'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useInfiniteActivities } from '@/hooks/useActivities';
import { useRealtimeActivity } from '@/hooks/useRealtime';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Activity, Filter } from 'lucide-react';
import { ActivityActionType } from '@prisma/client';
import type { ActivityWithUser, GetActivitiesResponse } from '@/types/activity';

const activityTypeLabels: Record<ActivityActionType, string> = {
  TRIP_UPDATED: 'Trip Updates',
  EVENT_CREATED: 'Events Created',
  EVENT_UPDATED: 'Events Updated',
  EVENT_DELETED: 'Events Deleted',
  COLLABORATOR_ADDED: 'Collaborators Added',
  COLLABORATOR_REMOVED: 'Collaborators Removed',
  EXPENSE_ADDED: 'Expenses Added',
  MESSAGE_POSTED: 'Messages Posted',
};

export default function ActivityPage() {
  const params = useParams();
  const tripId = params.tripId as string;
  const queryClient = useQueryClient();
  const [filterType, setFilterType] = useState<ActivityActionType | undefined>(
    undefined
  );

  // Fetch activities with infinite scroll
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteActivities(tripId, {
    actionType: filterType,
    limit: 50,
  });

  // Handle real-time activity updates
  const handleNewActivity = useCallback(
    (newActivity: ActivityWithUser) => {
      // If filter is active and doesn't match, ignore
      if (filterType && newActivity.actionType !== filterType) {
        return;
      }

      // Update the query cache optimistically
      queryClient.setQueryData(
        ['activities', tripId, 'infinite', 50, filterType],
        (oldData: any) => {
          if (!oldData) return oldData;

          // Add new activity to the first page
          const newPages = [...oldData.pages];
          if (newPages[0]) {
            newPages[0] = {
              ...newPages[0],
              activities: [newActivity, ...newPages[0].activities],
              pagination: {
                ...newPages[0].pagination,
                total: newPages[0].pagination.total + 1,
              },
            };
          }

          return {
            ...oldData,
            pages: newPages,
          };
        }
      );
    },
    [queryClient, tripId, filterType]
  );

  // Subscribe to real-time activity updates
  useRealtimeActivity(tripId, handleNewActivity);

  // Flatten paginated activities
  const activities = data?.pages.flatMap((page) => page.activities) || [];
  const totalActivities = data?.pages[0]?.pagination.total || 0;

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Activity Feed</h1>
            <p className="text-muted-foreground">
              {totalActivities} {totalActivities === 1 ? 'activity' : 'activities'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={filterType || 'all'}
              onValueChange={(value) =>
                setFilterType(value === 'all' ? undefined : (value as ActivityActionType))
              }
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Activities</SelectItem>
                {Object.entries(activityTypeLabels).map(([type, label]) => (
                  <SelectItem key={type} value={type}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterType && (
              <button
                onClick={() => setFilterType(undefined)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardContent className="p-0">
          <ActivityFeed
            activities={activities}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            onLoadMore={() => fetchNextPage()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
