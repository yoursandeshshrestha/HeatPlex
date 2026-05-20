/**
 * Create member record and GoCardless billing request
 * Called from the payment page to initiate signup
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  town: string;
  postcode: string;
  plan: string;
  promoCode?: string;
  marketingOptIn: boolean;
  commusoftCustomerId?: string;
}

serve(async (req) => {
  try {
    // Get Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const signupData: SignupRequest = await req.json();

    // 1. Create member record in "pending_payment" status
    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        first_name: signupData.firstName,
        last_name: signupData.lastName,
        email: signupData.email,
        phone: signupData.phone,
        address_line_1: signupData.addressLine1,
        address_line_2: signupData.addressLine2 || null,
        address_town: signupData.town,
        address_postcode: signupData.postcode,
        plan: signupData.plan,
        promo_code: signupData.promoCode || null,
        marketing_email_opt_in: signupData.marketingOptIn,
        marketing_consent_at: signupData.marketingOptIn ? new Date().toISOString() : null,
        commusoft_customer_id: signupData.commusoftCustomerId || null,
        status: 'pending_payment',
        terms_accepted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (memberError) {
      throw new Error(`Failed to create member: ${memberError.message}`);
    }

    // 2. Create GoCardless billing request
    // TODO: Implement actual GoCardless API integration
    // For now, return a mock authorization URL
    const mockAuthorisationUrl = `${Deno.env.get('APP_URL')}/join/done?member_id=${member.id}&${new URLSearchParams(signupData as any).toString()}`;

    return new Response(
      JSON.stringify({
        member_id: member.id,
        authorisation_url: mockAuthorisationUrl,
      }),
      { headers: { 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
