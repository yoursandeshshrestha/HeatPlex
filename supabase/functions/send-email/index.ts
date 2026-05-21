/**
 * Unified Email Service
 * Handles all email types using Resend
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
/** Use onboarding@resend.dev for dev; production: Heat Plex <membership@heatplex.com> after domain verify */
const RESEND_FROM =
  Deno.env.get('RESEND_FROM') ?? 'Heat Plex <onboarding@resend.dev>';

interface EmailRequest {
  type: 'welcome' | 'magic_link' | 'renewal_reminder' | 'payment_confirmation' | 'payment_failed';
  to: string;
  data: Record<string, string>;
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
    const { type, to, data }: EmailRequest = await req.json();

    const emailContent = getEmailContent(type, data);

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
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
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

function getEmailContent(type: string, data: Record<string, string>) {
  switch (type) {
    case 'welcome':
      return getWelcomeEmail(data);
    case 'magic_link':
      return getMagicLinkEmail(data);
    case 'renewal_reminder':
      return getRenewalReminderEmail(data);
    case 'payment_confirmation':
      return getPaymentConfirmationEmail(data);
    case 'payment_failed':
      return getPaymentFailedEmail(data);
    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

function getWelcomeEmail(data: Record<string, string>) {
  const { firstName, plan } = data;
  return {
    subject: 'Welcome to Heat Plex Membership! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 40px 20px; border-radius: 0 0 8px 8px; }
            .benefit { display: flex; align-items: start; margin: 20px 0; }
            .benefit-icon { color: #10b981; font-size: 24px; margin-right: 12px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 40px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Heat Plex! 🎉</h1>
            </div>
            <div class="content">
              <p>Hi ${firstName},</p>
              <p>Thank you for joining Heat Plex Membership! We're excited to have you as part of our community.</p>
              
              <h3>Your ${plan === 'annual' ? 'Annual' : 'Monthly'} Membership Includes:</h3>
              <div class="benefit">
                <span class="benefit-icon">✓</span>
                <div>
                  <strong>20% off all works</strong><br>
                  <span style="color: #666;">Save on every service call and repair</span>
                </div>
              </div>
              <div class="benefit">
                <span class="benefit-icon">✓</span>
                <div>
                  <strong>Free annual boiler service</strong><br>
                  <span style="color: #666;">Worth £120 - included in your membership</span>
                </div>
              </div>
              <div class="benefit">
                <span class="benefit-icon">✓</span>
                <div>
                  <strong>Free Gas Safety Certificate</strong><br>
                  <span style="color: #666;">CP12 certificate included annually</span>
                </div>
              </div>
              <div class="benefit">
                <span class="benefit-icon">✓</span>
                <div>
                  <strong>Priority booking</strong><br>
                  <span style="color: #666;">Members book service slots first</span>
                </div>
              </div>

              <p style="margin-top: 30px;">Ready to get started? Book your first service or explore your membership benefits.</p>
              
              <a href="${data.dashboardUrl || 'https://app.heatplex.com/member'}" class="button">Go to Dashboard</a>

              <p style="margin-top: 30px;">If you have any questions, feel free to reach out to us at <a href="mailto:support@heatplex.com">support@heatplex.com</a></p>
              
              <p>Best regards,<br>The Heat Plex Team</p>
            </div>
            <div class="footer">
              <p>© 2026 Heat Plex. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

function getMagicLinkEmail(data: Record<string, string>) {
  const { magicLink } = data;
  return {
    subject: 'Your Heat Plex Login Link',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #ffffff; padding: 40px 20px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 500; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Your login link is ready</h2>
              <p>Click the button below to securely log in to your Heat Plex account:</p>
              
              <a href="${magicLink}" class="button">Log in to Heat Plex</a>

              <div class="warning">
                <strong>⚠️ This link expires in 15 minutes</strong><br>
                For security, this link can only be used once.
              </div>

              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                If you didn't request this login link, you can safely ignore this email.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

function getRenewalReminderEmail(data: Record<string, string>) {
  const { firstName, renewalDate, amount } = data;
  return {
    subject: 'Your Heat Plex Membership Renewal',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #ffffff; padding: 40px 20px; }
            .info-box { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Your Heat Plex membership is coming up for renewal.</p>
              
              <div class="info-box">
                <strong>Renewal Date:</strong> ${renewalDate}<br>
                <strong>Amount:</strong> ${amount}
              </div>

              <p>Your payment method will be automatically charged on the renewal date. No action is needed from you.</p>

              <p>Want to make changes to your membership?</p>
              <a href="${data.dashboardUrl || 'https://app.heatplex.com/member/membership'}" class="button">Manage Membership</a>

              <p style="margin-top: 30px;">Questions? Contact us at <a href="mailto:support@heatplex.com">support@heatplex.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

function getPaymentConfirmationEmail(data: Record<string, string>) {
  const { firstName, amount, date } = data;
  return {
    subject: 'Payment Received - Heat Plex Membership',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #ffffff; padding: 40px 20px; }
            .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Payment Successful ✓</h2>
              <p>Hi ${firstName},</p>
              <p>We've received your payment for Heat Plex membership.</p>
              
              <div class="success-box">
                <strong>Amount Paid:</strong> ${amount}<br>
                <strong>Payment Date:</strong> ${date}
              </div>

              <p>Your membership is now active and all benefits are available to you.</p>
              <p>Thank you for being a valued Heat Plex member!</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}

function getPaymentFailedEmail(data: Record<string, string>) {
  const { firstName, amount } = data;
  return {
    subject: 'Action Required: Payment Failed - Heat Plex',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .content { background: #ffffff; padding: 40px 20px; }
            .error-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0; }
            .button { display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h2>Payment Failed</h2>
              <p>Hi ${firstName},</p>
              <p>We were unable to process your payment for Heat Plex membership.</p>
              
              <div class="error-box">
                <strong>Amount:</strong> ${amount}<br>
                <strong>Action Required:</strong> Please update your payment method
              </div>

              <p>To avoid interruption to your membership benefits, please update your payment details as soon as possible.</p>
              
              <a href="${data.dashboardUrl || 'https://app.heatplex.com/member/membership'}" class="button">Update Payment Method</a>

              <p style="margin-top: 30px;">Need help? Contact us at <a href="mailto:support@heatplex.com">support@heatplex.com</a></p>
            </div>
          </div>
        </body>
      </html>
    `,
  };
}
