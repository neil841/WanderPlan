/**
 * Premium Header Component
 *
 * Features:
 * - Premium travel-themed design
 * - Gradient logo with WanderPlan branding
 * - Navigation links (My Trips, Dashboard)
 * - Notification bell
 * - User menu dropdown
 * - Mobile hamburger menu
 * - Sticky header with backdrop blur
 * - Responsive design
 */

'use client';

import { useState } from 'react';
import { Menu, Plane, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserMenu } from '@/components/layout/UserMenu';
import { MobileNav } from '@/components/layout/MobileNav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
  const pathname = usePathname();

  const navLinks = [
    { href: '/trips', label: 'My Trips' },
  ];

  const isActive = (href: string) => {
    if (href === '/trips') {
      return pathname === '/trips' || pathname?.startsWith('/trips/');
    }
    return pathname === href;
  };

  // Mock notification count - replace with real data
  const notificationCount = 3;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left: Logo + Navigation */}
          <div className="flex items-center gap-8">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>

            {/* Logo */}
            <Link href="/trips" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 shadow-md transition-all group-hover:shadow-lg">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="hidden text-xl font-bold text-gray-900 sm:block">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  WanderPlan
                </span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${isActive(link.href)
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right: Notifications + User Menu */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Link href="/notifications">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-gray-100"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5 text-gray-600" />
                {notificationCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-[10px] font-bold text-white">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            <UserMenu user={user} />
          </div>
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
