/**
 * Hero Metrics Cards
 * Main KPI cards for the admin dashboard
 */

import { TrendingUp, TrendingDown, Users, DollarSign, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { MemberKPIs, RevenueKPIs } from '@/lib/supabase/queries';

interface HeroMetricsProps {
  memberKPIs: MemberKPIs;
  revenueKPIs: RevenueKPIs;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: React.ReactNode;
}

function MetricCard({ title, value, subtitle, trend, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">{subtitle}</span>
          {trend && (
            <span
              className={cn(
                'flex items-center gap-0.5 font-medium',
                trend.isPositive ? 'text-emerald-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function HeroMetrics({ memberKPIs, revenueKPIs }: HeroMetricsProps) {
  const newMembersTrend =
    memberKPIs.newMembersLastPeriod > 0
      ? ((memberKPIs.newMembersCount - memberKPIs.newMembersLastPeriod) /
          memberKPIs.newMembersLastPeriod) *
        100
      : 0;

  const revenueTrend =
    revenueKPIs.lastPeriodRevenue > 0
      ? ((revenueKPIs.totalRevenue - revenueKPIs.lastPeriodRevenue) /
          revenueKPIs.lastPeriodRevenue) *
        100
      : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="New Members"
        value={memberKPIs.newMembersCount}
        subtitle="This period"
        trend={{
          value: Math.round(newMembersTrend),
          isPositive: newMembersTrend >= 0,
        }}
        icon={<Users className="size-4" />}
      />

      <MetricCard
        title="Conversion Rate"
        value={`${(memberKPIs.conversionRate * 100).toFixed(1)}%`}
        subtitle="Signups / Offers"
        icon={<Target className="size-4" />}
      />

      <MetricCard
        title="Revenue"
        value={`£${revenueKPIs.totalRevenue.toFixed(0)}`}
        subtitle={`£${revenueKPIs.annualRevenue.toFixed(0)} annual · £${revenueKPIs.monthlyRevenue.toFixed(0)} monthly`}
        trend={{
          value: Math.round(revenueTrend),
          isPositive: revenueTrend >= 0,
        }}
        icon={<DollarSign className="size-4" />}
      />

      <MetricCard
        title="Active Members"
        value={memberKPIs.totalActiveMembers}
        subtitle={`${memberKPIs.targetProgress.toFixed(0)}% of 30-day target`}
        icon={<Users className="size-4" />}
      />
    </div>
  );
}
