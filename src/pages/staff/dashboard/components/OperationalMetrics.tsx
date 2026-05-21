/**
 * Operational Metrics
 * Secondary KPIs for business operations
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, Mail, Percent, Clock } from 'lucide-react';
import type { OperationalKPIs } from '@/lib/supabase/queries';

interface OperationalMetricsProps {
  metrics: OperationalKPIs;
}

interface StatItemProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatItem({ label, value, icon }: StatItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function OperationalMetrics({ metrics }: OperationalMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <StatItem
            label="Jobs Completed"
            value={metrics.jobsCompleted}
            icon={<Wrench className="size-5 text-muted-foreground" />}
          />

          <StatItem
            label="Offer Rate"
            value={`${metrics.offerRate}%`}
            icon={<Percent className="size-5 text-muted-foreground" />}
          />

          <StatItem
            label="Email Open Rate (24h)"
            value={`${metrics.emailOpenRate}%`}
            icon={<Mail className="size-5 text-muted-foreground" />}
          />

          <StatItem
            label="Email Conversion"
            value={`${metrics.emailConversionRate}%`}
            icon={<Percent className="size-5 text-muted-foreground" />}
          />

          <StatItem
            label="Avg Days to Signup"
            value={metrics.avgDaysToSignup.toFixed(1)}
            icon={<Clock className="size-5 text-muted-foreground" />}
          />
        </div>
      </CardContent>
    </Card>
  );
}
