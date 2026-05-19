import { Card } from '@/components/ui/card'
import { DollarSign, ShoppingCart, Users, Package } from 'lucide-react'
import { Area, AreaChart } from 'recharts'

interface StatCardProps {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  data: number[]
}

function StatCard({ title, value, change, icon, data }: StatCardProps) {
  const isPositive = change >= 0
  const chartData = data.map((value, index) => ({ value, index }))

  return (
    <div className="rounded-xl border border-border bg-muted/30 pb-1.5 pl-1.5 pr-1.5 pt-3">
      <div className="mb-2 flex items-start justify-between px-1">
        <div className="text-[13px] font-medium text-muted-foreground/60">
          {title}
        </div>
        <div className="text-muted-foreground/40">{icon}</div>
      </div>
      <Card className="rounded-lg border border-border px-4 pb-4 pt-10 ring-0">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight">{value}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
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
    </div>
  )
}

export function StatsCards() {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$45,231.89',
      change: 20.1,
      icon: <DollarSign className="size-4" />,
      data: [30, 40, 35, 50, 49, 60, 70],
    },
    {
      title: 'Orders',
      value: '2,345',
      change: 12.5,
      icon: <ShoppingCart className="size-4" />,
      data: [20, 30, 25, 40, 38, 45, 55],
    },
    {
      title: 'Customers',
      value: '1,234',
      change: 8.2,
      icon: <Users className="size-4" />,
      data: [15, 25, 30, 28, 35, 40, 42],
    },
    {
      title: 'Products Sold',
      value: '5,678',
      change: -3.1,
      icon: <Package className="size-4" />,
      data: [50, 45, 55, 48, 42, 40, 38],
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
