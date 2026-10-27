import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

type AuditLogRow = {
  id: string;
  created_at: string;
  action_type: string;
  summary: string | null;
  target_type: string | null;
  target_id: string | null;
  staff_id: string;
};

export function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_log')
        .select('id, created_at, action_type, summary, target_type, target_id, staff_id')
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      setLogs((data ?? []) as AuditLogRow[]);
    } catch (error) {
      console.error('Failed to load audit log:', error);
      toast.error('Failed to load audit log');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  if (initialLoading) {
    return <LoadingScreen message="Loading audit log..." />;
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">Trace admin actions across members and settings</p>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Staff ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Loading audit entries...
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No audit entries yet.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{format(new Date(log.created_at), 'dd MMM yyyy HH:mm:ss')}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {log.action_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{log.summary ?? '-'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {log.target_type && log.target_id ? `${log.target_type}:${log.target_id}` : '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.staff_id}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
