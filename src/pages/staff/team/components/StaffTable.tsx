import { useSearchParams } from 'react-router-dom';
import { useCallback } from 'react';
import type { Tables } from '@/lib/supabase';
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
import { Search, Plus, UserCog, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';

type Staff = Tables<'staff'>;

interface StaffTableProps {
  staff: Staff[];
  totalCount: number;
  loading: boolean;
}

export function StaffTable({ staff, totalCount, loading }: StaffTableProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const roleFilter = searchParams.get('role') || 'all';
  const statusFilter = searchParams.get('status') || 'all';

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
      if (updates.search !== undefined || updates.role !== undefined || updates.status !== undefined) {
        newParams.set('page', '1');
      }
      return newParams;
    });
  }, [setSearchParams]);

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const hasActiveFilters = search !== '' || roleFilter !== 'all' || statusFilter !== 'all';

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams({ page: '1', limit: limit.toString() }));
  }, [setSearchParams, limit]);

  const roleStyles = {
    owner: 'bg-purple-500/10 text-purple-400 backdrop-blur-sm hover:bg-purple-500/15',
    admin: 'bg-blue-500/10 text-blue-400 backdrop-blur-sm hover:bg-blue-500/15',
    staff: 'bg-gray-500/10 text-gray-400 backdrop-blur-sm hover:bg-gray-500/15',
  };

  const statusStyles = {
    active: 'bg-emerald-500/10 text-emerald-400 backdrop-blur-sm hover:bg-emerald-500/15',
    inactive: 'bg-red-500/10 text-red-400 backdrop-blur-sm hover:bg-red-500/15',
  };

  return (
    <Card className="p-0">
      <div className="space-y-4 border-b p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">
            Team Members ({totalCount})
          </div>
          <Button className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            Add Staff
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search staff..."
              value={search}
              onChange={(e) => updateSearchParams({ search: e.target.value })}
              className="h-9 cursor-text rounded-md pl-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Role:</span>
            <Combobox
              value={roleFilter}
              onValueChange={(value) => value && updateSearchParams({ role: value })}
            >
              <ComboboxInput placeholder="All" className="h-9 w-[140px] cursor-pointer" />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxItem value="all" className="cursor-pointer">All Roles</ComboboxItem>
                  <ComboboxItem value="owner" className="cursor-pointer">Owner</ComboboxItem>
                  <ComboboxItem value="admin" className="cursor-pointer">Admin</ComboboxItem>
                  <ComboboxItem value="staff" className="cursor-pointer">Staff</ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
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
                  <ComboboxItem value="inactive" className="cursor-pointer">Inactive</ComboboxItem>
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
            <TableRow className="border-b hover:bg-transparent">
              <TableHead className="px-6 font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Last Login</TableHead>
              <TableHead className="font-semibold">Joined</TableHead>
              <TableHead className="px-6 text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={loading ? 'opacity-50' : ''}>
            {staff.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                  No staff members found
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id} className="cursor-pointer border-b transition-colors hover:bg-muted/50">
                  <TableCell className="px-6 py-4 font-medium">{member.name}</TableCell>
                  <TableCell className="py-4 text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="secondary"
                      className={`capitalize ${roleStyles[member.role as keyof typeof roleStyles] || ''}`}
                    >
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge
                      variant="secondary"
                      className={member.deactivated_at ? statusStyles.inactive : statusStyles.active}
                    >
                      {member.deactivated_at ? 'Inactive' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-muted-foreground">
                    {member.last_login_at ? formatDate(member.last_login_at) : 'Never'}
                  </TableCell>
                  <TableCell className="py-4 text-muted-foreground">
                    {formatDate(member.created_at)}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 cursor-pointer hover:bg-accent">
                      <UserCog className="h-4 w-4" />
                    </Button>
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
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalCount)} of {totalCount} staff
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
    </Card>
  );
}
