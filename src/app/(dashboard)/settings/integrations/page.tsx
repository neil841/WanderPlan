import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth-options';
import { IntegrationsSettings } from '@/components/settings/IntegrationsSettings';

/**
 * Integrations Settings Page
 *
 * Allows authenticated users to:
 * - View connected integrations (Google Calendar)
 * - Connect new integrations
 * - Disconnect existing integrations
 * - Manage integration settings
 *
 * Features:
 * - Server-side rendering with Next.js 14 App Router
 * - Protected route (requires authentication)
 * - Fetches user integration status on server side
 * - Premium UI components with animations
 * - WCAG 2.1 AA compliant
 * - Fully responsive design
 *
 * @page /settings/integrations
 */
export default async function IntegrationsSettingsPage() {
  // 1. Check authentication
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/settings/integrations');
  }

  // 2. Fetch user integration data from database (server-side)
  let integrationsData: {
    googleCalendar: {
      isConnected: boolean;
      connectedAt?: Date;
      email?: string;
    };
  } | null = null;
  let error: string | null = null;

  try {
    const prisma = (await import('@/lib/db/prisma')).default;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        googleCalendarAccessToken: true,
        googleCalendarTokenExpiry: true,
      },
    });

    if (user) {
      // Check if Google Calendar is connected
      const isGoogleCalendarConnected =
        !!user.googleCalendarAccessToken &&
        !!user.googleCalendarTokenExpiry &&
        user.googleCalendarTokenExpiry > new Date();

      integrationsData = {
        googleCalendar: {
          isConnected: isGoogleCalendarConnected,
          connectedAt: user.googleCalendarTokenExpiry || undefined,
          email: user.email,
        },
      };
    } else {
      error = 'User not found';
    }
  } catch (err) {
    console.error('[Integrations Page] Error fetching integrations:', err);
    error = 'An error occurred while loading your integrations';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Integrations
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Connect external services to enhance your WanderPlan experience
          </p>
        </div>

        {/* Error State */}
        {error && !integrationsData && (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-6 mb-6">
            <h3 className="text-error-900 dark:text-error-100 font-semibold mb-2">
              Failed to Load Integrations
            </h3>
            <p className="text-error-800 dark:text-error-200 text-sm">{error}</p>
          </div>
        )}

        {/* Integrations Settings */}
        {integrationsData && <IntegrationsSettings initialData={integrationsData} />}

        {/* Loading State (fallback) */}
        {!integrationsData && !error && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading integrations...</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Metadata for SEO and browser tab
 */
export const metadata = {
  title: 'Integrations | WanderPlan',
  description: 'Connect and manage external service integrations',
};
