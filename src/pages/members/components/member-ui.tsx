/**
 * Shared layout primitives for member portal pages
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const SUPPORT_PHONE = '02076220444';
export const SUPPORT_PHONE_DISPLAY = '020 7622 0444';

export const memberStatusColors: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  payment_overdue: 'bg-red-500/15 text-red-400 border-red-500/25',
  suspended: 'bg-muted text-muted-foreground border-border',
  cancelled: 'bg-muted text-muted-foreground border-border',
};

const shellClass = 'rounded-2xl bg-muted/40 p-2';
const innerCardClass =
  'rounded-xl bg-card py-0 shadow-sm ring-1 ring-border/60 transition-colors';

function ShellLabel({
  title,
  icon: Icon,
  action,
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2 px-1.5 pt-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </span>
      {(action || Icon) && (
        <div className="flex shrink-0 items-center gap-2">
          {action}
          {Icon && (
            <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="size-3.5" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function StatPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className={shellClass}>
      <ShellLabel title={title} icon={Icon} />
      <Card className={cn(innerCardClass, 'px-5 py-5')}>{children}</Card>
    </div>
  );
}

export function SectionPanel({
  title,
  icon,
  action,
  children,
  className,
  id,
  flushList,
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
  flushList?: boolean;
}) {
  return (
    <div id={id} className={cn(shellClass, className)}>
      <ShellLabel title={title} icon={icon} action={action} />
      <Card className={cn(innerCardClass, flushList ? 'px-6 py-0' : 'px-6 py-6')}>
        {children}
      </Card>
    </div>
  );
}

export function PanelEmpty({
  message,
  hint,
  flush,
}: {
  message: string;
  hint?: string;
  flush?: boolean;
}) {
  return (
    <div className={cn('text-center', flush ? 'px-6 py-10' : 'py-8')}>
      <p className="text-sm text-muted-foreground">{message}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function DetailGrid({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn('min-w-0', index > 0 && 'lg:border-l lg:border-border/60 lg:pl-4')}
        >
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-1.5 text-sm font-medium leading-snug">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export const membershipBenefits = [
  {
    title: '20% off all works',
    detail: 'Automatic member pricing on every repair, installation, and call-out.',
    value: '20% off',
  },
  {
    title: 'Free annual boiler service',
    detail: 'One full service visit each year to keep your boiler running safely.',
    value: 'Worth £120',
  },
  {
    title: 'Free Gas Safety Certificate',
    detail: 'Your annual CP12 certificate — included for landlords and homeowners.',
    value: 'Worth £80',
  },
  {
    title: 'Priority booking',
    detail: 'Reserve service slots before they open to the general public.',
    value: 'Members first',
  },
] as const;

export function BenefitsList() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {membershipBenefits.map((benefit) => (
        <div
          key={benefit.title}
          className="flex gap-4 rounded-xl border border-border/60 bg-muted/20 p-4"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold leading-snug">{benefit.title}</p>
              <span className="shrink-0 rounded-md border border-border/80 bg-card px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {benefit.value}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {benefit.detail}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
