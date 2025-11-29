/**
 * Sidebar Component - Premium Redesign
 *
 * Features:
 * - Rich navigation with icons
 * - Premium upgrade CTA
 * - User profile section
 * - No fake data shown to new users
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  User,
  Settings,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
  className?: string;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'My Trips',
    href: '/trips',
    icon: MapPin,
  },
  {
    label: 'Profile',
    href: '/settings/profile',
    icon: User,
  },
  {
    label: 'Settings',
    href: '/settings/notifications',
    icon: Settings,
  },
];

export function Sidebar({ user, className }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen w-64 flex flex-col border-r border-slate-200/60 bg-white',
        className
      )}
    >
      {/* Navigation */}
      <nav
        className="flex-1 space-y-1 px-3 py-6"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              )}
              aria-current={active ? 'page' : undefined}
            >
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50"
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}

              {/* Icon */}
              <Icon
                className={cn(
                  'relative z-10 h-5 w-5 transition-colors',
                  active
                    ? 'text-blue-600'
                    : 'text-slate-400 group-hover:text-slate-600'
                )}
                aria-hidden="true"
              />

              {/* Label */}
              <span className="relative z-10">{item.label}</span>

              {/* Hover effect */}
              {!active && (
                <div className="absolute inset-0 rounded-lg bg-slate-50 opacity-0 transition-opacity group-hover:opacity-100" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Premium Upgrade CTA */}
      <div className="px-3 pb-4">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 p-4">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

          <div className="relative">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2 py-1">
              <Sparkles className="h-3 w-3 text-white" />
              <span className="text-xs font-medium text-white">Premium</span>
            </div>

            <h3 className="mb-1 text-sm font-bold text-white">Unlock Pro Features</h3>
            <p className="mb-3 text-xs text-white/80">Unlimited trips, AI suggestions & more</p>

            <button className="w-full rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-purple-600 transition-transform hover:scale-105">
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="border-t border-slate-200/60 p-4">
        <div className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-slate-50 to-blue-50/50 p-3">
          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-md">
            {user.name
              ? user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : user.email?.charAt(0).toUpperCase() || 'U'}
          </div>

          {/* User Info */}
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-semibold text-slate-900">
              {user.name || 'User'}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user.email || ''}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
