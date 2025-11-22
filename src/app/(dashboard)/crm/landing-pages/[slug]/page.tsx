/**
 * Landing Page Editor Page
 *
 * Page wrapper for the landing page editor
 */

'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useLandingPage } from '@/hooks/useLandingPages';
import { PageEditor } from '@/components/landing-pages/PageEditor';

interface LandingPageEditorPageProps {
  params: {
    slug: string;
  };
}

export default function LandingPageEditorPage({ params }: LandingPageEditorPageProps) {
  const router = useRouter();
  const { slug } = params;

  // Fetch landing page data
  const { data: landingPage, isLoading, error } = useLandingPage(slug);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="w-2/5 p-6 border-r border-neutral-200 dark:border-neutral-800">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-20 w-full mb-6" />
          <Skeleton className="h-10 w-full mb-2" />
          <Skeleton className="h-16 w-full mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !landingPage) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load landing page. Please try again.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/crm/landing-pages')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Landing Pages
        </Button>
      </div>
    );
  }

  // Render editor
  return <PageEditor landingPage={landingPage} />;
}
