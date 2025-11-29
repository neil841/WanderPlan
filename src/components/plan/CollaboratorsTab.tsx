'use client';

import { Users, UserPlus, Shield, Mail } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { GatedFeatureTab } from './GatedFeatureTab';
import { CollaboratorsInterface } from './CollaboratorsInterface';

interface CollaboratorsTabProps {
  tripId: string;
}

/**
 * CollaboratorsTab Component
 *
 * Gated feature tab for team management.
 * - Guest users: Shows preview and signup prompt
 * - Authenticated users: Shows actual team management interface
 *
 * @component
 */
export function CollaboratorsTab({ tripId }: CollaboratorsTabProps) {
  const { status } = useSession();
  const isGuestTrip = tripId.startsWith('guest-');
  const isAuthenticated = status === 'authenticated' && !isGuestTrip;
  const features = [
    {
      icon: <UserPlus className="h-5 w-5 text-blue-600" />,
      title: 'Invite Friends',
      description: 'Send email invites to friends and family to join the trip',
    },
    {
      icon: <Shield className="h-5 w-5 text-purple-600" />,
      title: 'Role Management',
      description: 'Assign roles like Owner, Admin, Editor, or Viewer',
    },
    {
      icon: <Mail className="h-5 w-5 text-green-600" />,
      title: 'Email Notifications',
      description: 'Collaborators get notified about updates and changes',
    },
    {
      icon: <Users className="h-5 w-5 text-orange-600" />,
      title: 'Team Overview',
      description: 'See who has access and manage permissions easily',
    },
  ];

  return (
    <GatedFeatureTab
      tabValue="collaborators"
      icon={Users}
      title="Collaborators"
      description="Invite friends and manage team access to your trip"
      features={features}
      gradientFrom="blue-500"
      gradientTo="purple-500"
      tripId={tripId}
    >
      {isAuthenticated && <CollaboratorsInterface tripId={tripId} />}
    </GatedFeatureTab>
  );
}
