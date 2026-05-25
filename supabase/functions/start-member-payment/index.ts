/**
 * Start GoCardless payment for an existing pending member (staff-created or resume).
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

interface StartPaymentRequest {
  redirectUri: string;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function createGoCardlessCustomer(
  email: string,
  firstName: string,
  lastName: string,
  plan: string
) {
  const res = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GOCARDLESS_ACCESS_TOKEN}`,
      'GoCardless-Version': '2015-07-06',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      customers: {
        email,
        given_name: firstName,
        family_name: lastName,
        metadata: { plan },
      },
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    console.error('GoCardless customer creation error:', error);
    return null;
  }

  const data = await res.json();
  return data.customers.id as string;
}

async function createBillingRequestFlow(
  customerId: string,
  email: string,
  plan: 'annual' | 'monthly',
  redirectUri: string
) {
  const billingRequestRes = await fetch(`${API_BASE_URL}/billing_requests`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GOCARDLESS_ACCESS_TOKEN}`,
      'GoCardless-Version': '2015-07-06',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      billing_requests: {
        mandate_request: {
          scheme: 'bacs',
          verify: 'when_available',
        },
        payment_request:
          plan === 'annual'
            ? {
                description: 'Heat Plex Annual Membership',
                amount: 19900,
                currency: 'GBP',
                app_fee: null,
              }
            : undefined,
        metadata: { email, plan },
        links: { customer: customerId },
      },
    }),
  });

  if (!billingRequestRes.ok) {
    const error = await billingRequestRes.json();
    console.error('GoCardless billing request error:', error);
    return null;
  }

  const billingRequestData = await billingRequestRes.json();
  const billingRequestId = billingRequestData.billing_requests.id as string;

  const flowRes = await fetch(`${API_BASE_URL}/billing_request_flows`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GOCARDLESS_ACCESS_TOKEN}`,
      'GoCardless-Version': '2015-07-06',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      billing_request_flows: {
        redirect_uri: redirectUri,
        exit_uri: `${redirectUri}?status=cancelled`,
        links: { billing_request: billingRequestId },
      },
    }),
  });

  if (!flowRes.ok) {
    const error = await flowRes.json();
    console.error('GoCardless flow creation error:', error);
    return null;
  }

  const flowData = await flowRes.json();
  return {
    billingRequestId,
    authorizationUrl: flowData.billing_request_flows.authorisation_url as string,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return jsonResponse({ error: 'Missing or invalid Authorization header' }, 401);
    }

    const accessToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!accessToken) {
      return jsonResponse({ error: 'Missing access token' }, 401);
    }

    const { redirectUri }: StartPaymentRequest = await req.json();
    if (!redirectUri) {
      return jsonResponse({ error: 'Missing redirectUri' }, 400);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(accessToken);

    if (userError || !user?.email) {
      return jsonResponse({ error: 'Invalid or expired session. Please sign in again.' }, 401);
    }

    const { data: member, error: memberError } = await admin
      .from('members')
      .select('id, email, first_name, last_name, plan, status, gocardless_customer_id')
      .eq('email', user.email.toLowerCase())
      .maybeSingle();

    if (memberError || !member) {
      return jsonResponse({ error: 'Member profile not found' }, 404);
    }

    if (member.status === 'active') {
      return jsonResponse({ error: 'Membership is already active', alreadyActive: true }, 400);
    }

    if (member.status !== 'pending') {
      return jsonResponse(
        { error: 'Payment setup is only available for pending memberships' },
        400
      );
    }

    const plan = member.plan as 'annual' | 'monthly';
    let customerId = member.gocardless_customer_id as string | null;

    if (!customerId) {
      customerId = await createGoCardlessCustomer(
        member.email,
        member.first_name,
        member.last_name,
        plan
      );
      if (!customerId) {
        return jsonResponse({ error: 'Failed to create payment customer' }, 500);
      }
    }

    const flow = await createBillingRequestFlow(
      customerId,
      member.email,
      plan,
      redirectUri
    );

    if (!flow) {
      return jsonResponse({ error: 'Failed to create payment request' }, 500);
    }

    const { error: updateError } = await admin
      .from('members')
      .update({
        gocardless_customer_id: customerId,
        gocardless_billing_request_id: flow.billingRequestId,
      })
      .eq('id', member.id);

    if (updateError) {
      console.error('Member billing update error:', updateError);
      return jsonResponse({ error: 'Failed to save payment session' }, 500);
    }

    return jsonResponse({
      success: true,
      memberId: member.id,
      customerId,
      billingRequestId: flow.billingRequestId,
      authorizationUrl: flow.authorizationUrl,
    });
  } catch (error) {
    console.error('start-member-payment error:', error);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
