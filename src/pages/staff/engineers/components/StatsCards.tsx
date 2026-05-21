import { Card } from '@/components/ui/card';
import { Wrench, UserCheck, TrendingUp, DollarSign } from 'lucide-react';
import { Area, AreaChart } from 'recharts';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  data: number[];
}

function StatCard({ title, value, subtitle, icon, data }: StatCardProps) {
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
            {subtitle}
          </div>
        </div>
        <div className="h-10 w-20">
          <AreaChart width={80} height={40} data={chartData}>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              strokeWidth={1.5}
            />
          </AreaChart>
        </div>
      </div>
    </Card>
  );
}

interface StatsCardsProps {
  totalJobs: number;
  totalSold: number;
  avgConversion: number;
  totalCommission: number;
  periodLabel: string;
}

export function StatsCards({
  totalJobs,
  totalSold,
  avgConversion,
  totalCommission,
  periodLabel,
}: StatsCardsProps) {
  // Generate sparkline data based on current values
  const generateSparkline = (current: number) => {
    if (current === 0) return [0, 0, 0, 0, 0, 0, 0];
    return [
      Math.round(current * 0.7),
      Math.round(current * 0.75),
      Math.round(current * 0.8),
      Math.round(current * 0.85),
      Math.round(current * 0.9),
      Math.round(current * 0.95),
      current,
    ];
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Jobs"
        value={totalJobs}
        subtitle={periodLabel}
        icon={<Wrench className="size-4" />}
        data={generateSparkline(totalJobs)}
      />
      <StatCard
        title="Total Sold"
        value={totalSold}
        subtitle={periodLabel}
        icon={<UserCheck className="size-4" />}
        data={generateSparkline(totalSold)}
      />
      <StatCard
        title="Avg Conversion"
        value={`${avgConversion.toFixed(1)}%`}
        subtitle={periodLabel}
        icon={<TrendingUp className="size-4" />}
        data={generateSparkline(Math.round(avgConversion))}
      />
      <StatCard
        title="Total Commission"
        value={`£${totalCommission}`}
        subtitle={periodLabel}
        icon={<DollarSign className="size-4" />}
        data={generateSparkline(totalCommission)}
      />
    </div>
  );
}
