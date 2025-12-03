'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Tag,
  Users,
  Save,
  Share2,
  FileDown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getGuestTrip, getGuestSession, type GuestTrip } from '@/lib/guest-mode';

interface GuestTripViewProps {
  tripId: string;
}

/**
 * GuestTripView Component
 *
 * Displays a guest trip with smart signup prompts.
 * Shows trip details and encourages signup for advanced features.
 *
 * @component
 */
export function GuestTripView({ tripId }: GuestTripViewProps) {
  const router = useRouter();
  const [trip, setTrip] = useState<GuestTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load trip from localStorage
    const loadedTrip = getGuestTrip(tripId);
    setTrip(loadedTrip);
    setIsLoading(false);

    if (!loadedTrip) {
      // Trip not found, redirect to home
      router.push('/');
    }
  }, [tripId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return null;
  }

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Success Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Alert className="border-green-200 bg-green-50">
          <Sparkles className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            <strong>Trip created successfully!</strong> Your trip is saved locally. Create a free
            account to save it permanently and collaborate with others.
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Trip Header */}
      <Card className="shadow-lg">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl font-bold text-gray-900">{trip.name}</CardTitle>
              {trip.description && (
                <CardDescription className="mt-2 text-base">{trip.description}</CardDescription>
              )}
            </div>
          </div>

          {/* Trip Metadata */}
          <div className="flex flex-wrap gap-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">
                {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
              </span>
            </div>

            {trip.destinations.length > 0 && (
              <div className="flex items-center gap-2">
                {trip.destinations.slice(0, 3).map((destination) => (
                  <Badge key={destination} variant="secondary" className="gap-1">
                    <MapPin className="h-3 w-3" />
                    {destination}
                  </Badge>
                ))}
                {trip.destinations.length > 3 && (
                  <Badge variant="outline">+{trip.destinations.length - 3} more</Badge>
                )}
              </div>
            )}
          </div>

          {/* Tags */}
          {trip.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trip.tags.map((tag) => (
                <Badge key={tag} variant="default" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Feature Cards - Encourage Signup */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Collaborate Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/register?reason=collaborate')}>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 mb-3">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Collaborate</CardTitle>
              <CardDescription>
                Invite friends and family to plan together in real-time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" size="sm">
                Sign Up to Collaborate
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Permanently Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/register?reason=save')}>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 mb-3">
                <Save className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Save Permanently</CardTitle>
              <CardDescription>
                Access your trip from any device and never lose your plans.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" size="sm">
                Sign Up to Save
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Export & Share Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/register?reason=export')}>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 mb-3">
                <FileDown className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">Export & Share</CardTitle>
              <CardDescription>
                Download beautiful PDFs and share live links with travelers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" size="sm">
                Sign Up to Export
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Premium CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-600 text-white shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/20 px-4 py-2 mb-4 backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Free Forever Plan</span>
            </div>

            <h3 className="text-2xl font-bold mb-3">Ready to Unlock More Features?</h3>
            <p className="text-blue-50 mb-6 max-w-2xl mx-auto">
              Create an account to save your trips permanently, collaborate with friends and
              family, and access premium planning features.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => router.push('/register')}
                className="bg-white text-blue-600 hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
              >
                Create Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/login')}
                className="border-2 border-white/80 bg-white/10 text-white hover:bg-white/20 hover:border-white backdrop-blur-sm transition-all shadow-md"
              >
                Already have an account?
              </Button>
            </div>

            <p className="mt-4 text-sm text-blue-100">
              ✓ No credit card required • ✓ Unlimited trips • ✓ Real-time collaboration
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Continue Exploring */}
      <div className="text-center py-6">
        <Button variant="ghost" onClick={() => router.push('/')}>
          ← Back to Home
        </Button>
      </div>
    </motion.div>
  );
}
