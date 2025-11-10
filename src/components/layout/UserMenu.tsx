/**
 * User Menu Component
 *
 * Dropdown menu for user actions:
 * - Profile link
 * - Settings link
 * - Sign out with confirmation
 * - User avatar and name display
 * - Keyboard accessible
 * - WCAG 2.1 AA compliant
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User, Settings, LogOut } from 'lucide-react';

interface UserMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    firstName?: string;
    lastName?: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut({
        redirect: true,
        callbackUrl: '/login',
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setIsSigningOut(false);
    }
  };

  // Get user initials for avatar fallback
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full ring-2 ring-transparent transition-all hover:ring-blue-500/20 focus-visible:ring-blue-500"
          aria-label="User menu"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl || undefined} alt={user.name || 'User avatar'} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-semibold text-white">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-56 border-slate-200 bg-white/95 backdrop-blur-xl"
      >
        {/* User Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold text-slate-900">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-slate-500 truncate">
              {user.email || ''}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-slate-200" />

        {/* Profile */}
        <DropdownMenuItem
          onClick={() => router.push('/settings/profile')}
          className="cursor-pointer focus:bg-slate-50 focus:text-slate-900"
        >
          <User className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Profile</span>
        </DropdownMenuItem>

        {/* Settings */}
        <DropdownMenuItem
          onClick={() => router.push('/settings')}
          className="cursor-pointer focus:bg-slate-50 focus:text-slate-900"
        >
          <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>Settings</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-slate-200" />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
