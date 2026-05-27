/**
 * Engineers Leaderboard Page
 * Track engineer performance and conversion rates
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from '@/components/ui/combobox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Copy, Check, CheckCircle2, AlertTriangle, Minus, Download, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { supabase } from '@/lib/supabase';
import { getTopEngineers, type EngineerStats } from '@/lib/supabase/queries';
import { type TimeWindow, getDateRangeFromWindow } from './components/TimeWindowSelector';
import { StatsCards } from './components/StatsCards';

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

function formatWhatsAppLeaderboard(engineers: EngineerStats[], window: string): string {
  const lines = [
    `🏆 *Engineer Leaderboard - ${window}*`,
    '',
  ];

  engineers.forEach((eng, index) => {
    const rank = index + 1;
    const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
    const status = eng.conversionRate >= 10 ? '✅' : eng.conversionRate >= 8 ? '⚠️' : '❌';

    lines.push(
      `${medal} *${eng.name}* ${status}`,
      `   Jobs: ${eng.jobsCompleted} | Sold: ${eng.membershipsSold} | Conv: ${eng.conversionRate}%`,
      ''
    );
  });

  lines.push('Keep up the great work! 💪');

  return lines.join('\n');
}

export function EngineersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [engineers, setEngineers] = useState<EngineerStats[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [engineerToDelete, setEngineerToDelete] = useState<EngineerStats | null>(null);
  const [deleting, setDeleting] = useState(false);

  const timeWindow = (searchParams.get('period') || 'this_week') as TimeWindow;

  async function handleDeleteEngineer() {
    if (!engineerToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('engineers')
        .delete()
        .eq('id', engineerToDelete.id);

      if (error) throw error;

      toast.success('Engineer deleted successfully');
      setDeleteDialogOpen(false);
      setEngineerToDelete(null);
      loadEngineers();
    } catch (error) {
      console.error('Error deleting engineer:', error);
      toast.error('Failed to delete engineer');
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    loadEngineers();
  }, [timeWindow]);

  async function loadEngineers() {
    setLoading(true);
    try {
      const dateRange = getDateRangeFromWindow(timeWindow);
      const data = await getTopEngineers(dateRange, 100);
      setEngineers(data);
    } catch (error) {
      console.error('Failed to load engineers:', error);
      toast.error('Failed to load engineer data');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  function handleCopyForWhatsApp() {
    const windowLabel = timeWindow.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const text = formatWhatsAppLeaderboard(engineers, windowLabel);

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Leaderboard copied!', {
        description: 'Ready to paste into WhatsApp',
      });
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  }

  const totalJobs = engineers.reduce((sum, e) => sum + e.jobsCompleted, 0);
  const totalSold = engineers.reduce((sum, e) => sum + e.membershipsSold, 0);
  const avgConversion = engineers.length > 0
    ? engineers.reduce((sum, e) => sum + e.conversionRate, 0) / engineers.length
    : 0;
  const totalCommission = engineers.reduce((sum, e) => sum + e.commissionEarned, 0);

  const periodLabels: Record<TimeWindow, string> = {
    this_week: 'This week',
    last_week: 'Last week',
    this_month: 'This month',
    all_time: 'All time',
  };

  if (initialLoading) {
    return <LoadingScreen message="Loading engineers..." />;
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Engineers</h1>
          <p className="text-muted-foreground">
            Performance leaderboard and conversion tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Combobox
            value={timeWindow}
            onValueChange={(value) => {
              if (value) {
                setSearchParams({ period: value });
              }
            }}
          >
            <ComboboxInput placeholder="Select period" className="h-9 w-[160px] cursor-pointer" />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem value="this_week" className="cursor-pointer">This Week</ComboboxItem>
                <ComboboxItem value="last_week" className="cursor-pointer">Last Week</ComboboxItem>
                <ComboboxItem value="this_month" className="cursor-pointer">This Month</ComboboxItem>
                <ComboboxItem value="all_time" className="cursor-pointer">All Time</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <Button
            onClick={handleCopyForWhatsApp}
            variant="outline"
            className="cursor-pointer"
            disabled={copied}
          >
            {copied ? (
              <>
                <Check className="mr-2 size-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-2 size-4" />
                Copy for WhatsApp
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards
        totalJobs={totalJobs}
        totalSold={totalSold}
        avgConversion={avgConversion}
        totalCommission={totalCommission}
        periodLabel={periodLabels[timeWindow]}
      />

      {/* Legend */}
      <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
        <span className="text-sm font-medium text-muted-foreground">Status:</span>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span className="text-sm">≥ 10% (Excellent)</span>
        </div>
        <div className="flex items-center gap-2">
          <Minus className="size-4 text-amber-600" />
          <span className="text-sm">8-10% (Good)</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-red-600" />
          <span className="text-sm">&lt; 8% (Needs Coaching)</span>
        </div>
      </div>

      {/* Leaderboard Table */}
      <Card className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="text-sm font-medium">
            Leaderboard ({engineers.length} engineers)
          </div>
          <Button className="cursor-pointer">
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        </div>
        <div className="relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
              <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Rank</TableHead>
                <TableHead>Engineer</TableHead>
                <TableHead className="text-right">Jobs</TableHead>
                <TableHead className="text-right">Offered</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Offer Rate</TableHead>
                <TableHead className="text-right">Conv. Rate</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={loading ? 'opacity-50' : ''}>
              {engineers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-sm">
                    No engineer data for this period
                  </TableCell>
                </TableRow>
              ) : (
                engineers.map((engineer, index) => {
                  const rank = index + 1;
                  return (
                    <TableRow
                      key={engineer.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => {
                        toast.info('Engineer detail page coming soon');
                      }}
                    >
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
                      <TableCell className="text-right text-muted-foreground">
                        {engineer.membershipsOffered}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {engineer.membershipsSold}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {engineer.offerRate}%
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {engineer.conversionRate}%
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        £{engineer.commissionEarned}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {getStatusIcon(engineer.conversionRate)}
                          {getStatusBadge(engineer.conversionRate)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEngineerToDelete(engineer);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Engineer?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{engineerToDelete?.name}</strong>?
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEngineer}
              disabled={deleting}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
