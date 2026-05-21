/**
 * GoCardless Webhook Handler
 * Handles payment events from GoCardless
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

const WEBHOOK_SECRET = Deno.env.get('GOCARDLESS_WEBHOOK_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface WebhookEvent {
  id: string;
  created_at: string;
  resource_type: string;
  action: string;
  links: {
    payment?: string;
    subscription?: string;
    mandate?: string;
    customer?: string;
  };
}

interface WebhookPayload {
  events: WebhookEvent[];
}

function verifySignature(payload: string, signature: string): boolean {
  const hmac = createHmac('sha256', WEBHOOK_SECRET);
  hmac.update(payload);
  const digest = hmac.digest('hex');
  return digest === signature;
}

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Verify webhook signature
    const signature = req.headers.get('webhook-signature');
    const rawBody = await req.text();

    if (!signature || !verifySignature(rawBody, signature)) {
      console.error('Invalid webhook signature');
      return new Response('Unauthorized', { status: 401 });
    }

    const payload: WebhookPayload = JSON.parse(rawBody);

    // Process each event
    for (const event of payload.events) {
      await processEvent(event);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

async function processEvent(event: WebhookEvent) {
  console.log('Processing event:', event.action, event.resource_type);

  // Handle payment events
  if (event.resource_type === 'payments') {
    switch (event.action) {
      case 'confirmed':
        await handlePaymentConfirmed(event);
        break;
      case 'failed':
        await handlePaymentFailed(event);
        break;
      case 'cancelled':
        await handlePaymentCancelled(event);
        break;
    }
  }

  // Handle subscription events
  if (event.resource_type === 'subscriptions') {
    switch (event.action) {
      case 'created':
        await handleSubscriptionCreated(event);
        break;
      case 'cancelled':
        await handleSubscriptionCancelled(event);
        break;
      case 'finished':
        await handleSubscriptionFinished(event);
        break;
    }
  }

  // Handle mandate events (Direct Debit authorization)
  if (event.resource_type === 'mandates') {
    switch (event.action) {
      case 'created':
        await handleMandateCreated(event);
        break;
      case 'active':
        await handleMandateActive(event);
        break;
      case 'failed':
        await handleMandateFailed(event);
        break;
      case 'cancelled':
        await handleMandateCancelled(event);
        break;
    }
  }
}

async function handlePaymentConfirmed(event: WebhookEvent) {
  // Find member by payment ID and activate membership
  const { error } = await supabase
    .from('members')
    .update({ status: 'active' })
    .eq('gocardless_payment_id', event.links.payment);

  if (error) {
    console.error('Error activating member:', error);
  } else {
    console.log('Member activated for payment:', event.links.payment);
  }
}

async function handlePaymentFailed(event: WebhookEvent) {
  // Mark member as payment overdue
  const { error } = await supabase
    .from('members')
    .update({ status: 'payment_overdue' })
    .eq('gocardless_payment_id', event.links.payment);

  if (error) {
    console.error('Error updating member status:', error);
  } else {
    console.log('Member marked as payment overdue:', event.links.payment);
  }
}

async function handlePaymentCancelled(event: WebhookEvent) {
  // Handle cancelled payment
  console.log('Payment cancelled:', event.links.payment);
}

async function handleSubscriptionCreated(event: WebhookEvent) {
  // Handle new subscription
  console.log('Subscription created:', event.links.subscription);
}

async function handleSubscriptionCancelled(event: WebhookEvent) {
  // Mark member as cancellation requested
  const { error } = await supabase
    .from('members')
    .update({
      status: 'cancellation_requested',
      cancellation_requested_at: new Date().toISOString()
    })
    .eq('gocardless_subscription_id', event.links.subscription);

  if (error) {
    console.error('Error updating member:', error);
  }
}

async function handleSubscriptionFinished(event: WebhookEvent) {
  // Mark member as expired
  const { error } = await supabase
    .from('members')
    .update({ status: 'expired' })
    .eq('gocardless_subscription_id', event.links.subscription);

  if (error) {
    console.error('Error updating member:', error);
  }
}

async function handleMandateCreated(event: WebhookEvent) {
  console.log('Mandate created:', event.links.mandate);
}

async function handleMandateActive(event: WebhookEvent) {
  // Mandate is now active and ready to collect payments
  console.log('Mandate active:', event.links.mandate);
}

async function handleMandateFailed(event: WebhookEvent) {
  console.log('Mandate failed:', event.links.mandate);
}

async function handleMandateCancelled(event: WebhookEvent) {
  // Handle cancelled mandate
  console.log('Mandate cancelled:', event.links.mandate);
}
