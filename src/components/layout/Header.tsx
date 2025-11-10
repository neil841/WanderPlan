/**
 * Header Component
 *
 * Top header bar with:
 * - Mobile hamburger menu toggle
 * - Page title/breadcrumbs
 * - User menu dropdown
 * - Notifications (future)
 * - Responsive design
 * - Premium visual design
 */

'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserMenu } from '@/components/layout/UserMenu';
import { MobileNav } from '@/components/layout/MobileNav';

interface HeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    firstName?: string;
    lastName?: string;
  };
}

export function Header({ user }: HeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200/60 bg-white/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        {/* Left: Mobile menu button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>

          {/* Page Title (optional - can be made dynamic) */}
          <h1 className="hidden text-lg font-semibold text-slate-900 sm:block">
            Dashboard
          </h1>
        </div>

        {/* Right: User menu */}
        <div className="flex items-center gap-4">
          <UserMenu user={user} />
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      <MobileNav
        user={user}
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
      />
    </>
  );
}
