/**
 * Staff List Page
 * Staff view to see and manage team members
 */

import { useState, useEffect, startTransition } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { StatsCards } from './components/StatsCards';
import { StaffTable } from './components/StaffTable';

type Staff = Tables<'staff'>;

export function StaffPage() {
  const [searchParams] = useSearchParams();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    admins: 0,
    owners: 0,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const search = searchParams.get('search') || '';
  const roleFilter = searchParams.get('role') || 'all';
  const statusFilter = searchParams.get('status') || 'all';

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadStaff();
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

      // Batch state updates using startTransition
      startTransition(() => {
        setStaff(data || []);
        setTotalCount(count || 0);
        setLoading(false);
        setInitialLoading(false);
      });
    } catch (error) {
      console.error('Error loading staff:', error);
      setLoading(false);
      setInitialLoading(false);
    }
  }

  async function loadStats() {
    try {
      const [total, active, admins, owners] = await Promise.all([
        supabase.from('staff').select('*', { count: 'exact', head: true }),
        supabase
          .from('staff')
          .select('*', { count: 'exact', head: true })
          .is('deactivated_at', null),
        supabase
          .from('staff')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'admin'),
        supabase
          .from('staff')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'owner'),
      ]);

      if (total.error) throw total.error;
      if (active.error) throw active.error;
      if (admins.error) throw admins.error;
      if (owners.error) throw owners.error;

      setStats({
        total: total.count ?? 0,
        active: active.count ?? 0,
        admins: admins.count ?? 0,
        owners: owners.count ?? 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }

  async function handleStaffDeleted() {
    await Promise.all([loadStaff(), loadStats()]);
  }

  if (initialLoading) {
    return <LoadingScreen message="Loading staff..." />;
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Staff Management</h1>
        <p className="text-muted-foreground">
          Manage Heat Plex team members and permissions
        </p>
      </div>

      {/* Stats */}
      <StatsCards stats={stats} />

      {/* Table */}
      <StaffTable
        staff={staff}
        totalCount={totalCount}
        loading={loading}
        onStaffDeleted={handleStaffDeleted}
      />
    </div>
  );
}
