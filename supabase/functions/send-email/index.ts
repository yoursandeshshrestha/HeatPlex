/**
 * Unified Email Service
 * Handles all email types using Resend + React Email templates
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  EMAIL_TEMPLATES,
  type EmailTemplateKey,
  type EmailTemplateData,
} from '../_shared/emails/index.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const RESEND_FROM = Deno.env.get('RESEND_FROM') ?? 'Heat Plex <onboarding@resend.dev>';

interface EmailRequest {
  templateKey: EmailTemplateKey;
  to: string;
  data: Record<string, unknown>;
  memberId?: string;
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
    const { templateKey, to, data, memberId }: EmailRequest = await req.json();

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Render template
    const renderer = EMAIL_TEMPLATES[templateKey];
    if (!renderer) {
      return new Response(
        JSON.stringify({ error: `Unknown template: ${templateKey}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailContent = renderer(data as never);
    let status = 'failed';
    let providerMessageId: string | null = null;
    let errorMessage: string | null = null;

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to,
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
          tags: [
            { name: 'template', value: templateKey },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Resend error:', error);
        errorMessage = JSON.stringify(error);
      } else {
        const result = await response.json();
        providerMessageId = result.id;
        status = 'sent';
      }
    } catch (sendError) {
      console.error('Email send error:', sendError);
      errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error';
    }

    // Log to database
    const { error: logError } = await supabaseClient
      .from('send_log')
      .insert({
        member_id: memberId || null,
        to_email: to,
        channel: 'email',
        template_key: templateKey,
        subject: emailContent.subject,
        provider_message_id: providerMessageId,
        status,
        error_message: errorMessage,
        sent_at: new Date().toISOString(),
      });

    if (logError) {
      console.error('Failed to log email:', logError);
    }

    if (status === 'failed') {
      return new Response(
        JSON.stringify({ error: errorMessage || 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: providerMessageId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Email error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
