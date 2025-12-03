/**
 * Dashboard Layout
 *
 * Streamlined layout for authenticated users.
 * Features:
 * - Header-only navigation (no sidebar)
 * - Full-width content area
 * - Clean, premium design
 * - Mobile responsive
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth-options';
import { Header } from '@/components/layout/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  // Check authentication session
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  // Use actual session user
  const user = {
    id: session.user.id,
    name: session.user.name || `${session.user.firstName} ${session.user.lastName}`.trim(),
    email: session.user.email!,
    image: session.user.avatarUrl || null,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <Header user={user} />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
