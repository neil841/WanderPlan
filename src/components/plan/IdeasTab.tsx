'use client';

import { Lightbulb, ThumbsUp, MessageCircle, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { GatedFeatureTab } from './GatedFeatureTab';
import { IdeasInterface } from './IdeasInterface';

interface IdeasTabProps {
  tripId: string;
}

/**
 * IdeasTab Component
 *
 * Gated feature tab for idea suggestions and voting.
 * - Guest users: Shows preview and signup prompt
 * - Authenticated users: Shows actual ideas interface
 *
 * @component
 */
export function IdeasTab({ tripId }: IdeasTabProps) {
  const { status, data: session } = useSession();
  const isGuestTrip = tripId.startsWith('guest-');
  const isAuthenticated = status === 'authenticated' && !isGuestTrip;
  const features = [
    {
      icon: <Lightbulb className="h-5 w-5 text-yellow-600" />,
      title: 'Share Ideas',
      description: 'Suggest activities, restaurants, and attractions for the trip',
    },
    {
      icon: <ThumbsUp className="h-5 w-5 text-blue-600" />,
      title: 'Vote & Discuss',
      description: 'Let everyone vote on ideas and discuss favorites',
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-purple-600" />,
      title: 'Add Comments',
      description: 'Comment on ideas to share thoughts and details',
    },
    {
      icon: <CheckCircle className="h-5 w-5 text-green-600" />,
      title: 'Accept Ideas',
      description: 'Turn approved ideas into itinerary events automatically',
    },
  ];

  return (
    <GatedFeatureTab
      tabValue="ideas"
      icon={Lightbulb}
      title="Ideas & Suggestions"
      description="Collaborate on trip ideas with voting and discussions"
      features={features}
      gradientFrom="yellow-500"
      gradientTo="orange-500"
      tripId={tripId}
    >
      {isAuthenticated && (
        <IdeasInterface tripId={tripId} currentUserId={session?.user?.id} />
      )}
    </GatedFeatureTab>
  );
}
