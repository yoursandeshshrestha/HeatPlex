/**
 * Staff-only: create member row + Supabase Auth user
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const DEFAULT_MEMBER_PASSWORD =
  Deno.env.get('DEFAULT_MEMBER_PASSWORD') || 'password123';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateMemberRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  town: string;
  postcode: string;
  plan: 'annual' | 'monthly';
  status: 'active' | 'pending';
  promoCode?: string;
  commusoftCustomerId?: string;
  marketingOptIn?: boolean;
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function getRenewalDate(plan: 'annual' | 'monthly', start = new Date()) {
  const renewal = new Date(start);
  if (plan === 'annual') {
    renewal.setFullYear(renewal.getFullYear() + 1);
  } else {
    renewal.setMonth(renewal.getMonth() + 1);
  }
  return renewal.toISOString().slice(0, 10);
}

function isAuthUserExistsError(message: string) {
  const lower = message.toLowerCase();
  return (
    lower.includes('already been registered') ||
    lower.includes('already exists') ||
    lower.includes('duplicate')
  );
}

async function findAuthUserIdByEmail(
  admin: ReturnType<typeof createClient>,
  email: string
): Promise<string | null> {
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    if (match) return match.id;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

async function ensureAuthUser(
  admin: ReturnType<typeof createClient>,
  email: string,
  firstName: string,
  lastName: string
): Promise<{ userId: string; created: boolean }> {
  const { data, error } = await admin.auth.admin.createUser({
    email: email.toLowerCase(),
    password: DEFAULT_MEMBER_PASSWORD,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
    },
  });

  if (!error && data.user) {
    return { userId: data.user.id, created: true };
  }

  if (error && isAuthUserExistsError(error.message)) {
    const existingId = await findAuthUserIdByEmail(admin, email);
    if (existingId) return { userId: existingId, created: false };
  }

  throw error ?? new Error('Failed to create login account');
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
      return jsonResponse(
        { error: 'Missing or invalid Authorization header' },
        401
      );
    }

    const accessToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!accessToken) {
      return jsonResponse({ error: 'Missing access token' }, 401);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(accessToken);

    if (userError || !user?.email) {
      console.error('create-member auth.getUser failed:', userError?.message);
      return jsonResponse(
        { error: 'Invalid or expired session. Please sign in again.' },
        401
      );
    }

    const { data: staff, error: staffError } = await admin
      .from('staff')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (staffError || !staff) {
      return jsonResponse({ error: 'Staff access required' }, 403);
    }

    const body = (await req.json()) as CreateMemberRequest;
    const email = body.email?.trim().toLowerCase();

    if (
      !email ||
      !body.firstName?.trim() ||
      !body.lastName?.trim() ||
      !body.phone?.trim() ||
      !body.addressLine1?.trim() ||
      !body.town?.trim() ||
      !body.postcode?.trim() ||
      !body.plan ||
      !body.status
    ) {
      return jsonResponse({ error: 'Missing required fields' }, 400);
    }

    const { data: existingMember } = await admin
      .from('members')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingMember) {
      return jsonResponse({ error: 'A member with this email already exists' }, 409);
    }

    const now = new Date();
    const startedAt = now.toISOString();
    const isActive = body.status === 'active';

    let authUserId: string | null = null;
    let authUserCreated = false;

    try {
      const authResult = await ensureAuthUser(
        admin,
        email,
        body.firstName.trim(),
        body.lastName.trim()
      );
      authUserId = authResult.userId;
      authUserCreated = authResult.created;

      const { data: member, error: memberError } = await admin
        .from('members')
        .insert({
          first_name: body.firstName.trim(),
          last_name: body.lastName.trim(),
          email,
          phone: body.phone.trim(),
          address_line_1: body.addressLine1.trim(),
          address_line_2: body.addressLine2?.trim() || null,
          address_town: body.town.trim(),
          address_postcode: body.postcode.trim().toUpperCase(),
          plan: body.plan,
          status: body.status,
          started_at: isActive ? startedAt : null,
          renewal_date: isActive ? getRenewalDate(body.plan, now) : null,
          auto_renewal: true,
          terms_accepted_at: startedAt,
          marketing_email_opt_in: Boolean(body.marketingOptIn),
          marketing_consent_at: body.marketingOptIn ? startedAt : null,
          promo_code: body.promoCode?.trim() || null,
          commusoft_customer_id: body.commusoftCustomerId?.trim() || null,
        })
        .select()
        .single();

      if (memberError) {
        if (memberError.code === '23505') {
          throw new Error('A member with this email already exists');
        }
        throw memberError;
      }

      return jsonResponse({ member });
    } catch (innerError) {
      if (authUserCreated && authUserId) {
        await admin.auth.admin.deleteUser(authUserId);
      }
      throw innerError;
    }
  } catch (error) {
    console.error('create-member error:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to create member';
    return jsonResponse({ error: message }, 500);
  }
});
