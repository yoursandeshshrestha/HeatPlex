import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useStaff } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/components/ui/loading-screen';
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
import { AlertTriangle, CheckCircle2, Bell, ShieldAlert } from 'lucide-react';

type AlertRow = {
  id: string;
  type: string;
  severity: string;
  title: string;
  body: string | null;
  created_at: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  member_id: string | null;
};

function severityBadgeClass(severity: string): string {
  if (severity === 'critical') return 'bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400';
  if (severity === 'high') return 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400';
  if (severity === 'medium') return 'bg-sky-500/10 text-sky-700 hover:bg-sky-500/20 dark:text-sky-400';
  return 'bg-muted text-muted-foreground';
}

export function AlertsPage() {
  const staff = useStaff();
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('open');

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);

      if (filter === 'open') {
        query = query.is('resolved_at', null);
      } else if (filter === 'resolved') {
        query = query.not('resolved_at', 'is', null);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAlerts((data ?? []) as AlertRow[]);
    } catch (error) {
      console.error('Failed to load alerts:', error);
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  async function resolveAlert(alertId: string) {
    if (!staff) return;
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from('alerts')
        .update({ resolved_at: nowIso, resolved_by: staff.id })
        .eq('id', alertId);
      if (error) throw error;
      toast.success('Alert marked as resolved');
      await loadAlerts();
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      toast.error('Failed to resolve alert');
    }
  }

  async function reopenAlert(alertId: string) {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ resolved_at: null, resolved_by: null })
        .eq('id', alertId);
      if (error) throw error;
      toast.success('Alert reopened');
      await loadAlerts();
    } catch (error) {
      console.error('Failed to reopen alert:', error);
      toast.error('Failed to reopen alert');
    }
  }

  const openCount = useMemo(() => alerts.filter((a) => !a.resolved_at).length, [alerts]);
  const resolvedCount = useMemo(() => alerts.filter((a) => !!a.resolved_at).length, [alerts]);
  const criticalOpenCount = useMemo(
    () => alerts.filter((a) => !a.resolved_at && a.severity === 'critical').length,
    [alerts]
  );

  if (initialLoading) {
    return <LoadingScreen message="Loading alerts..." />;
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
        <p className="text-muted-foreground">Monitor and resolve operational incidents</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Open Alerts</div>
          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Bell className="size-5 text-amber-500" />
            {openCount}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Critical Open</div>
          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <ShieldAlert className="size-5 text-red-500" />
            {criticalOpenCount}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Resolved</div>
          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <CheckCircle2 className="size-5 text-emerald-500" />
            {resolvedCount}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
          <Button
            variant={filter === 'open' ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer"
            onClick={() => setFilter('open')}
          >
            Open
          </Button>
          <Button
            variant={filter === 'resolved' ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer"
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            className="cursor-pointer"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Created</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  Loading alerts...
                </TableCell>
              </TableRow>
            ) : alerts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No alerts for this filter.
                </TableCell>
              </TableRow>
            ) : (
              alerts.map((alert) => {
                const isResolved = !!alert.resolved_at;
                return (
                  <TableRow key={alert.id}>
                    <TableCell>
                      {alert.created_at ? format(new Date(alert.created_at), 'dd MMM yyyy HH:mm') : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{alert.type}</TableCell>
                    <TableCell>
                      <div className="font-medium">{alert.title}</div>
                      {alert.body ? (
                        <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">{alert.body}</div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge className={severityBadgeClass(alert.severity)}>{alert.severity}</Badge>
                    </TableCell>
                    <TableCell>
                      {isResolved ? (
                        <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400">
                          resolved
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400">
                          open
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isResolved ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => void reopenAlert(alert.id)}
                        >
                          Reopen
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="cursor-pointer"
                          onClick={() => void resolveAlert(alert.id)}
                        >
                          <AlertTriangle className="mr-2 size-4" />
                          Resolve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
