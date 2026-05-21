/**
 * Create Signup with GoCardless
 * Creates a billing request for Direct Debit setup
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const GOCARDLESS_ACCESS_TOKEN = Deno.env.get('GOCARDLESS_ACCESS_TOKEN')!;
const GOCARDLESS_ENVIRONMENT = Deno.env.get('GOCARDLESS_ENVIRONMENT') || 'sandbox';

const API_BASE_URL = GOCARDLESS_ENVIRONMENT === 'live'
  ? 'https://api.gocardless.com'
  : 'https://api-sandbox.gocardless.com';

interface SignupRequest {
  email: string;
  firstName: string;
  lastName: string;
  plan: 'annual' | 'monthly';
  redirectUri: string;
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body: SignupRequest = await req.json();
    const { email, firstName, lastName, plan, redirectUri } = body;

    // Validate required fields
    if (!email || !firstName || !lastName || !plan || !redirectUri) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create customer in GoCardless
    const customerResponse = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GOCARDLESS_ACCESS_TOKEN}`,
        'GoCardless-Version': '2015-07-06',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customers: {
          email,
          given_name: firstName,
          family_name: lastName,
          metadata: {
            plan,
          },
        },
      }),
    });

    if (!customerResponse.ok) {
      const error = await customerResponse.json();
      console.error('GoCardless customer creation error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create customer' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const customerData = await customerResponse.json();
    const customerId = customerData.customers.id;

    // Create billing request
    const billingRequestResponse = await fetch(`${API_BASE_URL}/billing_requests`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GOCARDLESS_ACCESS_TOKEN}`,
        'GoCardless-Version': '2015-07-06',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billing_requests: {
          mandate_request: {
            scheme: 'bacs',
            verify: 'when_available',
          },
          payment_request: plan === 'annual' ? {
            description: 'Heat Plex Annual Membership',
            amount: 19900,
            currency: 'GBP',
            app_fee: null,
          } : undefined,
          metadata: {
            email,
            plan,
          },
          links: {
            customer: customerId,
          },
        },
      }),
    });

    if (!billingRequestResponse.ok) {
      const error = await billingRequestResponse.json();
      console.error('GoCardless billing request error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create billing request' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const billingRequestData = await billingRequestResponse.json();
    const billingRequestId = billingRequestData.billing_requests.id;

    // Create billing request flow
    const flowResponse = await fetch(`${API_BASE_URL}/billing_request_flows`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GOCARDLESS_ACCESS_TOKEN}`,
        'GoCardless-Version': '2015-07-06',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billing_request_flows: {
          redirect_uri: redirectUri,
          exit_uri: `${redirectUri}?status=cancelled`,
          lock_customer_details: true,
          lock_currency: true,
          links: {
            billing_request: billingRequestId,
          },
        },
      }),
    });

    if (!flowResponse.ok) {
      const error = await flowResponse.json();
      console.error('GoCardless flow creation error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create authorization flow' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const flowData = await flowResponse.json();

    return new Response(
      JSON.stringify({
        success: true,
        customerId,
        billingRequestId,
        authorizationUrl: flowData.billing_request_flows.authorisation_url,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
