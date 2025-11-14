/**
 * Invitation Acceptance Page
 *
 * Public page for viewing and accepting/declining trip invitations
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Calendar,
  MapPin,
  UserCheck,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

interface InvitationDetails {
  id: string;
  role: string;
  status: string;
  invitedAt: string;
  trip: {
    id: string;
    title: string;
    description: string | null;
    destination: string;
    startDate: string | null;
    endDate: string | null;
    imageUrl: string | null;
  };
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  inviter: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

export default function InvitationPage({ params }: { params: { token: string } }) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [actionComplete, setActionComplete] = useState<'accepted' | 'declined' | null>(null);

  // Fetch invitation details
  useEffect(() => {
    fetchInvitation();
  }, [params.token]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/invitations/${params.token}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load invitation');
        setErrorCode(data.code || null);
        return;
      }

      setInvitation(data.invitation);
    } catch (err) {
      console.error('Error fetching invitation:', err);
      setError('Failed to load invitation details');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!session?.user?.id) {
      // Redirect to login with return URL
      router.push(`/login?callbackUrl=/invitations/${params.token}`);
      return;
    }

    try {
      setAccepting(true);
      setError(null);

      const response = await fetch(`/api/invitations/${params.token}/accept`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to accept invitation');
        return;
      }

      setActionComplete('accepted');

      // Redirect to trip after 2 seconds
      setTimeout(() => {
        router.push(`/trips/${data.tripId}`);
      }, 2000);
    } catch (err) {
      console.error('Error accepting invitation:', err);
      setError('Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    if (!session?.user?.id) {
      // Redirect to login with return URL
      router.push(`/login?callbackUrl=/invitations/${params.token}`);
      return;
    }

    try {
      setDeclining(true);
      setError(null);

      const response = await fetch(`/api/invitations/${params.token}/decline`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to decline invitation');
        return;
      }

      setActionComplete('declined');

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/trips');
      }, 2000);
    } catch (err) {
      console.error('Error declining invitation:', err);
      setError('Failed to decline invitation');
    } finally {
      setDeclining(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-600 text-white';
      case 'EDITOR':
        return 'bg-blue-600 text-white';
      case 'VIEWER':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const getRolePermissions = (role: string) => {
    const permissions: Record<string, string[]> = {
      VIEWER: ['View trip details', 'View itinerary and events', 'View shared documents'],
      EDITOR: [
        'View trip details',
        'Edit trip information',
        'Create and edit events',
        'Manage budget and expenses',
        'Upload documents',
        'Send messages',
      ],
      ADMIN: [
        'All Editor permissions',
        'Invite and manage collaborators',
        'Delete events and documents',
        'Manage trip settings',
        'Full trip management access',
      ],
    };
    return permissions[role] || [];
  };

  // Loading state
  if (loading || sessionStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Error state - invitation not found or already processed
  if (error && (errorCode === 'NOT_FOUND' || errorCode === 'ALREADY_ACCEPTED' || errorCode === 'ALREADY_DECLINED')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              {errorCode === 'ALREADY_ACCEPTED' && <CheckCircle className="h-8 w-8 text-green-600" />}
              {errorCode === 'ALREADY_DECLINED' && <XCircle className="h-8 w-8 text-red-600" />}
              {errorCode === 'NOT_FOUND' && <AlertCircle className="h-8 w-8 text-yellow-600" />}
              <div>
                <CardTitle>
                  {errorCode === 'ALREADY_ACCEPTED' && 'Invitation Already Accepted'}
                  {errorCode === 'ALREADY_DECLINED' && 'Invitation Declined'}
                  {errorCode === 'NOT_FOUND' && 'Invitation Not Found'}
                </CardTitle>
                <CardDescription>{error}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {errorCode === 'ALREADY_ACCEPTED' && 'This invitation has already been accepted. You can access the trip from your dashboard.'}
                {errorCode === 'ALREADY_DECLINED' && 'This invitation has been declined.'}
                {errorCode === 'NOT_FOUND' && 'This invitation link is invalid or has expired.'}
              </p>
              <div className="flex gap-2">
                <Button asChild className="flex-1">
                  <Link href="/trips">Go to Trips</Link>
                </Button>
                {!session && (
                  <Button asChild variant="outline" className="flex-1">
                    <Link href="/login">Log In</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state - general error
  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <CardTitle>Error</CardTitle>
                <CardDescription>Failed to load invitation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state - action completed
  if (actionComplete && invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              {actionComplete === 'accepted' && <CheckCircle className="h-8 w-8 text-green-600" />}
              {actionComplete === 'declined' && <XCircle className="h-8 w-8 text-gray-600" />}
              <div>
                <CardTitle>
                  {actionComplete === 'accepted' ? 'Invitation Accepted!' : 'Invitation Declined'}
                </CardTitle>
                <CardDescription>
                  {actionComplete === 'accepted'
                    ? `Redirecting to ${invitation.trip.title}...`
                    : 'Redirecting to your trips...'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main invitation view
  if (!invitation) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-5xl">✈️</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">You're Invited to Collaborate!</h1>
          <p className="text-muted-foreground">
            <strong>{invitation.inviter.firstName} {invitation.inviter.lastName}</strong> has invited you to join a trip
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Invitation Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{invitation.trip.title}</CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4" />
                  <span>{invitation.trip.destination}</span>
                </div>
                {invitation.trip.startDate && invitation.trip.endDate && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(invitation.trip.startDate), 'MMM d, yyyy')} -{' '}
                      {format(new Date(invitation.trip.endDate), 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
              {invitation.trip.imageUrl && (
                <img
                  src={invitation.trip.imageUrl}
                  alt={invitation.trip.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
            </div>
            {invitation.trip.description && (
              <CardDescription className="mt-4">{invitation.trip.description}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Role Badge */}
            <div>
              <p className="text-sm font-medium mb-2">Your role:</p>
              <Badge className={getRoleBadgeColor(invitation.role)}>
                {invitation.role.charAt(0) + invitation.role.slice(1).toLowerCase()}
              </Badge>
            </div>

            {/* Role Permissions */}
            <div>
              <p className="text-sm font-medium mb-2">As a {invitation.role.toLowerCase()}, you'll be able to:</p>
              <ul className="space-y-1">
                {getRolePermissions(invitation.role).map((permission, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{permission}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Inviter Info */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Avatar>
                <AvatarImage src={invitation.inviter.avatarUrl || undefined} />
                <AvatarFallback>
                  {invitation.inviter.firstName.charAt(0)}
                  {invitation.inviter.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">
                  {invitation.inviter.firstName} {invitation.inviter.lastName}
                </p>
                <p className="text-muted-foreground">{invitation.inviter.email}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAccept}
                disabled={accepting || declining}
                className="flex-1"
                size="lg"
              >
                {accepting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept Invitation
                  </>
                )}
              </Button>
              <Button
                onClick={handleDecline}
                disabled={accepting || declining}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                {declining ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </>
                )}
              </Button>
            </div>

            {/* Login prompt if not logged in */}
            {!session && (
              <Alert>
                <UserCheck className="h-4 w-4" />
                <AlertDescription>
                  You need to log in to accept or decline this invitation.{' '}
                  <Link href={`/login?callbackUrl=/invitations/${params.token}`} className="underline font-medium">
                    Log in now
                  </Link>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            If you didn't expect this invitation, you can safely ignore it or decline.
          </p>
          <p className="mt-2">
            <Link href="/" className="underline">
              Visit WanderPlan
            </Link>
            {' • '}
            <Link href="/help" className="underline">
              Help Center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
