/**
 * Email logs queries
 */

import { supabase } from './client';

export interface EmailLog {
  id: string;
  member_id: string | null;
  to_email: string;
  channel: string;
  template_key: string | null;
  subject: string | null;
  sent_at: string;
  provider_message_id: string | null;
  status: string | null;
  error_message: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  complained_at: string | null;
  created_at: string;
  member?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface EmailLogsFilters {
  status?: string;
  templateKey?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface EmailLogsResult {
  logs: EmailLog[];
  total: number;
  totalPages: number;
  totalSent: number;
  totalFailed: number;
  totalOpened: number;
}

export async function getEmailLogs(
  filters: EmailLogsFilters = {}
): Promise<EmailLogsResult> {
  const {
    status,
    templateKey,
    search,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 25,
  } = filters;

  let query = supabase
    .from('send_log')
    .select('*, member:members(first_name, last_name, email)', { count: 'exact' })
    .order('sent_at', { ascending: false });

  // Apply filters
  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  if (templateKey && templateKey !== 'all') {
    query = query.eq('template_key', templateKey);
  }

  if (search) {
    query = query.or(`to_email.ilike.%${search}%,subject.ilike.%${search}%`);
  }

  if (dateFrom) {
    query = query.gte('sent_at', dateFrom);
  }

  if (dateTo) {
    query = query.lte('sent_at', dateTo);
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  // Get stats
  const statsQuery = supabase
    .from('send_log')
    .select('status', { count: 'exact' });

  if (dateFrom) {
    statsQuery.gte('sent_at', dateFrom);
  }

  if (dateTo) {
    statsQuery.lte('sent_at', dateTo);
  }

  const [
    { count: totalSent },
    { count: totalFailed },
    { count: totalOpened },
  ] = await Promise.all([
    statsQuery.eq('status', 'sent'),
    statsQuery.eq('status', 'failed'),
    statsQuery.not('opened_at', 'is', null),
  ]);

  return {
    logs: (data || []) as EmailLog[],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / pageSize),
    totalSent: totalSent || 0,
    totalFailed: totalFailed || 0,
    totalOpened: totalOpened || 0,
  };
}

export async function retryEmail(logId: string): Promise<void> {
  // Get the original email log
  const { data: log, error: fetchError } = await supabase
    .from('send_log')
    .select('*')
    .eq('id', logId)
    .single();

  if (fetchError || !log) {
    throw new Error('Email log not found');
  }

  if (!log.template_key) {
    throw new Error('Cannot retry email without template key');
  }

  // Note: We need to reconstruct the original data from the email
  // This is a limitation - we should store the original payload in send_log
  // For now, we'll just resend with minimal data
  const { error: sendError } = await supabase.functions.invoke('send-email', {
    body: {
      templateKey: log.template_key,
      to: log.to_email,
      data: {}, // This would need to be the original data
      memberId: log.member_id,
    },
  });

  if (sendError) {
    throw sendError;
  }
}
