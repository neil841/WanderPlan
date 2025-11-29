'use client';

import { Activity, Clock, User, Eye } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { GatedFeatureTab } from './GatedFeatureTab';
import { ActivityInterface } from './ActivityInterface';

interface ActivityTabProps {
  tripId: string;
}

/**
 * ActivityTab Component
 *
 * Gated feature tab for activity feed.
 * - Guest users: Shows preview and signup prompt
 * - Authenticated users: Shows actual activity feed
 *
 * @component
 */
export function ActivityTab({ tripId }: ActivityTabProps) {
  const { status } = useSession();
  const isGuestTrip = tripId.startsWith('guest-');
  const isAuthenticated = status === 'authenticated' && !isGuestTrip;
  const features = [
    {
      icon: <Activity className="h-5 w-5 text-blue-600" />,
      title: 'Activity Feed',
      description: 'See all changes and updates to the trip in one place',
    },
    {
      icon: <User className="h-5 w-5 text-purple-600" />,
      title: 'Who Changed What',
      description: 'Track who added, edited, or deleted trip items',
    },
    {
      icon: <Clock className="h-5 w-5 text-orange-600" />,
      title: 'Timestamp History',
      description: 'See when each change was made with precise timestamps',
    },
    {
      icon: <Eye className="h-5 w-5 text-green-600" />,
      title: 'Audit Trail',
      description: 'Full audit log of all trip modifications for accountability',
    },
  ];

  return (
    <GatedFeatureTab
      tabValue="activity"
      icon={Activity}
      title="Activity Feed"
      description="Track all changes and updates to your trip"
      features={features}
      gradientFrom="green-500"
      gradientTo="emerald-500"
      tripId={tripId}
    >
      {isAuthenticated && <ActivityInterface tripId={tripId} />}
    </GatedFeatureTab>
  );
}
