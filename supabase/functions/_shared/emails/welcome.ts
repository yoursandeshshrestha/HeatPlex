/**
 * Welcome Email Templates
 */

import { layout, plain, escapeHtml, BRAND } from './layout.ts';

export interface WelcomeStep1Data {
  firstName: string;
  plan: 'annual' | 'monthly';
  renewalDate: string;
  accountUrl: string;
}

export function welcomeStep1(d: WelcomeStep1Data) {
  const planText = d.plan === 'annual' ? 'Annual (£199/year)' : 'Monthly (£19.99/month)';
  const subject = 'Welcome to Heat Plex Membership';

  const html = layout({
    preheader: 'Welcome to Heat Plex Membership',
    heading: 'Welcome to Heat Plex Membership',
    body_html: `
      <p style="margin:0 0 16px 0;">Hi ${escapeHtml(d.firstName)},</p>
      <p style="margin:0 0 16px 0;">You are now a Heat Plex Member! We are delighted to have you on board.</p>
      <p style="margin:0 0 16px 0;"><strong>Your membership:</strong><br />Plan: ${escapeHtml(planText)}<br />Renews on: ${escapeHtml(d.renewalDate)}</p>
      <hr style="border:none; border-top:1px solid ${BRAND.borderStrong}; margin:24px 0;" />
      <p style="margin:0 0 16px 0;"><strong>Your membership includes:</strong></p>
      <ul style="margin:16px 0; padding-left:24px;">
        <li style="margin-bottom:12px;"><strong>20% off all works</strong> — Every job, every time</li>
        <li style="margin-bottom:12px;"><strong>Free annual boiler service</strong> — Worth £140</li>
        <li style="margin-bottom:12px;"><strong>Free Gas Safety Certificate (CP12)</strong> — Required by law for landlords</li>
        <li style="margin-bottom:12px;"><strong>Priority booking</strong> — Members book service slots first</li>
      </ul>
      <p style="margin:32px 0 0 0;">Log in anytime to book your annual service, view your savings, download certificates, and manage your membership.</p>
    `,
    cta: { label: 'Go to your account', url: d.accountUrl },
  });

  const text = plain({
    heading: subject,
    lines: [
      `Hi ${d.firstName},`,
      '',
      "You are now a Heat Plex Member! We are delighted to have you on board.",
      '',
      `Your membership: ${planText}`,
      `Renews on: ${d.renewalDate}`,
      '',
      'Your membership includes:',
      '• 20% off all works',
      '• Free annual boiler service (Worth £140)',
      '• Free Gas Safety Certificate (CP12)',
      '• Priority booking',
    ],
    cta: { label: 'Go to your account', url: d.accountUrl },
  });

  return { subject, html, text };
}
