/**
 * Member Layout
 * Sidebar layout with navigation for member dashboard
 */

import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
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
import {
  Home,
  User,
  CreditCard,
  Wrench,
  Phone,
  ChevronRight,
  Settings,
  FileText,
  Award,
  Receipt,
} from 'lucide-react';

interface MemberLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: typeof Home;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Overview', path: '/member' },
  { icon: Wrench, label: 'Services', path: '/member/services' },
  { icon: FileText, label: 'Jobs & Invoices', path: '/member/jobs' },
  { icon: Award, label: 'Certificates', path: '/member/certificates' },
  { icon: Receipt, label: 'Billing', path: '/member/billing' },
  { icon: User, label: 'Profile', path: '/member/profile' },
];

export function MemberLayout({ children }: MemberLayoutProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-20 border-r flex flex-col items-center py-6 gap-8">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <img src="/heatplex-logo.png" alt="Heat Plex" className="h-8 w-8 object-contain" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-4 w-full items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`
                  cursor-pointer flex items-center justify-center w-12 h-12 rounded-lg transition-colors
                  ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }
                `}
                title={item.label}
              >
                <Icon className="size-5" />
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-4 items-center">
          <button
            className="cursor-pointer flex items-center justify-center w-12 h-12 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Contact Support"
          >
            <Phone className="size-5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer flex items-center justify-center w-12 h-12 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
              <Settings className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" side="right">
              <DropdownMenuLabel>Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                Privacy
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <LogoutButton variant="ghost" size="sm" className="w-full justify-start px-2" showIcon={false} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              {/* Breadcrumb or page title can go here */}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent">
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    {user && 'first_name' in user ? `${user.first_name} ${user.last_name}` : user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user && 'phone' in user ? user.phone : ''}
                  </p>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user && 'first_name' in user
                      ? `${user.first_name[0]}${user.last_name?.[0] || ''}`
                      : user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <ChevronRight className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-semibold">
                      {user && 'first_name' in user ? `${user.first_name} ${user.last_name}` : 'My Account'}
                    </p>
                    <p className="text-xs font-normal text-muted-foreground mt-1">
                      {user && 'email' in user ? user.email : ''}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/member/profile')}>
                  <User className="mr-2 size-4" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/member/membership')}>
                  <CreditCard className="mr-2 size-4" />
                  Membership Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <LogoutButton variant="ghost" size="sm" className="w-full justify-start px-2" showIcon={true} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="px-6 py-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
