/**
 * Collaborator Management Component
 *
 * Main component for managing trip collaborators.
 *
 * Features:
 * - Display trip owner
 * - List accepted collaborators
 * - List pending invitations
 * - Invite new collaborators
 * - Change collaborator roles
 * - Remove collaborators
 * - Responsive design
 *
 * @component
 */

'use client';

import { useState } from 'react';
import { useCollaborators } from '@/hooks/useCollaborators';
import { InviteDialog } from './InviteDialog';
import { CollaboratorCard } from './CollaboratorCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserPlus, Users, Clock, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { CollaboratorRole } from '@prisma/client';
import { getRoleColor } from '@/types/collaborator';

interface CollaboratorManagementProps {
  tripId: string;
  userRole: CollaboratorRole | 'OWNER';
  currentUserId: string;
}

export function CollaboratorManagement({
  tripId,
  userRole,
  currentUserId,
}: CollaboratorManagementProps) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'accepted' | 'pending'>('all');

  const {
    data: collaboratorsData,
    isLoading,
    isError,
    error,
  } = useCollaborators(tripId, activeTab === 'all' ? undefined : activeTab);

  const canInvite = userRole === 'OWNER' || userRole === 'ADMIN';
  const canInviteAdmin = userRole === 'OWNER';

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load collaborators'}
        </AlertDescription>
      </Alert>
    );
  }

  const { collaborators, owner, totalCount, pendingCount, acceptedCount } = collaboratorsData!;

  const acceptedCollaborators = collaborators.filter((c) => c.status === 'ACCEPTED');
  const pendingCollaborators = collaborators.filter((c) => c.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Collaborators</h2>
          <p className="text-muted-foreground">
            Manage who can access and edit this trip
          </p>
        </div>
        {canInvite && (
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Collaborator
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCount + 1}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{acceptedCount + 1}</p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCount}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trip Owner */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Trip Owner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-purple-50 dark:bg-purple-900/10">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src={owner.profilePicture || undefined}
                alt={`${owner.firstName} ${owner.lastName}`}
              />
              <AvatarFallback>
                {getInitials(owner.firstName, owner.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">
                {owner.firstName} {owner.lastName}
                {owner.id === currentUserId && (
                  <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{owner.email}</p>
            </div>
            <Badge className={getRoleColor('OWNER')}>Owner</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Collaborators List */}
      <Card>
        <CardHeader>
          <CardTitle>Collaborators</CardTitle>
          <CardDescription>
            People who have been invited to collaborate on this trip
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalCount === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No collaborators yet</h3>
              <p className="text-muted-foreground mt-2">
                {canInvite
                  ? 'Invite someone to start collaborating on this trip'
                  : 'Only the trip owner and admins can invite collaborators'}
              </p>
              {canInvite && (
                <Button
                  onClick={() => setShowInviteDialog(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Collaborator
                </Button>
              )}
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">
                  All ({totalCount})
                </TabsTrigger>
                <TabsTrigger value="accepted">
                  Active ({acceptedCount})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({pendingCount})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6 space-y-3">
                {collaborators.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No collaborators found
                  </p>
                ) : (
                  collaborators.map((collaborator) => (
                    <CollaboratorCard
                      key={collaborator.id}
                      tripId={tripId}
                      collaborator={collaborator}
                      userRole={userRole}
                      currentUserId={currentUserId}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="accepted" className="mt-6 space-y-3">
                {acceptedCollaborators.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No active collaborators
                  </p>
                ) : (
                  acceptedCollaborators.map((collaborator) => (
                    <CollaboratorCard
                      key={collaborator.id}
                      tripId={tripId}
                      collaborator={collaborator}
                      userRole={userRole}
                      currentUserId={currentUserId}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="mt-6 space-y-3">
                {pendingCollaborators.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending invitations
                  </p>
                ) : (
                  <>
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertTitle>Pending Invitations</AlertTitle>
                      <AlertDescription>
                        These users have been invited but haven't accepted yet
                      </AlertDescription>
                    </Alert>
                    {pendingCollaborators.map((collaborator) => (
                      <CollaboratorCard
                        key={collaborator.id}
                        tripId={tripId}
                        collaborator={collaborator}
                        userRole={userRole}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <InviteDialog
        tripId={tripId}
        open={showInviteDialog}
        onOpenChange={setShowInviteDialog}
        canInviteAdmin={canInviteAdmin}
      />
    </div>
  );
}
