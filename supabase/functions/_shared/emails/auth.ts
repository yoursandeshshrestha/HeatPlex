/**
 * Authentication Email Templates
 */

import { layout, plain, BRAND } from './layout.ts';

export interface MagicLinkData {
  magicLink: string;
}

export function magicLink(d: MagicLinkData) {
  const subject = 'Your Heat Plex Login Link';

  const html = layout({
    preheader: 'Your login link is ready',
    heading: 'Your login link is ready',
    body_html: `
      <p style="margin:0 0 16px 0;">Click the button below to securely log in to your Heat Plex account:</p>
      <div style="background:${BRAND.surface2}; border-left:4px solid ${BRAND.warning}; padding:16px; margin:20px 0; border-radius:8px;">
        <strong style="color:${BRAND.warning};">⚠️ This link expires in 15 minutes</strong><br />
        For security, this link can only be used once.
      </div>
      <p style="margin:30px 0 0 0; color:${BRAND.textMuted}; font-size:14px;">
        If you did not request this login link, you can safely ignore this email.
      </p>
    `,
    cta: { label: 'Log in to Heat Plex', url: d.magicLink },
  });

  const text = plain({
    heading: subject,
    lines: [
      'Click the link below to log in to your Heat Plex account.',
      '',
      '⚠️ This link expires in 15 minutes and can only be used once.',
      '',
      "If you didn't request this, you can safely ignore this email.",
    ],
    cta: { label: 'Log in to Heat Plex', url: d.magicLink },
  });

  return { subject, html, text };
}
