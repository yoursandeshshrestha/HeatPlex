import type { ReactElement } from 'react'
import {
  LayoutDashboard,
  Users,
  Wrench,
  DollarSign,
  Bell,
  FileText,
  Settings,
  UserCog,
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
        href: '/staff',
        icon: <LayoutDashboard className="size-4 shrink-0" />,
      },
      {
        title: 'Members',
        href: '/staff/members',
        icon: <Users className="size-4 shrink-0" />,
      },
      {
        title: 'Team',
        href: '/staff/team',
        icon: <UserCog className="size-4 shrink-0" />,
      },
      {
        title: 'Engineers',
        href: '/staff/engineers',
        icon: <Wrench className="size-4 shrink-0" />,
      },
      {
        title: 'Commissions',
        href: '/staff/commissions',
        icon: <DollarSign className="size-4 shrink-0" />,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        title: 'Alerts',
        href: '/staff/alerts',
        icon: <Bell className="size-4 shrink-0" />,
        badge: 0,
      },
      {
        title: 'Audit Log',
        href: '/staff/audit',
        icon: <FileText className="size-4 shrink-0" />,
      },
      {
        title: 'Settings',
        href: '/staff/settings',
        icon: <Settings className="size-4 shrink-0" />,
      },
    ],
  },
]
