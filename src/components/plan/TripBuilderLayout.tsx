'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Share2,
  FileDown,
  Users,
  Calendar,
  DollarSign,
  LayoutGrid,
  Lock,
  ArrowLeft,
  Home,
  CalendarDays,
  MapPin,
  MessageSquare,
  Lightbulb,
  BarChart3,
  Activity,
  ChevronDown,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getGuestTrip, getTripStatistics, type GuestTrip, type SignupPromptReason } from '@/lib/guest-mode';
import { SignupPromptModal } from '@/components/guest/SignupPromptModal';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

import { InviteDialog } from '@/components/collaborators/InviteDialog';
import { ExportPDFDialog } from '@/components/trips/ExportPDFDialog';

interface TripBuilderLayoutProps {
  tripId: string;
  children: React.ReactNode;
}

/**
 * TripBuilderLayout Component
 *
 * Universal layout for trip building experience.
 * Supports both guest users (localStorage) and authenticated users (database).
 * Features tabbed navigation, with gated features unlocked for authenticated users.
 *
 * @component
 */
import { useTrip } from '@/hooks/useTrip';

// ... (imports remain the same)

export function TripBuilderLayout({ tripId, children }: TripBuilderLayoutProps) {
  const [mounted, setMounted] = useState(false);

  // Only render after hydration to avoid SSR mismatch with SessionProvider
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing during SSR to prevent useSession errors
  if (!mounted) {
    return null;
  }

  return <TripBuilderLayoutContent tripId={tripId}>{children}</TripBuilderLayoutContent>;
}

