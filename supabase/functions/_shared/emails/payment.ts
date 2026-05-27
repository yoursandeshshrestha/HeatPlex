/**
 * Payment Email Templates
 */

import { layout, plain, escapeHtml, BRAND } from './layout.ts';

export interface PaymentConfirmationData {
  firstName: string;
  amount: string;
  date: string;
}

export interface PaymentFailedData {
  firstName: string;
  amount: string;
  accountUrl: string;
}

export function paymentConfirmation(d: PaymentConfirmationData) {
  const subject = 'Payment Received - Heat Plex Membership';

  const html = layout({
    preheader: 'Payment received successfully',
    heading: 'Payment Successful ✓',
    body_html: `
      <p style="margin:0 0 16px 0;">Hi ${escapeHtml(d.firstName)},</p>
      <p style="margin:0 0 16px 0;">We have received your payment for Heat Plex membership.</p>
      <div style="background:${BRAND.surface2}; border-left:4px solid ${BRAND.success}; padding:16px; margin:20px 0; border-radius:8px;">
        <strong>Amount Paid:</strong> ${escapeHtml(d.amount)}<br>
        <strong>Payment Date:</strong> ${escapeHtml(d.date)}
      </div>
      <p style="margin:24px 0 0 0;">Your membership is now active and all benefits are available to you.</p>
      <p style="margin:16px 0 0 0;">Thank you for being a valued Heat Plex member!</p>
    `,
  });

  const text = plain({
    heading: subject,
    lines: [
      `Hi ${d.firstName},`,
      '',
      'We have received your payment for Heat Plex membership.',
      '',
      `Amount Paid: ${d.amount}`,
      `Payment Date: ${d.date}`,
      '',
      'Your membership is now active and all benefits are available to you.',
    ],
  });

  return { subject, html, text };
}

export function paymentFailed(d: PaymentFailedData) {
  const subject = 'Action Required: Payment Failed - Heat Plex';

  const html = layout({
    preheader: 'Action required - payment failed',
    heading: 'Payment Failed',
    body_html: `
      <p style="margin:0 0 16px 0;">Hi ${escapeHtml(d.firstName)},</p>
      <p style="margin:0 0 16px 0;">We were unable to process your payment for Heat Plex membership.</p>
      <div style="background:${BRAND.surface2}; border-left:4px solid ${BRAND.danger}; padding:16px; margin:20px 0; border-radius:8px;">
        <strong>Amount:</strong> ${escapeHtml(d.amount)}<br>
        <strong>Action Required:</strong> Please update your payment method
      </div>
      <p style="margin:24px 0 0 0;">To avoid interruption to your membership benefits, please update your payment details as soon as possible.</p>
    `,
    cta: { label: 'Update Payment Method', url: d.accountUrl },
  });

  const text = plain({
    heading: subject,
    lines: [
      `Hi ${d.firstName},`,
      '',
      'We were unable to process your payment for Heat Plex membership.',
      '',
      `Amount: ${d.amount}`,
      '',
      'Please update your payment details as soon as possible.',
    ],
    cta: { label: 'Update Payment Method', url: d.accountUrl },
  });

  return { subject, html, text };
}
