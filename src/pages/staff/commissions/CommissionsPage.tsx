/**
 * Commissions Page
 * Admin view to track and settle engineer commissions.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Download, PoundSterling, Wallet, Clock3, CheckCircle2 } from 'lucide-react';
import { downloadCsv, toCsv } from '@/lib/csv-utils';
import {
  type TimeWindow,
  getDateRangeFromWindow,
} from '@/pages/staff/engineers/components/TimeWindowSelector';

type CommissionRow = {
  id: string;
  engineer_id: string;
  member_id: string;
  amount_pence: number;
  status: string;
  attributed_at: string;
  paid_at: string | null;
  paid_batch_id: string | null;
  notes: string | null;
  engineer_name: string;
  member_name: string;
  member_email: string;
};

type CommissionQueryRow = {
  id: string;
  engineer_id: string;
  member_id: string;
  amount_pence: number;
  status: string;
  attributed_at: string;
  paid_at: string | null;
  paid_batch_id: string | null;
  notes: string | null;
  engineers: { name: string } | { name: string }[] | null;
  members:
    | { first_name: string | null; last_name: string | null; email: string | null }
    | { first_name: string | null; last_name: string | null; email: string | null }[]
    | null;
};

const PERIOD_LABELS: Record<TimeWindow, string> = {
  this_week: 'This week',
  last_week: 'Last week',
  this_month: 'This month',
  all_time: 'All time',
};

function formatPence(amountPence: number): string {
  return `£${(amountPence / 100).toFixed(2)}`;
}

export function CommissionsPage() {
  const [rows, setRows] = useState<CommissionRow[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [settling, setSettling] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [period, setPeriod] = useState<TimeWindow>('this_month');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadCommissions = useCallback(async () => {
    try {
      setLoading(true);
      const range = getDateRangeFromWindow(period);
      let query = supabase
        .from('engineer_commissions')
        .select(
          `
          id,
          engineer_id,
          member_id,
          amount_pence,
          status,
          attributed_at,
          paid_at,
          paid_batch_id,
          notes,
          engineers(name),
          members(first_name,last_name,email)
        `
        )
        .gte('attributed_at', format(range.from, 'yyyy-MM-dd'))
        .lte('attributed_at', format(range.to, 'yyyy-MM-dd'))
        .order('attributed_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped: CommissionRow[] = ((data ?? []) as CommissionQueryRow[]).map((item) => {
        const engineer =
          Array.isArray(item.engineers) ? item.engineers[0] : item.engineers;
        const member = Array.isArray(item.members) ? item.members[0] : item.members;
        const firstName = member?.first_name ?? '';
        const lastName = member?.last_name ?? '';
        const memberName = `${firstName} ${lastName}`.trim() || 'Unknown member';

        return {
          id: item.id,
          engineer_id: item.engineer_id,
          member_id: item.member_id,
          amount_pence: item.amount_pence,
          status: item.status,
          attributed_at: item.attributed_at,
          paid_at: item.paid_at,
          paid_batch_id: item.paid_batch_id,
          notes: item.notes,
          engineer_name: engineer?.name ?? 'Unknown engineer',
          member_name: memberName,
          member_email: member?.email ?? '-',
        };
      });

      setRows(mapped);
      setSelectedIds((prev) => prev.filter((id) => mapped.some((row) => row.id === id)));
    } catch (error) {
      console.error('Failed to load commissions:', error);
      toast.error('Failed to load commissions');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [period, statusFilter]);

  useEffect(() => {
    void loadCommissions();
  }, [loadCommissions]);

  const pendingRows = useMemo(() => rows.filter((row) => row.status === 'pending'), [rows]);
  const paidRows = useMemo(() => rows.filter((row) => row.status === 'paid'), [rows]);
  const totalAmountPence = useMemo(
    () => rows.reduce((sum, row) => sum + row.amount_pence, 0),
    [rows]
  );
  const pendingAmountPence = useMemo(
    () => pendingRows.reduce((sum, row) => sum + row.amount_pence, 0),
    [pendingRows]
  );
  const paidAmountPence = useMemo(
    () => paidRows.reduce((sum, row) => sum + row.amount_pence, 0),
    [paidRows]
  );

  const selectedPendingRows = useMemo(
    () => pendingRows.filter((row) => selectedIds.includes(row.id)),
    [pendingRows, selectedIds]
  );
  const selectedPendingAmountPence = useMemo(
    () => selectedPendingRows.reduce((sum, row) => sum + row.amount_pence, 0),
    [selectedPendingRows]
  );

  function toggleSelect(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      if (checked) return Array.from(new Set([...prev, id]));
      return prev.filter((value) => value !== id);
    });
  }

  function toggleSelectAllPending(checked: boolean) {
    if (!checked) {
      setSelectedIds((prev) => prev.filter((id) => !pendingRows.some((row) => row.id === id)));
      return;
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...pendingRows.map((row) => row.id)])));
  }

  async function markSelectedAsPaid() {
    if (selectedPendingRows.length === 0) {
      toast.error('Select at least one pending commission');
      return;
    }

    try {
      setSettling(true);
      const batchId = `batch_${Date.now()}`;
      const nowIso = new Date().toISOString();

      const { error } = await supabase
        .from('engineer_commissions')
        .update({
          status: 'paid',
          paid_at: nowIso,
          paid_batch_id: batchId,
        })
        .in(
          'id',
          selectedPendingRows.map((row) => row.id)
        );

      if (error) throw error;

      toast.success('Commissions marked as paid', {
        description: `${selectedPendingRows.length} records in ${batchId}`,
      });
      setSelectedIds([]);
      await loadCommissions();
    } catch (error) {
      console.error('Failed to settle commissions:', error);
      toast.error('Failed to mark commissions as paid');
    } finally {
      setSettling(false);
    }
  }

  function handleExportCsv() {
    const csv = toCsv(
      [
        'Attributed Date',
        'Engineer',
        'Member',
        'Member Email',
        'Amount',
        'Status',
        'Paid At',
        'Batch ID',
        'Notes',
      ],
      rows.map((row) => [
        format(new Date(row.attributed_at), 'yyyy-MM-dd'),
        row.engineer_name,
        row.member_name,
        row.member_email,
        (row.amount_pence / 100).toFixed(2),
        row.status,
        row.paid_at ? format(new Date(row.paid_at), 'yyyy-MM-dd HH:mm') : '',
        row.paid_batch_id ?? '',
        row.notes ?? '',
      ])
    );
    downloadCsv(`commissions-${period}-${Date.now()}.csv`, csv);
    toast.success('Commission CSV exported');
  }

  if (initialLoading) {
    return <LoadingScreen message="Loading commissions..." />;
  }

  const allPendingSelected =
    pendingRows.length > 0 && pendingRows.every((row) => selectedIds.includes(row.id));

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Commissions</h1>
          <p className="text-muted-foreground">
            Track engineer commission records and settle payout batches
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Combobox value={period} onValueChange={(value) => value && setPeriod(value as TimeWindow)}>
            <ComboboxInput placeholder="Period" className="h-9 w-[160px] cursor-pointer" />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem value="this_week" className="cursor-pointer">This Week</ComboboxItem>
                <ComboboxItem value="last_week" className="cursor-pointer">Last Week</ComboboxItem>
                <ComboboxItem value="this_month" className="cursor-pointer">This Month</ComboboxItem>
                <ComboboxItem value="all_time" className="cursor-pointer">All Time</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Combobox value={statusFilter} onValueChange={(value) => value && setStatusFilter(value)}>
            <ComboboxInput placeholder="Status" className="h-9 w-[140px] cursor-pointer" />
            <ComboboxContent>
              <ComboboxList>
                <ComboboxItem value="all" className="cursor-pointer">All statuses</ComboboxItem>
                <ComboboxItem value="pending" className="cursor-pointer">Pending</ComboboxItem>
                <ComboboxItem value="paid" className="cursor-pointer">Paid</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>

          <Button variant="outline" className="cursor-pointer" onClick={handleExportCsv}>
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Total Amount</div>
          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <PoundSterling className="size-5 text-primary" />
            {formatPence(totalAmountPence)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{PERIOD_LABELS[period]}</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending Payout</div>
          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Clock3 className="size-5 text-amber-500" />
            {formatPence(pendingAmountPence)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{pendingRows.length} records</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Paid</div>
          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <CheckCircle2 className="size-5 text-emerald-500" />
            {formatPence(paidAmountPence)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{paidRows.length} records</div>
        </Card>

        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Selected Batch</div>
          <div className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Wallet className="size-5 text-sky-500" />
            {formatPence(selectedPendingAmountPence)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {selectedPendingRows.length} selected pending records
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={allPendingSelected}
              onCheckedChange={(checked) => toggleSelectAllPending(Boolean(checked))}
              aria-label="Select all pending commissions"
            />
            <span className="text-sm text-muted-foreground">Select all pending</span>
          </div>
          <Button
            onClick={markSelectedAsPaid}
            className="cursor-pointer"
            disabled={settling || selectedPendingRows.length === 0}
          >
            Mark Selected as Paid
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Date</TableHead>
              <TableHead>Engineer</TableHead>
              <TableHead>Member</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Batch</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Loading commission records...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No commission records found for this filter.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const isPending = row.status === 'pending';
                const isChecked = selectedIds.includes(row.id);
                return (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Checkbox
                        checked={isChecked}
                        disabled={!isPending}
                        onCheckedChange={(checked) => toggleSelect(row.id, Boolean(checked))}
                        aria-label={`Select commission ${row.id}`}
                      />
                    </TableCell>
                    <TableCell>{format(new Date(row.attributed_at), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="font-medium">{row.engineer_name}</TableCell>
                    <TableCell>
                      <div>{row.member_name}</div>
                      <div className="text-xs text-muted-foreground">{row.member_email}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatPence(row.amount_pence)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          row.status === 'paid'
                            ? 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400'
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {row.paid_batch_id ?? '-'}
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
