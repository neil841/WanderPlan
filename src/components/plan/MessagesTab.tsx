'use client';

import { MessageSquare, Send, Bell, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { GatedFeatureTab } from './GatedFeatureTab';
import { MessagesInterface } from './MessagesInterface';

interface MessagesTabProps {
  tripId: string;
}

/**
 * MessagesTab Component
 *
 * Gated feature tab for real-time messaging.
 * - Guest users: Shows preview and signup prompt
 * - Authenticated users: Shows actual messaging interface
 *
 * @component
 */
export function MessagesTab({ tripId }: MessagesTabProps) {
  const { status } = useSession();
  const isGuestTrip = tripId.startsWith('guest-');
  const isAuthenticated = status === 'authenticated' && !isGuestTrip;

  const features = [
    {
      icon: <Send className="h-5 w-5 text-blue-600" />,
      title: 'Real-Time Chat',
      description: 'Send and receive messages instantly with your travel companions',
    },
    {
      icon: <Bell className="h-5 w-5 text-purple-600" />,
      title: 'Push Notifications',
      description: 'Get notified when someone sends a message or mentions you',
    },
    {
      icon: <Users className="h-5 w-5 text-green-600" />,
      title: 'Group Conversations',
      description: 'Chat with all trip collaborators in one place',
    },
    {
      icon: <MessageSquare className="h-5 w-5 text-orange-600" />,
      title: 'Threaded Replies',
      description: 'Reply to specific messages and keep conversations organized',
    },
  ];

  return (
    <GatedFeatureTab
      tabValue="messages"
      icon={MessageSquare}
      title="Real-Time Messages"
      description="Chat with your travel companions in real-time"
      features={features}
      gradientFrom="blue-500"
      gradientTo="cyan-500"
      tripId={tripId}
    >
      {isAuthenticated && <MessagesInterface tripId={tripId} />}
    </GatedFeatureTab>
  );
}
