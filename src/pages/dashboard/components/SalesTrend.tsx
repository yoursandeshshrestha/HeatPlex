import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const salesData = [
  { month: 'Jan', newUser: 4000, existingUser: 2400 },
  { month: 'Feb', newUser: 3000, existingUser: 1398 },
  { month: 'Mar', newUser: 5000, existingUser: 3800 },
  { month: 'Apr', newUser: 4500, existingUser: 3908 },
  { month: 'May', newUser: 6000, existingUser: 4800 },
  { month: 'Jun', newUser: 5500, existingUser: 3800 },
  { month: 'Jul', newUser: 7000, existingUser: 4300 },
  { month: 'Aug', newUser: 6800, existingUser: 5200 },
  { month: 'Sep', newUser: 7500, existingUser: 6100 },
  { month: 'Oct', newUser: 8200, existingUser: 7000 },
  { month: 'Nov', newUser: 8800, existingUser: 7800 },
  { month: 'Dec', newUser: 9500, existingUser: 8500 },
]

const tabs = ['Weekly', 'Monthly', 'Yearly']

export function SalesTrend() {
  const [activeTab, setActiveTab] = useState('Monthly')

  return (
    <div className="flex h-full flex-col rounded-xl border bg-muted/30 pb-1.5 pl-1.5 pr-1.5 pt-3">
      <div className="mb-2 flex items-start justify-between px-1">
        <div className="text-[13px] font-medium text-muted-foreground/60">
          Sales Trend
        </div>
        <div className="text-muted-foreground/40">
          <TrendingUp className="size-4" />
        </div>
      </div>
      <Card className="flex-1 rounded-lg border px-6 pb-6 pt-6 ring-0">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h3 className="text-base font-medium text-muted-foreground">
              Total Revenue: <span className="text-foreground">$20,320</span>
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-[12px] text-muted-foreground">NEW USER</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-[12px] text-muted-foreground">EXISTING USER</span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 rounded-md bg-muted/50 p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={salesData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#9ca3af"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dx={-10}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
            />
            <Bar dataKey="newUser" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="existingUser" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
