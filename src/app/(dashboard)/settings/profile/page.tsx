import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth-options';
import { ProfileForm } from '@/components/settings/ProfileForm';
import { PasswordChangeForm } from '@/components/settings/PasswordChangeForm';
import type { ProfileData } from '@/lib/validations/profile';

/**
 * Profile Settings Page
 *
 * Allows authenticated users to:
 * - Update basic profile information (name, email, bio, phone, timezone)
 * - Change password with current password verification
 *
 * Features:
 * - Server-side rendering with Next.js 14 App Router
 * - Protected route (requires authentication)
 * - Fetches user data on server side
 * - Premium UI components with animations
 * - Email change triggers re-verification
 * - WCAG 2.1 AA compliant
 * - Fully responsive design
 *
 * @page /settings/profile
 */
export default async function ProfileSettingsPage() {
  // 1. Check authentication
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/settings/profile');
  }

  // 2. Fetch user profile data directly from database (server-side)
  let profileData: ProfileData | null = null;
  let error: string | null = null;

  try {
    const prisma = (await import('@/lib/db/prisma')).default;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        timezone: true,
      },
    });

    if (user) {
      profileData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        phone: user.phone,
        timezone: user.timezone,
      };
    } else {
      error = 'User not found';
    }
  } catch (err) {
    console.error('[Profile Page] Error fetching profile:', err);
    error = 'An error occurred while loading your profile';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Profile Settings
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage your account information and security settings
          </p>
        </div>

        {/* Error State */}
        {error && !profileData && (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-6 mb-6">
            <h3 className="text-error-900 dark:text-error-100 font-semibold mb-2">
              Failed to Load Profile
            </h3>
            <p className="text-error-800 dark:text-error-200 text-sm">{error}</p>
          </div>
        )}

        {/* Profile Forms */}
        {profileData && (
          <div className="space-y-6">
            {/* Profile Information Form */}
            <ProfileForm initialData={profileData} />

            {/* Password Change Form */}
            <PasswordChangeForm />
          </div>
        )}

        {/* Loading State (fallback) */}
        {!profileData && !error && (
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-800 p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600 dark:text-neutral-400">Loading profile...</p>
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
  title: 'Profile Settings | WanderPlan',
  description: 'Update your profile information and security settings',
};
