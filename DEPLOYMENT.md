# Heat Plex Deployment Guide

## Prerequisites
- Supabase project setup
- GoCardless sandbox account
- Resend account

## Environment Variables

Make sure your `.env` file contains:

```env
# Supabase
VITE_SUPABASE_URL=https://wwiiewoqnlvjgovobmga.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Nw3zaE3tENancGMINZxLSg_Oc2DrXS_

# Resend
RESEND_API_KEY=REDACTED_RESEND_API_KEY

# GoCardless (Sandbox)
GOCARDLESS_ACCESS_TOKEN=REDACTED_GOCARDLESS_ACCESS_TOKEN
GOCARDLESS_ENVIRONMENT=sandbox
GOCARDLESS_WEBHOOK_SECRET=REDACTED_GOCARDLESS_WEBHOOK_SECRET
VITE_GOCARDLESS_PUBLISHABLE_KEY=kUIwktTeVUDP-DPEa_Ynxd7mwFA4oVmhBw_ke6Ao
```

## Deployment Steps

### 1. Apply Database Migrations

```bash
npx supabase db reset --linked
```

This will:
- Create the GoCardless tracking fields in the members table
- Set up proper indexes for faster lookups

### 2. Set Supabase Secrets

```bash
# Set all required secrets
npx supabase secrets set \
  RESEND_API_KEY=REDACTED_RESEND_API_KEY \
  GOCARDLESS_ACCESS_TOKEN=REDACTED_GOCARDLESS_ACCESS_TOKEN \
  GOCARDLESS_ENVIRONMENT=sandbox \
  GOCARDLESS_WEBHOOK_SECRET=REDACTED_GOCARDLESS_WEBHOOK_SECRET
```

### 3. Deploy Edge Functions

```bash
# Deploy all functions
npx supabase functions deploy create-signup
npx supabase functions deploy send-email
npx supabase functions deploy gocardless-webhook
```

### 4. Configure GoCardless Webhook

In GoCardless Dashboard (https://manage-sandbox.gocardless.com/):

1. Go to **Developers → Webhooks**
2. Click **Create Webhook**
3. Fill in:
   - **Name:** Heatplex Webhook
   - **URL:** `https://wwiiewoqnlvjgovobmga.supabase.co/functions/v1/gocardless-webhook`
   - **Secret:** `REDACTED_GOCARDLESS_WEBHOOK_SECRET`
4. Click **Create**

### 5. Test the Flow

1. Go to `http://localhost:5177/join/plan`
2. Select a plan
3. Fill in details
4. Click "Complete signup"
5. You should be redirected to GoCardless sandbox
6. Complete the payment authorization
7. You should be redirected back and see the welcome page

## Edge Functions Overview

### `create-signup`
- Creates GoCardless customer
- Creates billing request (Direct Debit mandate + optional payment)
- Returns authorization URL for user to complete payment

### `send-email`
- Unified email service for all email types
- Supports: welcome, magic_link, renewal_reminder, payment_confirmation, payment_failed
- Uses Resend API

### `gocardless-webhook`
- Handles payment events from GoCardless
- Updates member status based on payment events
- Processes mandate, subscription, and payment events

## Payment Flow

1. User fills signup form → `/join/payment`
2. System calls `create-signup` function
3. User redirected to GoCardless
4. User authorizes Direct Debit
5. GoCardless redirects to `/join/confirm`
6. System sends welcome email
7. Webhook updates member status to "active"
8. User can login and access dashboard

## Email Types

### Welcome Email
```typescript
{
  type: 'welcome',
  to: 'user@example.com',
  data: {
    firstName: 'John',
    plan: 'annual',
    dashboardUrl: 'https://app.heatplex.com/member'
  }
}
```

### Magic Link Email
```typescript
{
  type: 'magic_link',
  to: 'user@example.com',
  data: {
    magicLink: 'https://app.heatplex.com/login/verify?token=...'
  }
}
```

### Renewal Reminder Email
```typescript
{
  type: 'renewal_reminder',
  to: 'user@example.com',
  data: {
    firstName: 'John',
    renewalDate: '2026-06-15',
    amount: '£199',
    dashboardUrl: 'https://app.heatplex.com/member/membership'
  }
}
```

### Payment Confirmation Email
```typescript
{
  type: 'payment_confirmation',
  to: 'user@example.com',
  data: {
    firstName: 'John',
    amount: '£199',
    date: '2026-05-21'
  }
}
```

### Payment Failed Email
```typescript
{
  type: 'payment_failed',
  to: 'user@example.com',
  data: {
    firstName: 'John',
    amount: '£199',
    dashboardUrl: 'https://app.heatplex.com/member/membership'
  }
}
```

## Production Checklist

Before going live:

- [ ] Update `GOCARDLESS_ENVIRONMENT` to `live`
- [ ] Update `GOCARDLESS_ACCESS_TOKEN` with live credentials
- [ ] Update GoCardless webhook URL to production URL
- [ ] Configure custom domain for emails in Resend
- [ ] Update `from` email address in send-email function
- [ ] Test full payment flow in production
- [ ] Set up monitoring for edge functions
- [ ] Configure error alerting

## Troubleshooting

### Payment not completing
- Check Supabase function logs: `npx supabase functions logs create-signup`
- Verify GoCardless credentials are correct
- Check webhook is receiving events

### Emails not sending
- Check Resend API key is valid
- View Resend logs at https://resend.com/logs
- Check function logs: `npx supabase functions logs send-email`

### Webhook not working
- Verify webhook secret matches in both GoCardless and Supabase
- Check webhook logs in GoCardless dashboard
- Test webhook endpoint manually with curl
