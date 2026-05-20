/**
 * Staff List Page
 * Staff view to see and manage team members
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
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
  ComboboxEmpty,
} from '@/components/ui/combobox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Plus, UserCog, Users, Shield, Crown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { Area, AreaChart } from 'recharts';

type Staff = Tables<'staff'>;

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  data: number[];
}

function StatCard({ title, value, change, icon, data }: StatCardProps) {
  const isPositive = change >= 0;
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">{title}</div>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <div className="mt-2 flex items-end justify-between">
        <div>
          <div className="text-2xl font-semibold tracking-tight">{value}</div>
          <div className="mt-1 text-xs text-muted-foreground">
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
  );
}

export function StaffPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    owners: 0,
  });
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const roleFilter = searchParams.get('role') || 'all';
  const statusFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    loadStaff();
    loadStats();
  }, [page, limit, search, roleFilter, statusFilter]);

  async function loadStaff() {
    try {
      setLoading(true);
      let query = supabase
        .from('staff')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Search
      if (search) {
        query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
      }

      // Filters
      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }
      if (statusFilter === 'active') {
        query = query.is('deactivated_at', null);
      } else if (statusFilter === 'inactive') {
        query = query.not('deactivated_at', 'is', null);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setStaff(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('role, deactivated_at');

      if (error) throw error;

      const allStaff = data || [];
      setStats({
        total: allStaff.length,
        active: allStaff.filter((s) => !s.deactivated_at).length,
        admins: allStaff.filter((s) => s.role === 'admin').length,
        owners: allStaff.filter((s) => s.role === 'owner').length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  function updateSearchParams(updates: Record<string, string>) {
    const newParams = new URLSearchParams(searchParams);
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
    setSearchParams(newParams);
  }

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const roleStyles = {
    owner: 'bg-purple-500/10 text-purple-400 backdrop-blur-sm hover:bg-purple-500/15',
    admin: 'bg-blue-500/10 text-blue-400 backdrop-blur-sm hover:bg-blue-500/15',
    staff: 'bg-gray-500/10 text-gray-400 backdrop-blur-sm hover:bg-gray-500/15',
  };

  const statusStyles = {
    active: 'bg-emerald-500/10 text-emerald-400 backdrop-blur-sm hover:bg-emerald-500/15',
    inactive: 'bg-red-500/10 text-red-400 backdrop-blur-sm hover:bg-red-500/15',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading staff...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage Heat Plex team members and permissions
          </p>
        </div>
        <Button className="cursor-pointer">
          <Plus className="mr-2 h-4 w-4" />
          Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={stats.total}
          change={5.2}
          icon={<Users className="size-4" />}
          data={[10, 12, 11, 13, 14, 15, 16]}
        />
        <StatCard
          title="Active"
          value={stats.active}
          change={3.1}
          icon={<UserCog className="size-4" />}
          data={[10, 11, 10, 12, 13, 14, 15]}
        />
        <StatCard
          title="Admins"
          value={stats.admins}
          change={0}
          icon={<Shield className="size-4" />}
          data={[5, 5, 5, 5, 5, 5, 5]}
        />
        <StatCard
          title="Owners"
          value={stats.owners}
          change={0}
          icon={<Crown className="size-4" />}
          data={[3, 3, 3, 3, 3, 3, 3]}
        />
      </div>

      {/* Table */}
      <Card>
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
            <Combobox
              value={roleFilter}
              onValueChange={(value) => value && updateSearchParams({ role: value })}
            >
              <ComboboxInput placeholder="Role" className="h-9 w-[160px] cursor-pointer" />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxItem value="all" className="cursor-pointer">All Roles</ComboboxItem>
                  <ComboboxItem value="owner" className="cursor-pointer">Owner</ComboboxItem>
                  <ComboboxItem value="admin" className="cursor-pointer">Admin</ComboboxItem>
                  <ComboboxItem value="staff" className="cursor-pointer">Staff</ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Combobox
              value={statusFilter}
              onValueChange={(value) => value && updateSearchParams({ status: value })}
            >
              <ComboboxInput placeholder="Status" className="h-9 w-[160px] cursor-pointer rounded-lg! [&>div]:rounded-lg!" />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxItem value="all" className="cursor-pointer">All Status</ComboboxItem>
                  <ComboboxItem value="active" className="cursor-pointer">Active</ComboboxItem>
                  <ComboboxItem value="inactive" className="cursor-pointer">Inactive</ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Combobox
              value={limit.toString()}
              onValueChange={(value) => value && updateSearchParams({ limit: value })}
            >
              <ComboboxInput placeholder="Per page" className="h-9 w-[100px] cursor-pointer rounded-lg! [&>div]:rounded-lg!" />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxItem value="10" className="cursor-pointer">10 / page</ComboboxItem>
                  <ComboboxItem value="25" className="cursor-pointer">25 / page</ComboboxItem>
                  <ComboboxItem value="50" className="cursor-pointer">50 / page</ComboboxItem>
                  <ComboboxItem value="100" className="cursor-pointer">100 / page</ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
        <div className="overflow-hidden">
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
            <TableBody>
              {loading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : staff.length === 0 ? (
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
    </div>
  );
}
