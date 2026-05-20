/**
 * Database query helpers
 * Provides type-safe wrappers around common Supabase queries
 */

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

export async function getActiveBooking(memberId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      engineer:engineers(id, name, slug)
    `)
    .eq('member_id', memberId)
    .in('status', ['booked'])
    .order('scheduled_date', { ascending: true })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
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

export async function getMemberPayments(memberId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false });

  if (error) throw error;
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
