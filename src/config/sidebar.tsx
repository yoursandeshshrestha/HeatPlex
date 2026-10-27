import type { ReactElement } from 'react'
import {
  LayoutDashboard,
  Users,
  Wrench,
  Calendar,
  DollarSign,
  Bell,
  FileText,
  Settings,
  UserCog,
  Mail,
} from 'lucide-react'

interface NavItem {
  title: string
  href?: string
  icon: ReactElement
  badge?: string | number
  children?: NavItem[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

export const sidebarConfig: NavGroup[] = [
  {
    label: 'Main',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: <LayoutDashboard className="size-4 shrink-0" />,
      },
      {
        title: 'Members',
        href: '/dashboard/members',
        icon: <Users className="size-4 shrink-0" />,
      },
      {
        title: 'Team',
        href: '/dashboard/team',
        icon: <UserCog className="size-4 shrink-0" />,
      },
      {
        title: 'Engineers',
        href: '/dashboard/engineers',
        icon: <Wrench className="size-4 shrink-0" />,
      },
      {
        title: 'Bookings',
        href: '/dashboard/bookings',
        icon: <Calendar className="size-4 shrink-0" />,
      },
      {
        title: 'Commissions',
        href: '/dashboard/commissions',
        icon: <DollarSign className="size-4 shrink-0" />,
      },
      {
        title: 'Email Logs',
        href: '/dashboard/emails',
        icon: <Mail className="size-4 shrink-0" />,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        title: 'Alerts',
        href: '/dashboard/alerts',
        icon: <Bell className="size-4 shrink-0" />,
        badge: 0,
      },
      {
        title: 'Audit Log',
        href: '/dashboard/audit',
        icon: <FileText className="size-4 shrink-0" />,
      },
      {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: <Settings className="size-4 shrink-0" />,
      },
    ],
  },
]
