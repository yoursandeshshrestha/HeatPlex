/**
 * Create Signup with GoCardless
 * Creates a billing request for Direct Debit setup
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { activationDates } from '../_shared/membership.ts';

const GOCARDLESS_ACCESS_TOKEN = Deno.env.get('GOCARDLESS_ACCESS_TOKEN')!;
const GOCARDLESS_ENVIRONMENT = Deno.env.get('GOCARDLESS_ENVIRONMENT') || 'sandbox';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const API_BASE_URL = GOCARDLESS_ENVIRONMENT === 'live'
  ? 'https://api.gocardless.com'
  : 'https://api-sandbox.gocardless.com';

interface SignupRequest {
  email: string;
  firstName: string;
  lastName: string;
  plan: 'annual' | 'monthly';
  redirectUri: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  town: string;
  postcode: string;
  promoCode?: string | null;
  marketingOptIn?: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const body: SignupRequest = await req.json();
    const {
      email,
      firstName,
      lastName,
      plan,
      redirectUri,
      phone,
      addressLine1,
      addressLine2,
      town,
      postcode,
      promoCode,
      marketingOptIn,
    } = body;

    // Validate required fields
    if (
      !email ||
      !firstName ||
      !lastName ||
      !plan ||
      !redirectUri ||
      !phone ||
      !addressLine1 ||
      !town ||
      !postcode
    ) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
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
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const flowData = await flowResponse.json();

    // Create pending member row (service role; bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingMember, error: existsError } = await supabase
      .from('members')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existsError) {
      console.error('Member exists check error:', existsError);
      return new Response(JSON.stringify({ error: 'Failed to create membership' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (existingMember) {
      return new Response(JSON.stringify({ error: 'A member with this email already exists' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dates = activationDates(plan);
    const termsAcceptedAt = new Date().toISOString();

    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        phone,
        address_line_1: addressLine1,
        address_line_2: addressLine2 || null,
        address_town: town,
        address_postcode: postcode,
        plan,
        promo_code: promoCode || null,
        marketing_email_opt_in: Boolean(marketingOptIn),
        marketing_consent_at: marketingOptIn ? termsAcceptedAt : null,
        status: 'pending',
        terms_accepted_at: termsAcceptedAt,
        gocardless_customer_id: customerId,
        gocardless_billing_request_id: billingRequestId,
        started_at: dates.started_at,
        renewal_date: dates.renewal_date,
      })
      .select('id')
      .single();

    if (memberError || !member) {
      console.error('Create pending member error:', memberError);
      return new Response(JSON.stringify({ error: 'Failed to create membership' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        memberId: member.id,
        customerId,
        billingRequestId,
        authorizationUrl: flowData.billing_request_flows.authorisation_url,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
