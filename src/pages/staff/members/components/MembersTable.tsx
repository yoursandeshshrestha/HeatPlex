import { useSearchParams, useNavigate } from 'react-router-dom';
import { useCallback, useState } from 'react';
import type { Tables } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
import { Search, Download, ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
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
import { formatDate } from '@/lib/date-utils';
import { downloadCsv, toCsv } from '@/lib/csv-utils';
import { toast } from 'sonner';

type Member = Tables<'members'>;

interface MembersTableProps {
  members: Member[];
  totalCount: number;
  loading: boolean;
}

export function MembersTable({ members, totalCount, loading }: MembersTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteMember() {
    if (!memberToDelete) return;

    setDeleting(true);
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberToDelete.id);

      if (error) throw error;

      toast.success('Member deleted successfully');
      setDeleteDialogOpen(false);
      setMemberToDelete(null);

      // Reload the page to refresh the list
      window.location.reload();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('Failed to delete member');
    } finally {
      setDeleting(false);
    }
  }

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const planFilter = searchParams.get('plan') || 'all';

  const updateSearchParams = useCallback((updates: Record<string, string>) => {
    setSearchParams((prevParams) => {
      const newParams = new URLSearchParams(prevParams);
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      // Reset to page 1 when filters change
      if (updates.search !== undefined || updates.status !== undefined || updates.plan !== undefined) {
        newParams.set('page', '1');
      }
      return newParams;
    });
  }, [setSearchParams]);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const hasActiveFilters = search !== '' || statusFilter !== 'all' || planFilter !== 'all';

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams({ page: '1', limit: limit.toString() }));
  }, [setSearchParams, limit]);

  const handleExport = useCallback(async () => {
    try {
      setExporting(true);

      let query = supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(
          `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`
        );
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (planFilter !== 'all') {
        query = query.eq('plan', planFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data?.length) {
        toast.error('No members to export');
        return;
      }

      const headers = [
        'ID',
        'First Name',
        'Last Name',
        'Email',
        'Phone',
        'Plan',
        'Status',
        'Member Since',
        'Renewal Date',
        'Savings (£)',
        'Postcode',
      ];

      const rows = data.map((member) => [
        member.id,
        member.first_name,
        member.last_name,
        member.email,
        member.phone,
        member.plan,
        member.status.replace(/_/g, ' '),
        member.started_at ? formatDate(member.started_at) : '',
        member.renewal_date ? formatDate(member.renewal_date) : '',
        ((member.savings_total_pence || 0) / 100).toFixed(2),
        member.address_postcode,
      ]);

      const date = new Date().toISOString().slice(0, 10);
      downloadCsv(`heatplex-members-${date}.csv`, toCsv(headers, rows));
      toast.success(`Exported ${data.length} member${data.length === 1 ? '' : 's'}`);
    } catch (error) {
      console.error('Error exporting members:', error);
      toast.error('Failed to export members');
    } finally {
      setExporting(false);
    }
  }, [search, statusFilter, planFilter]);

  const statusStyles = {
    active: 'bg-emerald-500/10 text-emerald-400 backdrop-blur-sm hover:bg-emerald-500/15',
    payment_overdue: 'bg-red-500/10 text-red-400 backdrop-blur-sm hover:bg-red-500/15',
    cancelled: 'bg-gray-500/10 text-gray-400 backdrop-blur-sm hover:bg-gray-500/15',
  };

  return (
    <Card className="p-0">
      <div className="space-y-4 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            All Members ({totalCount})
          </div>
          <Button
            className="cursor-pointer"
            onClick={handleExport}
            disabled={exporting || totalCount === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search members..."
              value={search}
              onChange={(e) => updateSearchParams({ search: e.target.value })}
              className="h-9 cursor-text rounded-md pl-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Combobox
              value={statusFilter}
              onValueChange={(value) => value && updateSearchParams({ status: value })}
            >
              <ComboboxInput placeholder="All" className="h-9 w-[140px] cursor-pointer" />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxItem value="all" className="cursor-pointer">All Status</ComboboxItem>
                  <ComboboxItem value="active" className="cursor-pointer">Active</ComboboxItem>
                  <ComboboxItem value="payment_overdue" className="cursor-pointer">Payment Overdue</ComboboxItem>
                  <ComboboxItem value="cancelled" className="cursor-pointer">Cancelled</ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Plan:</span>
            <Combobox
              value={planFilter}
              onValueChange={(value) => value && updateSearchParams({ plan: value })}
            >
              <ComboboxInput placeholder="All" className="h-9 w-[140px] cursor-pointer" />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxItem value="all" className="cursor-pointer">All Plans</ComboboxItem>
                  <ComboboxItem value="monthly" className="cursor-pointer">Monthly</ComboboxItem>
                  <ComboboxItem value="annual" className="cursor-pointer">Annual</ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Pages:</span>
            <Combobox
              value={limit.toString()}
              onValueChange={(value) => value && updateSearchParams({ limit: value })}
            >
              <ComboboxInput placeholder="10" className="h-9 w-[80px] cursor-pointer" />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxItem value="10" className="cursor-pointer">10</ComboboxItem>
                  <ComboboxItem value="25" className="cursor-pointer">25</ComboboxItem>
                  <ComboboxItem value="50" className="cursor-pointer">50</ComboboxItem>
                  <ComboboxItem value="100" className="cursor-pointer">100</ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 cursor-pointer"
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Member Since</TableHead>
              <TableHead>Savings</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={loading ? 'opacity-50' : ''}>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-sm">
                  No members found
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer hover:bg-accent/50"
                  onClick={() => navigate(`/staff/members/${member.id}`)}
                >
                  <TableCell className="font-medium">
                    {member.first_name} {member.last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="text-muted-foreground">{member.phone || '—'}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium capitalize">
                      {member.plan}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`capitalize ${statusStyles[member.status as keyof typeof statusStyles] || ''}`}
                    >
                      {member.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(member.started_at)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    £{((member.savings_total_pence || 0) / 100).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 cursor-pointer hover:bg-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/staff/members/${member.id}`);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 cursor-pointer hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMemberToDelete(member);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} members
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSearchParams({ page: (page - 1).toString() })}
              disabled={!hasPrevPage}
              className="h-8 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSearchParams({ page: pageNum.toString() })}
                    className="h-8 w-8 cursor-pointer p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateSearchParams({ page: (page + 1).toString() })}
              disabled={!hasNextPage}
              className="h-8 cursor-pointer"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{memberToDelete?.first_name} {memberToDelete?.last_name}</strong> ({memberToDelete?.email})?
              This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              disabled={deleting}
              className="cursor-pointer bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
