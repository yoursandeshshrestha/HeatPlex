/**
 * Send Booking Reminders
 * Cron job that sends reminder emails 24 hours before service appointments
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BookingReminder {
  booking_id: string;
  scheduled_date: string;
  slot: 'AM' | 'PM';
  email: string;
  first_name: string;
  address_line_1: string;
  address_line_2: string | null;
  address_town: string;
  address_postcode: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch bookings that need reminders
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings_needing_reminders')
      .select('*');

    if (fetchError) {
      throw fetchError;
    }

    if (!bookings || bookings.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No reminders to send', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    // Send reminder for each booking
    for (const booking of bookings as BookingReminder[]) {
      try {
        // Format slot label
        const slotLabel = booking.slot === 'AM'
          ? 'Morning (8:00 AM – 12:00 PM)'
          : 'Afternoon (12:00 PM – 4:00 PM)';

        // Format address
        const address = [
          booking.address_line_1,
          booking.address_line_2,
          `${booking.address_town}, ${booking.address_postcode}`
        ].filter(Boolean).join(', ');

        // Format date
        const date = new Date(booking.scheduled_date);
        const formattedDate = date.toLocaleDateString('en-GB', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        // Send email via send-email function
        const emailResponse = await supabase.functions.invoke('send-email', {
          body: {
            type: 'booking_reminder',
            to: booking.email,
            data: {
              firstName: booking.first_name,
              date: formattedDate,
              slot: slotLabel,
              address: address,
            },
          },
        });

        if (emailResponse.error) {
          throw emailResponse.error;
        }

        // Mark reminder as sent
        const { error: insertError } = await supabase
          .from('booking_reminder_sent')
          .insert({
            booking_id: booking.booking_id,
            sent_at: new Date().toISOString(),
          });

        if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
          console.error('Failed to mark reminder as sent:', insertError);
        }

        results.push({
          booking_id: booking.booking_id,
          email: booking.email,
          status: 'sent',
        });
      } catch (emailError) {
        console.error(`Failed to send reminder for booking ${booking.booking_id}:`, emailError);
        results.push({
          booking_id: booking.booking_id,
          email: booking.email,
          status: 'failed',
          error: emailError instanceof Error ? emailError.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Booking reminders processed',
        count: bookings.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Send reminders error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
