/**
 * Email Sending Service
 * Renders React Email templates and sends via Resend
 */

import { Resend } from 'resend';
import { renderEmail } from '@/emails';

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export interface SendEmailOptions {
  templateKey: string;
  to: string | string[];
  props: Record<string, unknown>;
  tags?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email using a React Email template
 */
export async function sendEmail({
  templateKey,
  to,
  props,
  tags,
}: SendEmailOptions): Promise<SendEmailResult> {
  try {
    // Render template
    const { html, text, subject } = await renderEmail(templateKey, props);

    // Determine sender based on template type
    const from = getFromAddress(templateKey);

    // Send via Resend
    const result = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text,
      tags: {
        template_key: templateKey,
        ...tags,
      },
    });

    if (result.error) {
      console.error('[Email] Send failed:', result.error);
      return {
        success: false,
        error: result.error.message,
      };
    }

    console.log('[Email] Sent successfully:', {
      id: result.data?.id,
      template: templateKey,
      to,
    });

    return {
      success: true,
      id: result.data?.id,
    };
  } catch (error) {
    console.error('[Email] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get the appropriate "from" address based on email type
 */
function getFromAddress(templateKey: string): string {
  // Marketing emails (legitimate interest)
  if (
    templateKey.startsWith('post-job') ||
    templateKey.startsWith('win-back')
  ) {
    return 'Heat Plex <news@heatplex.com>';
  }

  // Transactional emails
  return 'Heat Plex Membership <members@heatplex.com>';
}

/**
 * Send welcome email to new member
 */
export async function sendWelcomeEmail(member: {
  email: string;
  first_name: string;
  plan: 'annual' | 'monthly';
  renewal_date: Date;
}) {
  return sendEmail({
    templateKey: 'welcome-step-1',
    to: member.email,
    props: {
      firstName: member.first_name,
      plan: member.plan,
      renewalDate: new Date(member.renewal_date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      accountUrl: `${window.location.origin}/member`,
    },
    tags: {
      member_email: member.email,
      sequence: 'welcome_new_member',
      step: '0',
    },
  });
}
