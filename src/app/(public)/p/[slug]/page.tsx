/**
 * Public Landing Page
 *
 * Server-rendered public landing page with SEO optimization
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BlockRenderer } from '@/components/landing-pages/BlockRenderer';
import { LeadCaptureForm } from '@/components/landing-pages/LeadCaptureForm';
import type { LandingPage, LandingPageBlock } from '@/types/landing-page';

interface PublicLandingPageProps {
  params: {
    slug: string;
  };
}

/**
 * Fetch landing page from API (server-side)
 */
async function getLandingPage(slug: string): Promise<LandingPage | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/landing-pages/${slug}`, {
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Failed to fetch landing page:', error);
    return null;
  }
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({
  params,
}: PublicLandingPageProps): Promise<Metadata> {
  const landingPage = await getLandingPage(params.slug);

  if (!landingPage) {
    return {
      title: 'Page Not Found',
    };
  }

  // Find hero block for OG image
  const heroBlock = landingPage.content.blocks.find((b) => b.type === 'hero');
  const heroImage = heroBlock?.data?.backgroundImage;

  return {
    title: landingPage.title,
    description: landingPage.description || `Explore ${landingPage.title}`,
    openGraph: {
      title: landingPage.title,
      description: landingPage.description || undefined,
      images: heroImage ? [heroImage] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: landingPage.title,
      description: landingPage.description || undefined,
      images: heroImage ? [heroImage] : undefined,
    },
  };
}

export default async function PublicLandingPage({ params }: PublicLandingPageProps) {
  const landingPage = await getLandingPage(params.slug);

  // Check if landing page exists
  if (!landingPage) {
    notFound();
  }

  // Check if published
  if (!landingPage.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            Page Not Published
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            This landing page is not currently available.
          </p>
        </div>
      </div>
    );
  }

  // Check if any block is a lead-capture block
  const hasLeadCaptureBlock = landingPage.content.blocks.some(
    (block) => block.type === 'lead-capture'
  );

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      {/* Render all blocks */}
      <main>
        {landingPage.content.blocks.length === 0 ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
                {landingPage.title}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                Content coming soon...
              </p>
            </div>
          </div>
        ) : (
          landingPage.content.blocks.map((block) => {
            // If it's a lead-capture block, render the actual form
            if (block.type === 'lead-capture') {
              return (
                <section key={block.id}>
                  <LeadCaptureForm
                    landingPageSlug={landingPage.slug}
                    config={{
                      title: block.data.title || 'Contact Us',
                      subtitle: block.data.subtitle,
                      submitText: block.data.submitText || 'Submit',
                      fields: {
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        message: true,
                      },
                    }}
                  />
                </section>
              );
            }

            // Otherwise, use the standard BlockRenderer
            return (
              <section key={block.id}>
                <BlockRenderer block={block} isPreview={false} />
              </section>
            );
          })
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 dark:border-neutral-800 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Powered by{' '}
            <a
              href="/"
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              WanderPlan
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
