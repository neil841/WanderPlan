/**
 * Dashboard Layout
 *
 * Protected layout that wraps all dashboard routes.
 * Features:
 * - Session authentication check with redirect to login
 * - Sidebar navigation (desktop)
 * - Top header with user menu
 * - Mobile responsive with hamburger menu
 * - Loading state during session check
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth-options';
import { Sidebar } from '@/components/layout/Sidebar';
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
    <div className="relative flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Desktop Sidebar */}
      <Sidebar user={user} className="hidden lg:flex" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <Header user={user} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
