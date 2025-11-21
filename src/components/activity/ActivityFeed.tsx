/**
 * ActivityFeed Component
 *
 * Displays a list of activities with infinite scroll
 */

'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { ActivityFeedItem } from './ActivityFeedItem';
import { Button } from '@/components/ui/button';
import { Loader2, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityWithUser } from '@/types/activity';

interface ActivityFeedProps {
  activities: ActivityWithUser[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  className?: string;
}

export function ActivityFeed({
  activities,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onLoadMore,
  className,
}: ActivityFeedProps) {
  const { ref: loadMoreRef, inView } = useInView();

  // Load more when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      onLoadMore?.();
    }
  }, [inView, hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
        <div className="p-4 rounded-full bg-muted">
          <Activity className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-medium text-muted-foreground">No activity yet</p>
          <p className="text-sm text-muted-foreground">
            Trip activity will appear here as you collaborate
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {/* Activity List */}
      <div className="divide-y divide-border">
        {activities.map((activity) => (
          <ActivityFeedItem key={activity.id} activity={activity} />
        ))}
      </div>

      {/* Load More */}
      {hasNextPage && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              className="w-full"
            >
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
