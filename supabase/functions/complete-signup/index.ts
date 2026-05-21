/**
 * Complete signup after GoCardless Billing Request Flow
 * Verifies the billing request with GoCardless API and activates the member.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GOCARDLESS_ACCESS_TOKEN = Deno.env.get('GOCARDLESS_ACCESS_TOKEN')!;
const GOCARDLESS_ENVIRONMENT = Deno.env.get('GOCARDLESS_ENVIRONMENT') || 'sandbox';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const API_BASE_URL =
  GOCARDLESS_ENVIRONMENT === 'live'
    ? 'https://api.gocardless.com'
    : 'https://api-sandbox.gocardless.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMPLETE_STATUSES = new Set(['fulfilled', 'ready_to_fulfil']);
const GC_POLL_ATTEMPTS = 10;
const GC_POLL_INTERVAL_MS = 1000;

interface CompleteSignupRequest {
  billingRequestId: string;
  memberId?: string;
}

/** GoCardless nests resource IDs under mandate_request / payment_request, not top-level links. */
function extractBillingRequestResourceIds(billingRequest: Record<string, unknown>) {
  const mandateRequest = billingRequest.mandate_request as
    | { links?: { mandate?: string } }
    | undefined;
  const paymentRequest = billingRequest.payment_request as
    | { links?: { payment?: string } }
    | undefined;
  const subscriptionRequest = billingRequest.subscription_request as
    | { links?: { subscription?: string } }
    | undefined;
  const topLinks = billingRequest.links as
    | { mandate?: string; payment?: string; subscription?: string }
    | undefined;

  return {
    mandateId:
      mandateRequest?.links?.mandate ?? topLinks?.mandate ?? null,
    paymentId:
      paymentRequest?.links?.payment ?? topLinks?.payment ?? null,
    subscriptionId:
      subscriptionRequest?.links?.subscription ?? topLinks?.subscription ?? null,
  };
}

function isBillingRequestComplete(billingRequest: Record<string, unknown>) {
  const status = billingRequest.status as string;
  const mandateRequestStatus = (billingRequest.mandate_request as { status?: string } | undefined)
    ?.status;
  const { mandateId } = extractBillingRequestResourceIds(billingRequest);

  return (
    COMPLETE_STATUSES.has(status) ||
    mandateRequestStatus === 'submitted' ||
    mandateRequestStatus === 'fulfilled' ||
    Boolean(mandateId)
  );
}

async function fetchBillingRequest(billingRequestId: string) {
  const res = await fetch(`${API_BASE_URL}/billing_requests/${billingRequestId}`, {
    headers: {
      Authorization: `Bearer ${GOCARDLESS_ACCESS_TOKEN}`,
      'GoCardless-Version': '2015-07-06',
    },
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('GoCardless billing request fetch error:', error);
    return null;
  }

  const { billing_requests: billingRequest } = await res.json();
  return billingRequest as Record<string, unknown>;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { billingRequestId, memberId }: CompleteSignupRequest = await req.json();

    if (!billingRequestId) {
      return jsonResponse({ error: 'Missing billingRequestId' }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let memberQuery = supabase
      .from('members')
      .select('id, email, first_name, plan, status, gocardless_billing_request_id')
      .eq('gocardless_billing_request_id', billingRequestId);

    if (memberId) {
      memberQuery = memberQuery.eq('id', memberId);
    }

    const { data: member, error: memberError } = await memberQuery.maybeSingle();

    if (memberError || !member) {
      return jsonResponse({ error: 'Member not found for this billing request' }, 404);
    }

    if (member.status === 'active') {
      return jsonResponse({
        success: true,
        member: {
          id: member.id,
          email: member.email,
          firstName: member.first_name,
          plan: member.plan,
        },
        billingRequestStatus: 'already_active',
      });
    }

    let billingRequest: Record<string, unknown> | null = null;
    let status = 'pending';

    for (let attempt = 0; attempt < GC_POLL_ATTEMPTS; attempt++) {
      billingRequest = await fetchBillingRequest(billingRequestId);
      if (!billingRequest) {
        return jsonResponse({ error: 'Failed to verify payment with GoCardless' }, 502);
      }

      status = billingRequest.status as string;

      if (status === 'cancelled') {
        return jsonResponse({ error: 'Payment setup was cancelled', cancelled: true }, 400);
      }

      if (isBillingRequestComplete(billingRequest)) {
        break;
      }

      if (attempt < GC_POLL_ATTEMPTS - 1) {
        await sleep(GC_POLL_INTERVAL_MS);
      }
    }

    if (!billingRequest || !isBillingRequestComplete(billingRequest)) {
      return jsonResponse({
        pending: true,
        billingRequestStatus: status,
      });
    }

    const { mandateId, paymentId, subscriptionId } =
      extractBillingRequestResourceIds(billingRequest);

    const updates: Record<string, string> = { status: 'active' };
    if (mandateId) updates.gocardless_mandate_id = mandateId;
    if (paymentId) updates.gocardless_payment_id = paymentId;
    if (subscriptionId) updates.gocardless_subscription_id = subscriptionId;

    const { error: updateError } = await supabase
      .from('members')
      .update(updates)
      .eq('id', member.id);

    if (updateError) {
      console.error('Member activation error:', updateError);
      return jsonResponse({ error: 'Failed to activate membership' }, 500);
    }

    return jsonResponse({
      success: true,
      member: {
        id: member.id,
        email: member.email,
        firstName: member.first_name,
        plan: member.plan,
      },
      billingRequestStatus: status,
      gocardless: { mandateId, paymentId, subscriptionId },
    });
  } catch (error) {
    console.error('Complete signup error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
