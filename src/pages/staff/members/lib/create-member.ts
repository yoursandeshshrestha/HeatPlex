import type { Tables } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export type MemberPlan = 'annual' | 'monthly';
export type ManualMemberStatus = 'active' | 'pending';

export interface CreateMemberInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  town: string;
  postcode: string;
  plan: MemberPlan;
  status: ManualMemberStatus;
  promoCode?: string;
  commusoftCustomerId?: string;
  marketingOptIn: boolean;
}

export async function createMemberManual(
  input: CreateMemberInput
): Promise<Tables<'members'>> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error('You must be signed in as staff to add members');
  }

  const { data, error } = await supabase.functions.invoke('create-member', {
    body: input,
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
    throw new Error(message || 'Failed to create member');
  }

  if (data?.error) {
    throw new Error(
      typeof data.error === 'string' ? data.error : 'Failed to create member'
    );
  }

  if (!data?.member) {
    throw new Error('Failed to create member');
  }

  return data.member as Tables<'members'>;
}
