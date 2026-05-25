import type { Tables } from '@/lib/supabase';

export type Member = Tables<'members'>;

/** GoCardless fields exist in DB but may be missing from generated types */
export type MemberWithBilling = Member & {
  gocardless_mandate_id?: string | null;
  gocardless_subscription_id?: string | null;
  gocardless_payment_id?: string | null;
  gocardless_billing_request_id?: string | null;
};

export function asMemberWithBilling(member: Member): MemberWithBilling {
  return member as MemberWithBilling;
}
