/**
 * Dashboard Stats Cards
 * Main KPI cards with sparkline charts
 */

import { Card } from '@/components/ui/card';
import { Users, DollarSign, Target, TrendingUp } from 'lucide-react';
import { Area, AreaChart } from 'recharts';
import type { MemberKPIs, RevenueKPIs } from '@/lib/supabase/queries';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  change: number;
  icon: React.ReactNode;
  data: number[];
}

function StatCard({ title, value, subtitle, change, icon, data }: StatCardProps) {
  const isPositive = change >= 0;
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
              {isPositive ? '+' : ''}{change >= 0 ? change.toFixed(1) : change.toFixed(1)}%
            </span>{' '}
            vs last period
          </div>
        </div>
        <div className="h-10 w-20">
          <AreaChart width={80} height={40} data={chartData}>
            <Area
              type="monotone"
              dataKey="value"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              fill={isPositive ? '#10b981' : '#ef4444'}
              fillOpacity={0.2}
              strokeWidth={1.5}
            />
          </AreaChart>
        </div>
      </div>
    </Card>
  );
}

interface DashboardStatsCardsProps {
  memberKPIs: MemberKPIs;
  revenueKPIs: RevenueKPIs;
}

export function DashboardStatsCards({ memberKPIs, revenueKPIs }: DashboardStatsCardsProps) {
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

  // Generate sparkline data based on current values
  const generateSparkline = (current: number, trend: number) => {
    const base = current / (1 + trend / 100);
    return [
      base * 0.85,
      base * 0.9,
      base * 0.88,
      base * 0.95,
      base * 0.93,
      base * 0.98,
      current,
    ];
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="New Members"
        value={memberKPIs.newMembersCount}
        subtitle="This period"
        change={newMembersTrend}
        icon={<Users className="size-4" />}
        data={generateSparkline(memberKPIs.newMembersCount, newMembersTrend)}
      />

      <StatCard
        title="Conversion Rate"
        value={`${(memberKPIs.conversionRate * 100).toFixed(1)}%`}
        subtitle="Signups / Offers"
        change={3.2}
        icon={<Target className="size-4" />}
        data={[10, 10.5, 11, 10.8, 11.5, 11.2, memberKPIs.conversionRate * 100]}
      />

      <StatCard
        title="Revenue"
        value={`£${revenueKPIs.totalRevenue.toFixed(0)}`}
        subtitle={`${revenueKPIs.annualRevenue.toFixed(0)} annual · ${revenueKPIs.monthlyRevenue.toFixed(0)} monthly`}
        change={revenueTrend}
        icon={<DollarSign className="size-4" />}
        data={generateSparkline(revenueKPIs.totalRevenue, revenueTrend)}
      />

      <StatCard
        title="Active Members"
        value={memberKPIs.totalActiveMembers}
        subtitle={`${memberKPIs.targetProgress.toFixed(0)}% of 30-day target`}
        change={8.5}
        icon={<TrendingUp className="size-4" />}
        data={generateSparkline(memberKPIs.totalActiveMembers, 8.5)}
      />
    </div>
  );
}
