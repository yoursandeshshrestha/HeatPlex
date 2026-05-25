/**
 * Shared layout primitives for staff member detail pages
 */

import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const shellClass = 'rounded-2xl bg-muted/40 p-2';
const innerCardClass =
  'rounded-xl bg-card py-0 shadow-sm ring-1 ring-border/60 transition-colors';

export function DetailSection({
  title,
  action,
  children,
  className,
  flushList,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  flushList?: boolean;
}) {
  return (
    <div className={cn(shellClass, className)}>
      <div className="mb-2 flex items-center justify-between gap-2 px-1.5 pt-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {action}
      </div>
      <Card className={cn(innerCardClass, flushList ? 'px-0 py-0' : 'px-6 py-6')}>
        {children}
      </Card>
    </div>
  );
}

export function DetailGrid({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {item.label}
          </p>
          <div className="mt-1.5 text-sm font-medium leading-snug text-foreground">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function DetailStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
}) {
  return (
    <div className={shellClass}>
      <p className="mb-2 px-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <Card className={cn(innerCardClass, 'px-5 py-5')}>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      </Card>
    </div>
  );
}

export function DetailEmpty({
  message,
  hint,
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function DetailLoading() {
  return (
    <div className="flex justify-center py-16">
      <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

export function MemberAvatar({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground ring-1 ring-border/60">
      {initials}
    </div>
  );
}
