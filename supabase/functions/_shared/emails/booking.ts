/**
 * Booking Email Templates
 */

import { layout, plain, escapeHtml, BRAND } from './layout.ts';

export interface BookingConfirmationData {
  firstName: string;
  bookingDate: string;
  slot: 'AM' | 'PM';
  address: string;
  accountUrl: string;
}

export interface BookingReminderData {
  firstName: string;
  date: string;
  slot: string;
  address: string;
  accountUrl: string;
}

export interface BookingCancelledData {
  firstName: string;
  date: string;
  slot: string;
  accountUrl: string;
}

export function bookingConfirmation(d: BookingConfirmationData) {
  const slotTime = d.slot === 'AM' ? '8am–12pm' : '12pm–4pm';
  const subject = `Service booked: ${d.bookingDate}, ${d.slot}`;

  const html = layout({
    preheader: `Service booked for ${d.bookingDate}`,
    heading: '✓ Service booked',
    body_html: `
      <p style="margin:0 0 16px 0;">Hi ${escapeHtml(d.firstName)},</p>
      <p style="margin:0 0 16px 0;">Your annual boiler service is confirmed. Here are the details:</p>
      <div style="background:${BRAND.surface2}; border:2px solid ${BRAND.primary}; border-radius:12px; padding:24px; margin:24px 0;">
        <div style="margin-bottom:16px;">
          <div style="color:${BRAND.textMuted}; font-size:14px; margin-bottom:4px;">Date</div>
          <div style="font-size:18px; font-weight:600;">${escapeHtml(d.bookingDate)}</div>
        </div>
        <div style="margin-bottom:16px;">
          <div style="color:${BRAND.textMuted}; font-size:14px; margin-bottom:4px;">Time</div>
          <div style="font-size:18px; font-weight:600;">${escapeHtml(slotTime)}</div>
        </div>
        <div>
          <div style="color:${BRAND.textMuted}; font-size:14px; margin-bottom:4px;">Service address</div>
          <div style="font-size:18px; font-weight:600;">${escapeHtml(d.address)}</div>
        </div>
      </div>
      <hr style="border:none; border-top:1px solid ${BRAND.borderStrong}; margin:24px 0;" />
      <p style="margin:0 0 16px 0;"><strong>What to expect:</strong></p>
      <ul style="margin:16px 0; padding-left:24px;">
        <li style="margin-bottom:12px;">Our engineer will arrive during your selected time window (${escapeHtml(slotTime)})</li>
        <li style="margin-bottom:12px;">The service typically takes 60–90 minutes</li>
        <li style="margin-bottom:12px;">You will receive your CP12 Gas Safety Certificate within 24 hours</li>
        <li style="margin-bottom:12px;">We will let you know the engineer's name in your reminder email</li>
      </ul>
      <div style="background:${BRAND.surface2}; border-radius:8px; padding:20px; margin:24px 0;">
        <div style="color:${BRAND.primary}; font-size:16px; font-weight:600; margin-bottom:8px;">Need to reschedule?</div>
        <div style="color:${BRAND.textMuted}; font-size:14px;">You can reschedule or cancel from your account anytime up to 48 hours before your booking.</div>
      </div>
    `,
    cta: { label: 'View booking', url: d.accountUrl },
  });

  const text = plain({
    heading: subject,
    lines: [
      `Hi ${d.firstName},`,
      '',
      'Your annual boiler service is confirmed.',
      '',
      `Date: ${d.bookingDate}`,
      `Time: ${slotTime}`,
      `Address: ${d.address}`,
      '',
      'What to expect:',
      `• Engineer arrives ${slotTime}`,
      '• Service takes 60-90 minutes',
      '• CP12 certificate within 24 hours',
    ],
    cta: { label: 'View booking', url: d.accountUrl },
  });

  return { subject, html, text };
}

export function bookingReminder(d: BookingReminderData) {
  const subject = `Reminder: Service Tomorrow - Heat Plex`;

  const html = layout({
    preheader: 'Your service is tomorrow',
    heading: 'Service Reminder 🔔',
    body_html: `
      <p style="margin:0 0 16px 0;">Hi ${escapeHtml(d.firstName)},</p>
      <p style="margin:0 0 16px 0;">This is a friendly reminder that your boiler service is scheduled for tomorrow.</p>
      <div style="background:${BRAND.surface2}; border-left:4px solid ${BRAND.info}; padding:16px; margin:20px 0; border-radius:8px;">
        <strong>📅 Date:</strong> ${escapeHtml(d.date)}<br>
        <strong>🕐 Time:</strong> ${escapeHtml(d.slot)}<br>
        <strong>📍 Location:</strong> ${escapeHtml(d.address)}
      </div>
      <div style="background:${BRAND.surface2}; padding:16px; margin:20px 0; border-radius:8px;">
        <p style="margin:0 0 12px 0;"><strong>Important reminders:</strong></p>
        <ul style="margin:0; padding-left:24px;">
          <li style="margin-bottom:8px;">Our engineer will call 30 minutes before arrival</li>
          <li style="margin-bottom:8px;">Please ensure someone age 18+ is home</li>
          <li style="margin-bottom:8px;">Clear access to the boiler would be appreciated</li>
          <li>Service duration: 60-90 minutes</li>
        </ul>
      </div>
      <p style="margin:24px 0 0 0;"><strong>Need to reschedule?</strong> Please call us immediately at 020 7622 0444 as your appointment is within 48 hours.</p>
    `,
    cta: { label: 'View Booking Details', url: d.accountUrl },
  });

  const text = plain({
    heading: subject,
    lines: [
      `Hi ${d.firstName},`,
      '',
      'Your boiler service is tomorrow.',
      '',
      `Date: ${d.date}`,
      `Time: ${d.slot}`,
      `Address: ${d.address}`,
      '',
      'Important reminders:',
      '• Engineer calls 30 min before arrival',
      '• Someone 18+ must be home',
      '• Service takes 60-90 minutes',
    ],
    cta: { label: 'View Booking Details', url: d.accountUrl },
  });

  return { subject, html, text };
}

export function bookingCancelled(d: BookingCancelledData) {
  const subject = 'Booking Cancelled - Heat Plex Service';

  const html = layout({
    preheader: 'Your booking has been cancelled',
    heading: 'Booking Cancelled',
    body_html: `
      <p style="margin:0 0 16px 0;">Hi ${escapeHtml(d.firstName)},</p>
      <p style="margin:0 0 16px 0;">Your service appointment has been successfully cancelled.</p>
      <div style="background:${BRAND.surface2}; border-left:4px solid ${BRAND.warning}; padding:16px; margin:20px 0; border-radius:8px;">
        <strong>📅 Date:</strong> ${escapeHtml(d.date)}<br>
        <strong>🕐 Time:</strong> ${escapeHtml(d.slot)}
      </div>
      <p style="margin:24px 0 0 0;">You can book a new appointment anytime from your dashboard.</p>
    `,
    cta: { label: 'Book New Service', url: d.accountUrl },
  });

  const text = plain({
    heading: subject,
    lines: [
      `Hi ${d.firstName},`,
      '',
      'Your service appointment has been cancelled.',
      '',
      `Date: ${d.date}`,
      `Time: ${d.slot}`,
      '',
      'You can book a new appointment anytime from your dashboard.',
    ],
    cta: { label: 'Book New Service', url: d.accountUrl },
  });

  return { subject, html, text };
}
