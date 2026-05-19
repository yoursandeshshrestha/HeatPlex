import type { ReactElement } from 'react'
import {
  LayoutDashboard,
  Users,
  Wrench,
  DollarSign,
  Bell,
  FileText,
  Settings,
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
        href: '/admin',
        icon: <LayoutDashboard className="size-4 shrink-0" />,
      },
      {
        title: 'Members',
        href: '/admin/members',
        icon: <Users className="size-4 shrink-0" />,
      },
      {
        title: 'Engineers',
        href: '/admin/engineers',
        icon: <Wrench className="size-4 shrink-0" />,
      },
      {
        title: 'Commissions',
        href: '/admin/commissions',
        icon: <DollarSign className="size-4 shrink-0" />,
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        title: 'Alerts',
        href: '/admin/alerts',
        icon: <Bell className="size-4 shrink-0" />,
        badge: 0,
      },
      {
        title: 'Audit Log',
        href: '/admin/audit',
        icon: <FileText className="size-4 shrink-0" />,
      },
      {
        title: 'Settings',
        href: '/admin/settings',
        icon: <Settings className="size-4 shrink-0" />,
      },
    ],
  },
]
