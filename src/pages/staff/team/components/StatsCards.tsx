import { Card } from '@/components/ui/card';
import { Users, UserCog, Shield, Crown } from 'lucide-react';
import { Area, AreaChart } from 'recharts';

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
            vs last week
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

interface Stats {
  total: number;
  active: number;
  admins: number;
  owners: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Staff"
        value={stats.total}
        change={5.2}
        icon={<Users className="size-4" />}
        data={[10, 12, 11, 13, 14, 15, 16]}
      />
      <StatCard
        title="Active"
        value={stats.active}
        change={3.1}
        icon={<UserCog className="size-4" />}
        data={[10, 11, 10, 12, 13, 14, 15]}
      />
      <StatCard
        title="Admins"
        value={stats.admins}
        change={0}
        icon={<Shield className="size-4" />}
        data={[5, 5, 5, 5, 5, 5, 5]}
      />
      <StatCard
        title="Owners"
        value={stats.owners}
        change={0}
        icon={<Crown className="size-4" />}
        data={[3, 3, 3, 3, 3, 3, 3]}
      />
    </div>
  );
}
