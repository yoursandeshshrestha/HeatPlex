/**
 * Members List Page
 * Staff view to see and manage all members
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
import { Search, Download, Users, UserCheck, AlertCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
import { Area, AreaChart } from 'recharts';

type Member = Tables<'members'>;

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

export function MembersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paymentOverdue: 0,
    annual: 0,
  });
  const [loading, setLoading] = useState(true);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const planFilter = searchParams.get('plan') || 'all';

  useEffect(() => {
    loadMembers();
    loadStats();
  }, [page, limit, search, statusFilter, planFilter]);

  async function loadMembers() {
    try {
      setLoading(true);
      let query = supabase
        .from('members')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Search
      if (search) {
        query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
      }

      // Filters
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (planFilter !== 'all') {
        query = query.eq('plan', planFilter);
      }

      // Pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;
      setMembers(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('status, plan');

      if (error) throw error;

      const allMembers = data || [];
      setStats({
        total: allMembers.length,
        active: allMembers.filter((m) => m.status === 'active').length,
        paymentOverdue: allMembers.filter((m) => m.status === 'payment_overdue').length,
        annual: allMembers.filter((m) => m.plan === 'annual').length,
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
    if (updates.search !== undefined || updates.status !== undefined || updates.plan !== undefined) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  }

  const totalPages = Math.ceil(totalCount / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const statusStyles = {
    active: 'bg-emerald-500/10 text-emerald-400 backdrop-blur-sm hover:bg-emerald-500/15',
    payment_overdue: 'bg-red-500/10 text-red-400 backdrop-blur-sm hover:bg-red-500/15',
    cancelled: 'bg-gray-500/10 text-gray-400 backdrop-blur-sm hover:bg-gray-500/15',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading members...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            Manage and view all Heat Plex members
          </p>
        </div>
        <Button className="cursor-pointer">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Members"
          value={stats.total}
          change={12.5}
          icon={<Users className="size-4" />}
          data={[30, 35, 40, 38, 45, 50, 55]}
        />
        <StatCard
          title="Active"
          value={stats.active}
          change={8.2}
          icon={<UserCheck className="size-4" />}
          data={[25, 28, 30, 32, 35, 38, 40]}
        />
        <StatCard
          title="Payment Overdue"
          value={stats.paymentOverdue}
          change={-15.3}
          icon={<AlertCircle className="size-4" />}
          data={[20, 18, 15, 12, 10, 8, 5]}
        />
        <StatCard
          title="Annual Plans"
          value={stats.annual}
          change={18.7}
          icon={<Calendar className="size-4" />}
          data={[15, 20, 22, 28, 30, 35, 38]}
        />
      </div>

      {/* Table */}
      <Card>
        <div className="space-y-4 border-b p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              All Members ({totalCount})
            </div>
            <Button className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Export
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
            <Combobox
              value={statusFilter}
              onValueChange={(value) => value && updateSearchParams({ status: value })}
            >
              <ComboboxInput placeholder="Status" className="h-9 w-[160px] cursor-pointer" />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxItem value="all" className="cursor-pointer">All Status</ComboboxItem>
                  <ComboboxItem value="active" className="cursor-pointer">Active</ComboboxItem>
                  <ComboboxItem value="payment_overdue" className="cursor-pointer">Payment Overdue</ComboboxItem>
                  <ComboboxItem value="cancelled" className="cursor-pointer">Cancelled</ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Combobox
              value={planFilter}
              onValueChange={(value) => value && updateSearchParams({ plan: value })}
            >
              <ComboboxInput placeholder="Plan" className="h-9 w-[160px] cursor-pointer !rounded-lg [&>div]:!rounded-lg" />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxItem value="all" className="cursor-pointer">All Plans</ComboboxItem>
                  <ComboboxItem value="monthly" className="cursor-pointer">Monthly</ComboboxItem>
                  <ComboboxItem value="annual" className="cursor-pointer">Annual</ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <Combobox
              value={limit.toString()}
              onValueChange={(value) => value && updateSearchParams({ limit: value })}
            >
              <ComboboxInput placeholder="Per page" className="h-9 w-[100px] cursor-pointer !rounded-lg [&>div]:!rounded-lg" />
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
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-sm">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-sm">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                members.map((member) => (
                  <TableRow key={member.id} className="cursor-pointer">
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
                      <Button variant="ghost" size="sm" className="h-8 cursor-pointer hover:bg-accent">
                        View
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
      </Card>
    </div>
  );
}
