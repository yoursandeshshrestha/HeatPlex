/**
 * Database query helpers
 * Provides type-safe wrappers around common Supabase queries
 */

import { format } from 'date-fns';
import { supabase } from './client';
import type { Tables } from './client';

// =============================================================================
// MEMBERS
// =============================================================================

export async function getMemberById(id: string) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function getMemberByEmail(email: string) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

export async function updateMember(
  id: string,
  updates: Partial<Tables<'members'>>
) {
  const { data, error } = await supabase
    .from('members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// BOOKINGS
// =============================================================================

export async function getMemberBookings(memberId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      engineer:engineers(id, name, slug)
    `)
    .eq('member_id', memberId)
    .order('scheduled_date', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getUpcomingBookings(memberId: string) {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('member_id', memberId)
    .in('status', ['booked', 'rescheduled'])
    .gte('scheduled_date', today)
    .order('scheduled_date', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function getActiveBooking(memberId: string) {
  const upcoming = await getUpcomingBookings(memberId);
  return upcoming[0] ?? null;
}

// Staff booking queries
export interface BookingWithDetails {
  id: string;
  member_id: string;
  commusoft_job_id: string | null;
  scheduled_date: string;
  slot: 'AM' | 'PM';
  status: string;
  engineer_id: string | null;
  notes: string | null;
  created_at: string;
  member: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
  };
  engineer: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface BookingFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  engineerId?: string;
  unassignedOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedBookings {
  bookings: BookingWithDetails[];
  total: number;
  totalActive: number;
  totalCancelled: number;
  totalUnassigned: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getStaffBookings(filters?: BookingFilters): Promise<PaginatedBookings> {
  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('bookings')
    .select(`
      *,
      member:members(id, first_name, last_name, email, phone),
      engineer:engineers(id, name, slug)
    `, { count: 'exact' })
    .order('scheduled_date', { ascending: false })
    .order('slot', { ascending: true })
    .range(from, to);

  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters?.dateFrom) {
    query = query.gte('scheduled_date', filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte('scheduled_date', filters.dateTo);
  }

  if (filters?.engineerId) {
    query = query.eq('engineer_id', filters.engineerId);
  }

  if (filters?.unassignedOnly) {
    query = query.is('engineer_id', null);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  const total = count || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Get additional counts with same filters (excluding status and unassignedOnly)
  let baseCountQuery = supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });

  if (filters?.dateFrom) {
    baseCountQuery = baseCountQuery.gte('scheduled_date', filters.dateFrom);
  }

  if (filters?.dateTo) {
    baseCountQuery = baseCountQuery.lte('scheduled_date', filters.dateTo);
  }

  if (filters?.engineerId) {
    baseCountQuery = baseCountQuery.eq('engineer_id', filters.engineerId);
  }

  // Count active bookings (booked + rescheduled)
  const { count: activeCount } = await baseCountQuery
    .in('status', ['booked', 'rescheduled']);

  // Count cancelled bookings
  const { count: cancelledCount } = await baseCountQuery
    .in('status', ['cancelled_by_member', 'cancelled_by_provider']);

  // Count unassigned active bookings
  let unassignedQuery = supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .in('status', ['booked', 'rescheduled'])
    .is('engineer_id', null);

  if (filters?.dateFrom) {
    unassignedQuery = unassignedQuery.gte('scheduled_date', filters.dateFrom);
  }

  if (filters?.dateTo) {
    unassignedQuery = unassignedQuery.lte('scheduled_date', filters.dateTo);
  }

  const { count: unassignedCount } = await unassignedQuery;

  return {
    bookings: (data as BookingWithDetails[]) || [],
    total,
    totalActive: activeCount || 0,
    totalCancelled: cancelledCount || 0,
    totalUnassigned: unassignedCount || 0,
    page,
    pageSize,
    totalPages,
  };
}

export async function assignEngineerToBooking(bookingId: string, engineerId: string | null) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ engineer_id: engineerId, updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBookingStatus(bookingId: string, status: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAvailableEngineers() {
  const { data, error } = await supabase
    .from('engineers')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

// =============================================================================
// CERTIFICATES
// =============================================================================

export async function getMemberCertificates(memberId: string) {
  const { data, error } = await supabase
    .from('gas_certificates')
    .select(`
      *,
      engineer:engineers(id, name)
    `)
    .eq('member_id', memberId)
    .order('issued_at', { ascending: false });

  if (error) throw error;
  return data;
}

// =============================================================================
// JOBS
// =============================================================================

export async function getMemberJobs(memberId: string, limit = 10) {
  const { data, error } = await supabase
    .from('member_jobs')
    .select(`
      *,
      engineer:engineers(id, name)
    `)
    .eq('member_id', memberId)
    .order('completed_at', { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// =============================================================================
// PAYMENTS
// =============================================================================

export async function getMemberPayments(memberId: string, limit?: number) {
  let query = supabase
    .from('payments')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export async function getMemberMandate(memberId: string) {
  const { data, error } = await supabase
    .from('mandates')
    .select('*')
    .eq('member_id', memberId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data;
}

export async function getMemberSubscription(memberId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('member_id', memberId)
    .in('status', ['active', 'pending_customer_approval'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

// =============================================================================
// SAVINGS
// =============================================================================

export async function getMemberSavingsEvents(memberId: string) {
  const { data, error } = await supabase
    .from('savings_events')
    .select('*')
    .eq('member_id', memberId)
    .order('applied_at', { ascending: false });

  if (error) throw error;
  return data;
}

// =============================================================================
// ENGINEERS
// =============================================================================

export async function getAllEngineers() {
  const { data, error } = await supabase
    .from('engineers')
    .select('*')
    .eq('active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getEngineerBySlug(slug: string) {
  const { data, error } = await supabase
    .from('engineers')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data;
}

// =============================================================================
// ADMIN KPIs
// =============================================================================

export interface DateRangeFilter {
  from: Date;
  to: Date;
}

export interface MemberKPIs {
  newMembersCount: number;
  newMembersLastPeriod: number;
  totalActiveMembers: number;
  conversionRate: number;
  targetProgress: number; // percentage toward 30-day target of 100-150
}

export interface RevenueKPIs {
  totalRevenue: number;
  annualRevenue: number;
  monthlyRevenue: number;
  lastPeriodRevenue: number;
}

export interface OperationalKPIs {
  jobsCompleted: number;
  offerRate: number; // % of jobs that resulted in membership offer
  emailOpenRate: number;
  emailConversionRate: number;
  avgDaysToSignup: number;
}

export interface EngineerStats {
  id: string;
  name: string;
  slug: string;
  jobsCompleted: number;
  membershipsOffered: number;
  membershipsSold: number;
  offerRate: number;
  conversionRate: number;
  commissionEarned: number;
}

export async function getMemberKPIs(dateRange: DateRangeFilter): Promise<MemberKPIs> {
  const fromDate = format(dateRange.from, 'yyyy-MM-dd');
  const toDate = format(dateRange.to, 'yyyy-MM-dd');

  // Get new members in current period
  const { data: newMembers, error: newError } = await supabase
    .from('members')
    .select('id')
    .gte('created_at', fromDate)
    .lte('created_at', toDate);

  if (newError) throw newError;

  // Get new members in previous period (same duration)
  const periodDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
  const prevFrom = new Date(dateRange.from);
  prevFrom.setDate(prevFrom.getDate() - periodDays);
  const prevTo = new Date(dateRange.to);
  prevTo.setDate(prevTo.getDate() - periodDays);

  const { data: prevMembers, error: prevError } = await supabase
    .from('members')
    .select('id')
    .gte('created_at', format(prevFrom, 'yyyy-MM-dd'))
    .lte('created_at', format(prevTo, 'yyyy-MM-dd'));

  if (prevError) throw prevError;

  // Get total active members
  const { count: activeCount, error: activeError } = await supabase
    .from('members')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  if (activeError) throw activeError;

  // Calculate conversion rate (signups / offers sent)
  // For now, using a placeholder calculation
  const conversionRate = 0.12; // 12% placeholder

  // Calculate target progress (assuming 100-150 target in 30 days)
  const targetProgress = Math.min((activeCount || 0) / 125 * 100, 100);

  return {
    newMembersCount: newMembers?.length || 0,
    newMembersLastPeriod: prevMembers?.length || 0,
    totalActiveMembers: activeCount || 0,
    conversionRate,
    targetProgress,
  };
}

export async function getRevenueKPIs(dateRange: DateRangeFilter): Promise<RevenueKPIs> {
  const fromDate = format(dateRange.from, 'yyyy-MM-dd');
  const toDate = format(dateRange.to, 'yyyy-MM-dd');

  // Get payments in current period
  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount_pence, type')
    .gte('created_at', fromDate)
    .lte('created_at', toDate)
    .eq('status', 'confirmed');

  if (paymentsError) throw paymentsError;

  // Calculate revenue breakdown
  let totalRevenue = 0;
  let annualRevenue = 0;
  let monthlyRevenue = 0;

  payments?.forEach((payment) => {
    const amount = payment.amount_pence / 100;
    totalRevenue += amount;

    if (payment.type === 'signup_annual' || payment.type === 'renewal_annual') {
      annualRevenue += amount;
    } else if (payment.type === 'signup_monthly' || payment.type === 'renewal_monthly') {
      monthlyRevenue += amount;
    }
  });

  // Get previous period revenue
  const periodDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
  const prevFrom = new Date(dateRange.from);
  prevFrom.setDate(prevFrom.getDate() - periodDays);
  const prevTo = new Date(dateRange.to);
  prevTo.setDate(prevTo.getDate() - periodDays);

  const { data: prevPayments, error: prevError } = await supabase
    .from('payments')
    .select('amount_pence')
    .gte('created_at', format(prevFrom, 'yyyy-MM-dd'))
    .lte('created_at', format(prevTo, 'yyyy-MM-dd'))
    .eq('status', 'confirmed');

  if (prevError) throw prevError;

  const lastPeriodRevenue = prevPayments?.reduce((sum, p) => sum + p.amount_pence / 100, 0) || 0;

  return {
    totalRevenue,
    annualRevenue,
    monthlyRevenue,
    lastPeriodRevenue,
  };
}

export async function getOperationalKPIs(dateRange: DateRangeFilter): Promise<OperationalKPIs> {
  const fromDate = format(dateRange.from, 'yyyy-MM-dd');
  const toDate = format(dateRange.to, 'yyyy-MM-dd');

  // Get completed jobs in period
  const { count: jobsCount, error: jobsError } = await supabase
    .from('member_jobs')
    .select('*', { count: 'exact', head: true })
    .gte('completed_at', fromDate)
    .lte('completed_at', toDate)
    .eq('status', 'completed');

  if (jobsError) throw jobsError;

  // Placeholder metrics - these would be calculated from actual email tracking data
  return {
    jobsCompleted: jobsCount || 0,
    offerRate: 85, // % of jobs where membership was offered
    emailOpenRate: 42, // % open rate in 24h
    emailConversionRate: 8, // % who sign up after email
    avgDaysToSignup: 3.5, // average days from job to signup
  };
}

export async function getTopEngineers(dateRange: DateRangeFilter, limit = 3): Promise<EngineerStats[]> {
  // This would need a more complex query joining engineers, jobs, and member attributions
  // For now, return placeholder data
  const engineers = await getAllEngineers();

  return engineers.slice(0, limit).map((engineer, index) => ({
    id: engineer.id,
    name: engineer.name,
    slug: engineer.slug,
    jobsCompleted: 25 - (index * 5),
    membershipsOffered: 20 - (index * 4),
    membershipsSold: 3 - index,
    offerRate: 80 + (index * 5),
    conversionRate: 15 - (index * 2),
    commissionEarned: (3 - index) * 25,
  }));
}