function TripBuilderLayoutContent({ tripId, children }: TripBuilderLayoutProps) {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // IMPORTANT: Determine if this is a guest trip or authenticated trip
  const isGuestTrip = tripId.startsWith('guest-');

  // Only consider user authenticated for THIS trip if:
  // 1. Session is authenticated AND
  // 2. Trip is NOT a guest trip (i.e., it's a database trip)
  const isAuthenticated = sessionStatus === 'authenticated' && !isGuestTrip;
  const isSessionLoading = sessionStatus === 'loading';

  // Fetch authenticated trip data
  const { data: dbTrip, isLoading: isDbTripLoading } = useTrip({
    tripId,
    enabled: isAuthenticated
  });

  const [trip, setTrip] = useState<GuestTrip | null>(null);
  const [stats, setStats] = useState<ReturnType<typeof getTripStatistics>>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [signupReason, setSignupReason] = useState<SignupPromptReason>('export');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    const isGuestTripId = tripId.startsWith('guest-');

    // Case 1: Guest Trip (load from localStorage)
    // Load if it's a guest ID, regardless of auth status
    // OR if user is not authenticated (and not loading session)
    if (isGuestTripId || (!isAuthenticated && !isSessionLoading)) {
      const tripData = getGuestTrip(tripId);
      const tripStats = getTripStatistics(tripId);

      if (!tripData) {
        // Only redirect if we're sure it's not loading
        if (!isSessionLoading) {
          router.push('/');
        }
        return;
      }

      setTrip(tripData);
      setStats(tripStats);

      // Set up auto-save listener for guest mode
      const handleStorageChange = () => {
        const updatedTrip = getGuestTrip(tripId);
        const updatedStats = getTripStatistics(tripId);
        setTrip(updatedTrip);
        setStats(updatedStats);
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }

    // Case 2: Authenticated DB Trip
    if (isAuthenticated && !isSessionLoading && !isGuestTripId) {
      if (dbTrip) {
        // Map DB trip to GuestTrip format for compatibility
        const mappedTrip: GuestTrip = {
          id: dbTrip.id,
          name: dbTrip.name,
          description: dbTrip.description || undefined,
          startDate: dbTrip.startDate || new Date().toISOString(),
          endDate: dbTrip.endDate || new Date().toISOString(),
          destinations: dbTrip.destinations,
          tags: dbTrip.tags.map(t => t.name),
          visibility: dbTrip.visibility.toLowerCase() as 'private' | 'shared' | 'public',
          events: dbTrip.events.map(e => ({
            id: e.id,
            tripId: dbTrip.id,
            day: 1, // TODO: Calculate day based on date
            title: e.name,
            startTime: e.startTime || undefined,
            endTime: e.endTime || undefined,
            location: e.location || undefined,
            description: e.description || undefined,
            estimatedCost: e.cost?.amount,
            category: 'activity', // Default or map from type
            order: e.order,
            createdAt: e.createdAt,
            updatedAt: e.updatedAt,
          })),
          expenses: [], // TODO: Fetch expenses separately if needed
          createdAt: dbTrip.createdAt,
          updatedAt: dbTrip.updatedAt,
          engagementScore: 0
        };

        setTrip(mappedTrip);

        // Calculate stats from mapped trip
        setStats({
          eventCount: dbTrip.stats.eventCount,
          expenseCount: 0, // Budget data might be different structure
          totalSpent: dbTrip.budget?.totalSpent || 0,
          dayCount: 1, // TODO: Calculate
          destinationCount: dbTrip.destinations.length,
          engagementScore: 0
        });
      }
    }
  }, [tripId, router, isAuthenticated, isSessionLoading, dbTrip]);

  const handleGatedFeature = (reason: SignupPromptReason) => {
    // If authenticated, perform the action
    if (isAuthenticated) {
      switch (reason) {
        case 'collaborate':
        case 'share':
          setIsInviteOpen(true);
          break;
        case 'export':
          // Distinguish between Share and Export based on context?
          // The buttons call this with 'export'.
          // We need to differentiate.
          // Let's update the buttons to call specific handlers or pass a more specific reason.
          break;
      }
      return;
    }

    setSignupReason(reason);
    setShowSignupModal(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const isLoading = isSessionLoading || (isAuthenticated && isDbTripLoading);

  if (isLoading || !trip) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isSessionLoading ? 'Checking authentication...' : 'Loading your trip...'}
          </p>
        </div>
      </div>
    );
  }

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur-xl shadow-sm"
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              {/* Back Button + Title */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(isAuthenticated ? '/trips' : '/plan')}
                  className="flex-shrink-0"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                    {trip.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                    </p>
                    {stats && (
                      <>
                        <span className="text-gray-400">•</span>
                        <Badge variant="secondary" className="text-xs">
                          {stats.dayCount} {stats.dayCount === 1 ? 'day' : 'days'}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Share - Unlocked for authenticated users */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isAuthenticated ? router.push(`/trips/${tripId}/share`) : handleGatedFeature('share')}
                  className="hidden sm:flex items-center gap-2 group relative"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden md:inline">Share</span>
                  {!isAuthenticated && <Lock className="h-3 w-3 text-gray-400" />}
                </Button>

                {/* Export PDF - Unlocked for authenticated users */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isAuthenticated ? setIsExportOpen(true) : handleGatedFeature('export')}
                  className="hidden sm:flex items-center gap-2 group relative"
                >
                  <FileDown className="h-4 w-4" />
                  <span className="hidden md:inline">Export</span>
                  {!isAuthenticated && <Lock className="h-3 w-3 text-gray-400" />}
                </Button>

                {/* Invite - Unlocked for authenticated users */}
                <Button
                  size="sm"
                  onClick={() => isAuthenticated ? setIsInviteOpen(true) : handleGatedFeature('collaborate')}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 group relative"
                >
                  <Users className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Invite</span>
                  {!isAuthenticated && <Lock className="h-3 w-3 ml-1" />}
                </Button>
              </div>
            </div>

            {/* Premium Tabs with Responsive Overflow */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
              <div className="relative">
                {/* Desktop: Horizontal scrollable tabs */}
                <div className="hidden lg:block">
                  <TabsList className="inline-flex bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-sm p-1.5 rounded-xl overflow-x-auto scrollbar-hide">
                    {/* FREE TABS */}
                    <TabsTrigger
                      value="overview"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <LayoutGrid className="h-4 w-4" />
                      <span className="font-medium">Overview</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="itinerary"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">Itinerary</span>
                      {stats && stats.eventCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 text-xs">
                          {stats.eventCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="budget"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <DollarSign className="h-4 w-4" />
                      <span className="font-medium">Budget</span>
                      {stats && stats.expenseCount > 0 && (
                        <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 text-xs">
                          {stats.expenseCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="calendar"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <CalendarDays className="h-4 w-4" />
                      <span className="font-medium">Calendar</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="map"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
                    >
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">Map</span>
                    </TabsTrigger>

                    {/* Divider */}
                    <div className="w-px h-8 bg-gray-300 mx-2 self-center" />

                    {/* GATED TABS - Unlocked for authenticated users */}
                    <TabsTrigger
                      value="messages"
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200",
                        !isAuthenticated && "opacity-75"
                      )}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="font-medium">Messages</span>
                      {!isAuthenticated && <Lock className="h-3 w-3 opacity-60" />}
                    </TabsTrigger>
                    <TabsTrigger
                      value="ideas"
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200",
                        !isAuthenticated && "opacity-75"
                      )}
                    >
                      <Lightbulb className="h-4 w-4" />
                      <span className="font-medium">Ideas</span>
                      {!isAuthenticated && <Lock className="h-3 w-3 opacity-60" />}
                    </TabsTrigger>
                    <TabsTrigger
                      value="polls"
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200",
                        !isAuthenticated && "opacity-75"
                      )}
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="font-medium">Polls</span>
                      {!isAuthenticated && <Lock className="h-3 w-3 opacity-60" />}
                    </TabsTrigger>
                    <TabsTrigger
                      value="collaborators"
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200",
                        !isAuthenticated && "opacity-75"
                      )}
                    >
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Team</span>
                      {!isAuthenticated && <Lock className="h-3 w-3 opacity-60" />}
                    </TabsTrigger>
                    <TabsTrigger
                      value="activity"
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200",
                        !isAuthenticated && "opacity-75"
                      )}
                    >
                      <Activity className="h-4 w-4" />
                      <span className="font-medium">Activity</span>
                      {!isAuthenticated && <Lock className="h-3 w-3 opacity-60" />}
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Mobile/Tablet: Dropdown menu for overflow */}
                <div className="lg:hidden">
                  <div className="flex items-center gap-2">
                    <TabsList className="flex-1 bg-white/80 backdrop-blur-lg border border-gray-200/50 shadow-sm p-1.5 rounded-xl">
                      <TabsTrigger
                        value="overview"
                        className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg"
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger
                        value="itinerary"
                        className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg"
                      >
                        <Calendar className="h-4 w-4" />
                      </TabsTrigger>
                      <TabsTrigger
                        value="budget"
                        className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg"
                      >
                        <DollarSign className="h-4 w-4" />
                      </TabsTrigger>
                    </TabsList>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl border-gray-200/50 bg-white/80 backdrop-blur-lg shadow-sm">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem onClick={() => setActiveTab('calendar')}>
                          <CalendarDays className="mr-2 h-4 w-4" />
                          Calendar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setActiveTab('map')}>
                          <MapPin className="mr-2 h-4 w-4" />
                          Map
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTabChange('messages')}
                          className={!isAuthenticated ? 'opacity-60' : ''}
                          disabled={!isAuthenticated}
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Messages
                          {!isAuthenticated && <Lock className="ml-auto h-3 w-3" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTabChange('ideas')}
                          className={!isAuthenticated ? 'opacity-60' : ''}
                          disabled={!isAuthenticated}
                        >
                          <Lightbulb className="mr-2 h-4 w-4" />
                          Ideas
                          {!isAuthenticated && <Lock className="ml-auto h-3 w-3" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTabChange('polls')}
                          className={!isAuthenticated ? 'opacity-60' : ''}
                          disabled={!isAuthenticated}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Polls
                          {!isAuthenticated && <Lock className="ml-auto h-3 w-3" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTabChange('collaborators')}
                          className={!isAuthenticated ? 'opacity-60' : ''}
                          disabled={!isAuthenticated}
                        >
                          <Users className="mr-2 h-4 w-4" />
                          Team
                          {!isAuthenticated && <Lock className="ml-auto h-3 w-3" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTabChange('activity')}
                          className={!isAuthenticated ? 'opacity-60' : ''}
                          disabled={!isAuthenticated}
                        >
                          <Activity className="mr-2 h-4 w-4" />
                          Activity
                          {!isAuthenticated && <Lock className="ml-auto h-3 w-3" />}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Tabs value={activeTab} className="space-y-6">
              {children}
            </Tabs>
          </motion.div>
        </div>

        {/* Premium Back to Home Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="border-t border-gray-200/50 bg-gradient-to-b from-white to-gray-50/30 py-12"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center text-center space-y-6">
              {/* Decorative Divider */}
              <div className="flex items-center gap-4 w-full max-w-md">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 ring-4 ring-blue-50">
                  <Home className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
              </div>

              {/* Call to Action */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ready to explore more?
                </h3>
                <p className="text-sm text-gray-600 max-w-md">
                  Return to the home page to discover features, learn about WanderPlan, or start planning another adventure.
                </p>
              </div>

              {/* Premium Button */}
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                size="lg"
                className="group relative overflow-hidden border-2 border-blue-200 bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <span className="relative flex items-center gap-2 font-medium">
                  <Home className="h-4 w-4 transition-transform group-hover:-translate-x-1 duration-300" />
                  Back to Home
                  <ArrowLeft className="h-4 w-4 opacity-0 -ml-4 transition-all group-hover:opacity-100 group-hover:ml-0 duration-300" />
                </span>
              </Button>

              {/* Trust Badge */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>{isAuthenticated ? 'Your trip is saved to your account' : 'Your trip is saved locally'}</span>
                </div>
                {!isAuthenticated && (
                  <>
                    <span>•</span>
                    <span>No account required</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Signup Modal - Only show for guest users */}
      {!isAuthenticated && (
        <SignupPromptModal
          open={showSignupModal}
          onOpenChange={setShowSignupModal}
          reason={signupReason}
        />
      )}

      {/* Invite Dialog */}
      {trip && (
        <InviteDialog
          tripId={tripId}
          open={isInviteOpen}
          onOpenChange={setIsInviteOpen}
          canInviteAdmin={true}
        />
      )}

      {/* Export PDF Dialog */}
      {trip && (
        <ExportPDFDialog
          tripId={tripId}
          tripName={trip.name}
          open={isExportOpen}
          onOpenChange={setIsExportOpen}
        />
      )}
    </>
  );
}
