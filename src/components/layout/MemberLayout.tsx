/**
 * Member Layout
 * Simple layout for member dashboard (no sidebar, just header)
 */

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogoutButton } from '@/components/auth/LogoutButton';

interface MemberLayoutProps {
  children: ReactNode;
}

export function MemberLayout({ children }: MemberLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Member Header */}
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <img src="/heatplex-logo.png" alt="Heat Plex" className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user && 'first_name' in user
                      ? `${user.first_name[0]}${user.last_name?.[0] || ''}`
                      : user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {user && 'first_name' in user ? `${user.first_name} ${user.last_name}` : user?.email}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Membership Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton variant="ghost" size="sm" className="w-full justify-start px-2" showIcon={false} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
