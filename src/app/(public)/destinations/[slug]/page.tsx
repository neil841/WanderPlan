/**
 * Destination Guide Page
 *
 * Public page displaying destination information from Wikipedia.
 * Users can view destination guides and add destinations to their trips.
 *
 * @page
 * @route /destinations/[slug]
 * @access Public
 */

'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DestinationGuide } from '@/components/destinations/DestinationGuide';
import { DestinationGuide as DestinationGuideType } from '@/lib/destinations/wikipedia';

interface DestinationPageProps {
  params: {
    slug: string;
  };
}

/**
 * Fetch destination guide
 */
async function fetchDestinationGuide(slug: string): Promise<DestinationGuideType> {
  const response = await fetch(`/api/destinations/${slug}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details || error.error || 'Failed to fetch destination guide');
  }

  return response.json();
}

export default function DestinationPage({ params }: DestinationPageProps) {
  const { slug } = params;
  const router = useRouter();

  // Fetch destination guide
  const {
    data: guide,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['destination', slug],
    queryFn: () => fetchDestinationGuide(slug),
    staleTime: 86400000, // 24 hours
    retry: 1,
  });

  // Save destination to trip (placeholder - would need trip selection)
  const saveToTrip = useMutation({
    mutationFn: async () => {
      // This is a placeholder - in a real app, you'd show a trip selector
      // or create a new trip with this destination
      toast.info('Please create or select a trip to add this destination');
      router.push('/trips');
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading destination guide...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !guide) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Destination Not Found
            </h3>
            <p className="text-sm text-red-700 mb-4">
              {error instanceof Error ? error.message : 'Unable to load destination guide'}
            </p>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <DestinationGuide
          guide={guide}
          onSaveToTrip={() => saveToTrip.mutate()}
          isSaving={saveToTrip.isPending}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto px-4 py-6 max-w-4xl text-center text-sm text-gray-600">
          <p>
            Explore more destinations on{' '}
            <a
              href="/"
              className="text-blue-600 hover:underline font-medium"
            >
              WanderPlan
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
