/**
 * Trip Collaborators Page
 *
 * Page for managing trip collaborators.
 *
 * Features:
 * - Collaborator management UI
 * - Invite new collaborators
 * - Change roles
 * - Remove collaborators
 * - View pending invitations
 * - Responsive design
 *
 * @page
 */

'use client';

import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTrip } from '@/hooks/useTrip';
import { CollaboratorManagement } from '@/components/collaborators/CollaboratorManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CollaboratorRole } from '@prisma/client';

export default function CollaboratorsPage() {
  const params = useParams();
  const tripId = params?.tripId as string;
  const { data: session, status: sessionStatus } = useSession();

  const {
    data: trip,
    isLoading: tripLoading,
    isError: tripError,
    error,
  } = useTrip({ tripId });

  // Loading State
  if (sessionStatus === 'loading' || tripLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Card>
            <CardContent className="py-12">
              <div className="flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Auth Error
  if (sessionStatus === 'unauthenticated' || !session?.user?.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Authentication Required</h2>
                <p className="text-muted-foreground">
                  You must be logged in to manage collaborators.
                </p>
              </div>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Trip Error
  if (tripError) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    const is404 = errorMessage.includes('not found') || errorMessage.includes('404');
    const is403 = errorMessage.includes('Forbidden') || errorMessage.includes('403');

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">
                  {is404 ? 'Trip Not Found' : is403 ? 'Access Denied' : 'Error Loading Trip'}
                </h2>
                <p className="text-muted-foreground">
                  {is404
                    ? 'The trip you are looking for does not exist or has been deleted.'
                    : is403
                    ? 'You do not have permission to manage collaborators for this trip.'
                    : errorMessage}
                </p>
              </div>
              <Link href="/trips">
                <Button variant="outline">Back to Trips</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Determine user role
  const isOwner = trip.createdBy === session.user.id;
  const userCollaborator = trip.collaborators?.find(
    (c: any) => c.userId === session.user.id && c.status === 'ACCEPTED'
  );
  const userRole: CollaboratorRole | 'OWNER' = isOwner
    ? 'OWNER'
    : userCollaborator?.role || 'VIEWER';

  // Check if user can view collaborators (everyone with access can view)
  const canView = isOwner || userCollaborator;

  if (!canView) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/50">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <Lock className="w-8 h-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground">
                  You do not have permission to view collaborators for this trip.
                </p>
              </div>
              <Link href={`/trips/${tripId}`}>
                <Button variant="outline">Back to Trip</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/trips" className="hover:text-foreground">
              Trips
            </Link>
            <span>/</span>
            <Link href={`/trips/${tripId}`} className="hover:text-foreground">
              {trip.title}
            </Link>
            <span>/</span>
            <span className="text-foreground">Collaborators</span>
          </nav>
        </div>

        {/* Collaborator Management Component */}
        <CollaboratorManagement
          tripId={tripId}
          userRole={userRole}
          currentUserId={session.user.id}
        />
      </div>
    </div>
  );
}
