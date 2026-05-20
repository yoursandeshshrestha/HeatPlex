/**
 * React hooks for Supabase queries
 * Uses React Query-style patterns for data fetching
 */

import { useEffect, useState } from 'react';
import type { Tables } from './client';
import * as queries from './queries';

interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

function useQuery<T>(
  queryFn: () => Promise<T>,
  deps: unknown[] = []
): UseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// MEMBER HOOKS
// =============================================================================

export function useMember(memberId: string | null) {
  return useQuery(
    () => {
      if (!memberId) throw new Error('Member ID required');
      return queries.getMemberById(memberId);
    },
    [memberId]
  );
}

export function useMemberByEmail(email: string | null) {
  return useQuery(
    () => {
      if (!email) throw new Error('Email required');
      return queries.getMemberByEmail(email);
    },
    [email]
  );
}

// =============================================================================
// BOOKING HOOKS
// =============================================================================

export function useMemberBookings(memberId: string | null) {
  return useQuery(
    () => {
      if (!memberId) throw new Error('Member ID required');
      return queries.getMemberBookings(memberId);
    },
    [memberId]
  );
}

export function useActiveBooking(memberId: string | null) {
  return useQuery(
    () => {
      if (!memberId) throw new Error('Member ID required');
      return queries.getActiveBooking(memberId);
    },
    [memberId]
  );
}

// =============================================================================
// CERTIFICATE HOOKS
// =============================================================================

export function useMemberCertificates(memberId: string | null) {
  return useQuery(
    () => {
      if (!memberId) throw new Error('Member ID required');
      return queries.getMemberCertificates(memberId);
    },
    [memberId]
  );
}

// =============================================================================
// JOB HOOKS
// =============================================================================

export function useMemberJobs(memberId: string | null, limit = 10) {
  return useQuery(
    () => {
      if (!memberId) throw new Error('Member ID required');
      return queries.getMemberJobs(memberId, limit);
    },
    [memberId, limit]
  );
}

// =============================================================================
// PAYMENT HOOKS
// =============================================================================

export function useMemberPayments(memberId: string | null) {
  return useQuery(
    () => {
      if (!memberId) throw new Error('Member ID required');
      return queries.getMemberPayments(memberId);
    },
    [memberId]
  );
}

// =============================================================================
// SAVINGS HOOKS
// =============================================================================

export function useMemberSavings(memberId: string | null) {
  return useQuery(
    () => {
      if (!memberId) throw new Error('Member ID required');
      return queries.getMemberSavingsEvents(memberId);
    },
    [memberId]
  );
}

// =============================================================================
// ENGINEER HOOKS
// =============================================================================

export function useEngineers() {
  return useQuery(() => queries.getAllEngineers());
}

export function useEngineerBySlug(slug: string | null) {
  return useQuery(
    () => {
      if (!slug) throw new Error('Engineer slug required');
      return queries.getEngineerBySlug(slug);
    },
    [slug]
  );
}

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type Member = Tables<'members'>;
export type Booking = Tables<'bookings'>;
export type Certificate = Tables<'gas_certificates'>;
export type Job = Tables<'member_jobs'>;
export type Payment = Tables<'payments'>;
export type SavingsEvent = Tables<'savings_events'>;
export type Engineer = Tables<'engineers'>;
