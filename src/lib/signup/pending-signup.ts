/** Session payload saved before redirecting to GoCardless (Billing Request Flow). */
export interface PendingSignup {
  memberId: string;
  email: string;
  firstName: string;
  plan: string;
  billingRequestId: string;
}

const STORAGE_KEY = 'heatplex_signup_pending';

export function savePendingSignup(data: PendingSignup): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/** Read without removing (safe for React Strict Mode double-mount). */
export function peekPendingSignup(): PendingSignup | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as PendingSignup;
  } catch {
    return null;
  }
}

export function clearPendingSignup(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

/** @deprecated Prefer peekPendingSignup + clearPendingSignup after success */
export function consumePendingSignup(): PendingSignup | null {
  const pending = peekPendingSignup();
  if (pending) clearPendingSignup();
  return pending;
}

/** Member row may include GoCardless columns from migrations not yet in generated types. */
export type MemberWithGoCardless = {
  id: string;
  email: string;
  first_name: string;
  plan: string;
  status: string;
  gocardless_billing_request_id?: string | null;
};

/** Query params GoCardless appends to redirect_uri after Billing Request Flow. */
export function parseGoCardlessReturn(params: URLSearchParams) {
  return {
    cancelled: params.get('status') === 'cancelled',
    billingRequestId: params.get('billing_request_id'),
    billingRequestFlowId: params.get('billing_request_flow_id'),
  };
}

export function isBillingRequestReturn(
  billingRequestId: string | null,
  billingRequestFlowId: string | null
): boolean {
  return Boolean(billingRequestId || billingRequestFlowId);
}
