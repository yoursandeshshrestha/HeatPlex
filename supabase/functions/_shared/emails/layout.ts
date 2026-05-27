/**
 * Email Layout Components
 * Shared layout and utilities for all Heat Plex emails
 */

// Brand tokens - Heat Plex dark theme
export const BRAND = {
  name: 'Heat Plex',
  primary: '#DCA800',        // Gold
  primaryDark: '#C99700',
  background: '#060606',
  surface: '#121212',
  surface2: '#1A1A1A',
  border: '#1F1F1F',
  borderStrong: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#A1A1A1',
  textFaded: '#6E6E6E',
  success: '#00B67A',
  warning: '#E89B00',
  danger: '#D14545',
  info: '#00A1B1',
} as const;

export const FONT_STACK = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const BRAND_FOOTER = 'Heat Plex Ltd · 64 Stanley Grove, Battersea, London SW8 3PG · Gas Safe No. 578913';

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function appUrl(): string {
  const v = Deno.env.get('VITE_APP_URL');
  return v ? v.replace(/\/+$/, '') : 'https://members.heatplex.com';
}

export interface LayoutOptions {
  preheader: string;
  heading: string;
  body_html: string;
  cta?: { label: string; url: string };
  unsubscribeUrl?: string;
}

export function layout(opts: LayoutOptions): string {
  const ctaRow = opts.cta ? `
    <tr>
      <td style="padding:24px 0;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td bgcolor="${BRAND.primary}" style="background-color:${BRAND.primary}; border-radius:12px;">
              <a href="${escapeHtml(opts.cta.url)}" style="display:inline-block; padding:16px 32px; font-family:${FONT_STACK}; font-size:16px; font-weight:600; color:${BRAND.background}; text-decoration:none; border-radius:12px;">${escapeHtml(opts.cta.label)}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : '';

  const unsubscribeRow = opts.unsubscribeUrl ? `
    <p style="margin:32px 0 0 0; font-size:12px; line-height:20px; color:${BRAND.textFaded}; text-align:center;">
      Don't want to receive these emails? <a href="${escapeHtml(opts.unsubscribeUrl)}" style="color:${BRAND.primary}; text-decoration:underline;">Unsubscribe</a>
    </p>
  ` : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(opts.heading)}</title>
    <style>
      body { margin:0; padding:0; }
      @media only screen and (max-width:600px) {
        .heat-card { border-radius:0 !important; }
        .heat-pad { padding-left:24px !important; padding-right:24px !important; }
      }
    </style>
  </head>
  <body style="margin:0; padding:0; background-color:${BRAND.background}; font-family:${FONT_STACK}; color:${BRAND.text};">
    <div style="display:none; max-height:0; overflow:hidden; visibility:hidden; opacity:0;">
      ${escapeHtml(opts.preheader)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:${BRAND.background}; padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="heat-card" style="max-width:600px; width:100%; background-color:${BRAND.surface}; border-radius:16px; overflow:hidden;">
            <tr>
              <td class="heat-pad" style="padding:32px 24px; text-align:center; background-color:${BRAND.surface}; border-radius:16px 16px 0 0;">
                <div style="font-family:${FONT_STACK}; font-size:24px; font-weight:700; color:${BRAND.text};">Heat Plex</div>
              </td>
            </tr>
            <tr>
              <td class="heat-pad" style="padding:40px 24px;">
                <h1 style="margin:0 0 24px 0; font-size:32px; font-weight:700; line-height:1.2; color:${BRAND.text};">${escapeHtml(opts.heading)}</h1>
                <div style="font-size:16px; line-height:24px; color:${BRAND.text};">
                  ${opts.body_html}
                </div>
                ${ctaRow}
                ${unsubscribeRow}
              </td>
            </tr>
            <tr>
              <td class="heat-pad" style="padding:24px; text-align:center; color:${BRAND.textFaded}; font-size:12px; line-height:20px;">
                ${escapeHtml(BRAND_FOOTER)}
                <br /><br />
                Need help? Call us on <a href="tel:02076220444" style="color:${BRAND.primary}; text-decoration:none;">020 7622 0444</a> or email <a href="mailto:contact@heatplex.com" style="color:${BRAND.primary}; text-decoration:none;">contact@heatplex.com</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function plain(opts: { heading: string; lines: string[]; cta?: { label: string; url: string } }): string {
  const out = [opts.heading, '', ...opts.lines];
  if (opts.cta) {
    out.push('', `${opts.cta.label}: ${opts.cta.url}`);
  }
  out.push('', '—', 'Heat Plex', '020 7622 0444', 'contact@heatplex.com');
  return out.join('\n');
}
