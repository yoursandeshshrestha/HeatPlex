/**
 * Operational Metrics Cards
 * Secondary KPIs with sparkline charts
 */

import { Card } from '@/components/ui/card';
import { Wrench, Mail, Percent, Clock, Target } from 'lucide-react';
import { Area, AreaChart } from 'recharts';
import type { OperationalKPIs } from '@/lib/supabase/queries';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  data: number[];
}

function StatCard({ title, value, change, icon, data }: StatCardProps) {
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
              {isPositive ? '+' : ''}{change}%
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

interface OperationalMetricsCardsProps {
  metrics: OperationalKPIs;
}

export function OperationalMetricsCards({ metrics }: OperationalMetricsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Jobs Completed"
        value={metrics.jobsCompleted}
        change={5.2}
        icon={<Wrench className="size-4" />}
        data={[45, 50, 48, 55, 52, 58, metrics.jobsCompleted > 0 ? metrics.jobsCompleted : 60]}
      />

      <StatCard
        title="Offer Rate"
        value={`${metrics.offerRate}%`}
        change={2.8}
        icon={<Target className="size-4" />}
        data={[78, 80, 82, 81, 84, 83, metrics.offerRate]}
      />

      <StatCard
        title="Email Open Rate"
        value={`${metrics.emailOpenRate}%`}
        change={4.5}
        icon={<Mail className="size-4" />}
        data={[38, 40, 39, 41, 40, 43, metrics.emailOpenRate]}
      />

      <StatCard
        title="Email Conversion"
        value={`${metrics.emailConversionRate}%`}
        change={1.2}
        icon={<Percent className="size-4" />}
        data={[6, 6.5, 7, 7.5, 7.2, 7.8, metrics.emailConversionRate]}
      />

      <StatCard
        title="Avg Days to Signup"
        value={metrics.avgDaysToSignup.toFixed(1)}
        change={-8.5}
        icon={<Clock className="size-4" />}
        data={[5, 4.8, 4.5, 4.2, 3.8, 3.6, metrics.avgDaysToSignup]}
      />
    </div>
  );
}
