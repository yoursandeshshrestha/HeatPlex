/**
 * Top Engineers Card
 * Shows top 3 performing engineers by conversion rate
 */

import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowRight, CheckCircle2, AlertTriangle, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EngineerStats } from '@/lib/supabase/queries';

interface TopEngineersCardProps {
  engineers: EngineerStats[];
}

function getStatusIcon(conversionRate: number) {
  if (conversionRate >= 10) {
    return <CheckCircle2 className="size-4 text-emerald-600" />;
  }
  if (conversionRate >= 8) {
    return <Minus className="size-4 text-amber-600" />;
  }
  return <AlertTriangle className="size-4 text-red-600" />;
}

function getStatusBadge(conversionRate: number) {
  if (conversionRate >= 10) {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400">
        ≥ 10%
      </Badge>
    );
  }
  if (conversionRate >= 8) {
    return (
      <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400">
        8-10%
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400">
      &lt; 8%
    </Badge>
  );
}

export function TopEngineersCard({ engineers }: TopEngineersCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b p-4">
        <div className="text-sm font-medium">Top Engineers ({engineers.length})</div>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => navigate('/staff/engineers')}
        >
          View All
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
      <div className="relative overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Rank</TableHead>
              <TableHead>Engineer</TableHead>
              <TableHead className="text-right">Jobs</TableHead>
              <TableHead className="text-right">Sold</TableHead>
              <TableHead className="text-right">Conv.</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {engineers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-sm">
                  No engineer data for this period
                </TableCell>
              </TableRow>
            ) : (
              engineers.map((engineer, index) => {
                const rank = index + 1;
                return (
                  <TableRow key={engineer.id} className="cursor-pointer hover:bg-muted/30">
                    <TableCell>
                      <div
                        className={cn(
                          'flex size-8 items-center justify-center rounded-full text-sm font-semibold',
                          rank === 1 &&
                            'bg-amber-500/15 text-amber-700 dark:text-amber-400',
                          rank === 2 &&
                            'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
                          rank === 3 &&
                            'bg-orange-500/15 text-orange-700 dark:text-orange-400',
                          rank > 3 && 'text-muted-foreground'
                        )}
                      >
                        {rank}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{engineer.name}</TableCell>
                    <TableCell className="text-right font-medium">
                      {engineer.jobsCompleted}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {engineer.membershipsSold}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {engineer.conversionRate}%
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getStatusIcon(engineer.conversionRate)}
                        {getStatusBadge(engineer.conversionRate)}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
