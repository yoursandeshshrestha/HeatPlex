/**
 * Top Engineers Preview
 * Shows top 3 performing engineers by conversion rate
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EngineerStats } from '@/lib/supabase/queries';

interface TopEngineersProps {
  engineers: EngineerStats[];
}

interface EngineerRowProps {
  engineer: EngineerStats;
  rank: number;
}

function getStatusBadge(conversionRate: number) {
  if (conversionRate >= 10) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400">
        <TrendingUp className="mr-1 size-3" />
        Excellent
      </Badge>
    );
  }
  if (conversionRate >= 8) {
    return (
      <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400">
        Good
      </Badge>
    );
  }
  return (
    <Badge variant="destructive" className="bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400">
      <AlertTriangle className="mr-1 size-3" />
      Needs Coaching
    </Badge>
  );
}

function EngineerRow({ engineer, rank }: EngineerRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-border/60 py-4 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
            rank === 1 && 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
            rank === 2 && 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
            rank === 3 && 'bg-orange-500/15 text-orange-700 dark:text-orange-400'
          )}
        >
          #{rank}
        </div>
        <div className="min-w-0">
          <p className="font-medium">{engineer.name}</p>
          <p className="text-sm text-muted-foreground">
            {engineer.jobsCompleted} jobs · {engineer.membershipsSold} sold
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold">{engineer.conversionRate}%</p>
          <p className="text-xs text-muted-foreground">conversion</p>
        </div>
        {getStatusBadge(engineer.conversionRate)}
      </div>
    </div>
  );
}

export function TopEngineers({ engineers }: TopEngineersProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Engineers</CardTitle>
        <Button variant="ghost" size="sm" className="cursor-pointer">
          View All
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {engineers.length > 0 ? (
          <div>
            {engineers.map((engineer, index) => (
              <EngineerRow key={engineer.id} engineer={engineer} rank={index + 1} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No engineer data available for this period
          </p>
        )}
      </CardContent>
    </Card>
  );
}
