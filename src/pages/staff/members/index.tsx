/**
 * Members List Page
 * Staff view to see and manage all members
 */

import { useState, useEffect, startTransition } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StatsCards } from './components/StatsCards';
import { MembersTable } from './components/MembersTable';
import { CreateMemberDialog } from './components/CreateMemberDialog';

type Member = Tables<'members'>;

export function MembersPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paymentOverdue: 0,
    annual: 0,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const statusFilter = searchParams.get('status') || 'all';
  const planFilter = searchParams.get('plan') || 'all';

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadMembers();
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

      // Batch state updates using startTransition
      startTransition(() => {
        setMembers(data || []);
        setTotalCount(count || 0);
        setLoading(false);
        setInitialLoading(false);
      });
    } catch (error) {
      console.error('Error loading members:', error);
      setLoading(false);
      setInitialLoading(false);
    }
  }

  async function loadStats() {
    try {
      const [total, active, paymentOverdue, annual] = await Promise.all([
        supabase.from('members').select('*', { count: 'exact', head: true }),
        supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active'),
        supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'payment_overdue'),
        supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('plan', 'annual'),
      ]);

      if (total.error) throw total.error;
      if (active.error) throw active.error;
      if (paymentOverdue.error) throw paymentOverdue.error;
      if (annual.error) throw annual.error;

      setStats({
        total: total.count ?? 0,
        active: active.count ?? 0,
        paymentOverdue: paymentOverdue.count ?? 0,
        annual: annual.count ?? 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function handleMemberDeleted() {
    await Promise.all([loadMembers(), loadStats()]);
  }

  function handleMemberCreated(member: Member) {
    loadMembers();
    loadStats();
    navigate(`/staff/members/${member.id}`);
  }

  if (initialLoading) {
    return <LoadingScreen message="Loading members..." />;
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
          <p className="text-muted-foreground">
            Manage and view all Heat Plex members
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="cursor-pointer shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          Add member
        </Button>
      </div>

      <CreateMemberDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleMemberCreated}
      />

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Table */}
      <MembersTable
        members={members}
        totalCount={totalCount}
        loading={loading}
        onMemberDeleted={handleMemberDeleted}
      />
    </div>
  );
}
