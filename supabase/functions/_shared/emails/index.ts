/**
 * Heat Plex Email Templates Registry
 *
 * Centralized registry of all email templates.
 * Each category has its own file for better organization.
 */

// Welcome emails
import { welcomeStep1, type WelcomeStep1Data } from './welcome.ts';

// Auth emails
import { magicLink, type MagicLinkData } from './auth.ts';

// Booking emails
import {
  bookingConfirmation,
  bookingReminder,
  bookingCancelled,
  type BookingConfirmationData,
  type BookingReminderData,
  type BookingCancelledData,
} from './booking.ts';

// Payment emails
import {
  paymentConfirmation,
  paymentFailed,
  type PaymentConfirmationData,
  type PaymentFailedData,
} from './payment.ts';

// Renewal emails
import {
  renewalReminder,
  type RenewalReminderData,
} from './renewal.ts';

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

// Template registry type
export type EmailTemplateKey =
  | 'welcome-step-1'
  | 'magic-link'
  | 'booking-confirmation'
  | 'booking-reminder'
  | 'booking-cancelled'
  | 'payment-confirmation'
  | 'payment-failed'
  | 'renewal-reminder';

type TemplateRenderers = {
  'welcome-step-1': (d: WelcomeStep1Data) => RenderedEmail;
  'magic-link': (d: MagicLinkData) => RenderedEmail;
  'booking-confirmation': (d: BookingConfirmationData) => RenderedEmail;
  'booking-reminder': (d: BookingReminderData) => RenderedEmail;
  'booking-cancelled': (d: BookingCancelledData) => RenderedEmail;
  'payment-confirmation': (d: PaymentConfirmationData) => RenderedEmail;
  'payment-failed': (d: PaymentFailedData) => RenderedEmail;
  'renewal-reminder': (d: RenewalReminderData) => RenderedEmail;
};

export type EmailTemplateData<K extends EmailTemplateKey> = Parameters<TemplateRenderers[K]>[0];

// Registry of all templates
export const EMAIL_TEMPLATES: TemplateRenderers = {
  'welcome-step-1': welcomeStep1,
  'magic-link': magicLink,
  'booking-confirmation': bookingConfirmation,
  'booking-reminder': bookingReminder,
  'booking-cancelled': bookingCancelled,
  'payment-confirmation': paymentConfirmation,
  'payment-failed': paymentFailed,
  'renewal-reminder': renewalReminder,
};
