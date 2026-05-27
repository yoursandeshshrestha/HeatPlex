/**
 * Renewal Email Templates
 */

import { layout, plain, escapeHtml, BRAND } from './layout.ts';

export interface RenewalReminderData {
  firstName: string;
  renewalDate: string;
  amount: string;
  accountUrl: string;
}

export function renewalReminder(d: RenewalReminderData) {
  const subject = 'Your Heat Plex Membership Renewal';

  const html = layout({
    preheader: 'Your membership is coming up for renewal',
    heading: 'Your Membership Renewal',
    body_html: `
      <p style="margin:0 0 16px 0;">Hi ${escapeHtml(d.firstName)},</p>
      <p style="margin:0 0 16px 0;">Your Heat Plex membership is coming up for renewal.</p>
      <div style="background:${BRAND.surface2}; border-left:4px solid ${BRAND.info}; padding:16px; margin:20px 0; border-radius:8px;">
        <strong>Renewal Date:</strong> ${escapeHtml(d.renewalDate)}<br>
        <strong>Amount:</strong> ${escapeHtml(d.amount)}
      </div>
      <p style="margin:24px 0 0 0;">Your payment method will be automatically charged on the renewal date. No action is needed from you.</p>
      <p style="margin:16px 0 0 0;">Want to make changes to your membership?</p>
    `,
    cta: { label: 'Manage Membership', url: d.accountUrl },
  });

  const text = plain({
    heading: subject,
    lines: [
      `Hi ${d.firstName},`,
      '',
      'Your Heat Plex membership is coming up for renewal.',
      '',
      `Renewal Date: ${d.renewalDate}`,
      `Amount: ${d.amount}`,
      '',
      'Your payment method will be automatically charged on the renewal date.',
    ],
    cta: { label: 'Manage Membership', url: d.accountUrl },
  });

  return { subject, html, text };
}
