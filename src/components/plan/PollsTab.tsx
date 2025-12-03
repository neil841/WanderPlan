'use client';

import { BarChart3, Vote, Clock, TrendingUp } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { GatedFeatureTab } from './GatedFeatureTab';
import { PollsInterface } from './PollsInterface';

interface PollsTabProps {
  tripId: string;
}

/**
 * PollsTab Component
 *
 * Gated feature tab for group polls and voting.
 * - Guest users: Shows preview and signup prompt
 * - Authenticated users: Shows actual polls interface
 *
 * @component
 */
export function PollsTab({ tripId }: PollsTabProps) {
  const { status } = useSession();
  const isGuestTrip = tripId.startsWith('guest-');
  const isAuthenticated = status === 'authenticated' && !isGuestTrip;
  const features = [
    {
      icon: <Vote className="h-5 w-5 text-purple-600" />,
      title: 'Create Polls',
      description: 'Make group decisions about dates, activities, and destinations',
    },
    {
      icon: <BarChart3 className="h-5 w-5 text-blue-600" />,
      title: 'Real-Time Results',
      description: 'See poll results update live as people vote',
    },
    {
      icon: <Clock className="h-5 w-5 text-orange-600" />,
      title: 'Set Deadlines',
      description: 'Add deadlines to polls to keep decisions moving forward',
    },
    {
      icon: <TrendingUp className="h-5 w-5 text-green-600" />,
      title: 'Multiple Choice',
      description: 'Support single or multiple choice polls with custom options',
    },
  ];

  return (
    <GatedFeatureTab
      tabValue="polls"
      icon={BarChart3}
      title="Group Polls"
      description="Make decisions together with polls and voting"
      features={features}
      gradientFrom="purple-500"
      gradientTo="pink-500"
      tripId={tripId}
    >
      {isAuthenticated && <PollsInterface tripId={tripId} />}
    </GatedFeatureTab>
  );
}
