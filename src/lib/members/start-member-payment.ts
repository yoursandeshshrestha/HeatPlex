import { supabase } from '@/lib/supabase';

export interface StartMemberPaymentResult {
  memberId: string;
  billingRequestId: string;
  authorizationUrl: string;
}

export async function startMemberPayment(
  redirectUri: string
): Promise<StartMemberPaymentResult> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error('You must be signed in to set up payment');
  }

  const { data, error } = await supabase.functions.invoke('start-member-payment', {
    body: { redirectUri },
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (error) {
    const message =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as { error: unknown }).error === 'string'
        ? (data as { error: string }).error
        : error.message;
    throw new Error(message || 'Failed to start payment');
  }

  if (data?.error) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Failed to start payment');
  }

  const { memberId, billingRequestId, authorizationUrl } = data ?? {};
  if (!authorizationUrl || !billingRequestId || !memberId) {
    throw new Error('Failed to start payment');
  }

  return { memberId, billingRequestId, authorizationUrl };
}
