/**
 * Member Status Badge
 * Visual indicator for member status
 */

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MemberStatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'border-amber-500/30 text-amber-700 dark:text-amber-400',
  },
  active: {
    label: 'Active',
    className: 'border-emerald-500/30 text-emerald-700 dark:text-emerald-400',
  },
  payment_overdue: {
    label: 'Payment overdue',
    className: 'border-red-500/30 text-red-700 dark:text-red-400',
  },
  suspended: {
    label: 'Suspended',
    className: 'border-orange-500/30 text-orange-700 dark:text-orange-400',
  },
  cancellation_requested: {
    label: 'Cancellation requested',
    className: 'border-yellow-500/30 text-yellow-700 dark:text-yellow-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'border-border text-muted-foreground',
  },
  expired: {
    label: 'Expired',
    className: 'border-border text-muted-foreground',
  },
  deletion_requested: {
    label: 'Deletion requested',
    className: 'border-red-500/30 text-red-700 dark:text-red-400',
  },
};

export function MemberStatusBadge({ status }: MemberStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status.replace(/_/g, ' '),
    className: 'border-border text-muted-foreground',
  };

  return (
    <Badge variant="outline" className={cn('font-normal capitalize', config.className)}>
      {config.label}
    </Badge>
  );
}
