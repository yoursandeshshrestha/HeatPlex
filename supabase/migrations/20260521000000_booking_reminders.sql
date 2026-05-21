-- Create table to track sent reminders
create table if not exists booking_reminder_sent (
  booking_id uuid primary key references bookings(id) on delete cascade,
  sent_at timestamptz not null default now()
);

-- Grant access
grant all on booking_reminder_sent to authenticated;
grant all on booking_reminder_sent to service_role;

-- Add index for faster lookups
create index if not exists idx_booking_reminder_sent_booking_id on booking_reminder_sent(booking_id);

-- Create a view for bookings that need reminders
create or replace view bookings_needing_reminders as
select
  b.id as booking_id,
  b.scheduled_date,
  b.slot,
  b.status,
  m.id as member_id,
  m.email,
  m.first_name,
  m.address_line_1,
  m.address_line_2,
  m.address_town,
  m.address_postcode
from bookings b
join members m on m.id = b.member_id
where b.status in ('booked', 'rescheduled')
  and b.scheduled_date = (current_date + interval '1 day')::date
  and not exists (
    select 1 from booking_reminder_sent
    where booking_id = b.id
  );

-- Grant access to the view
grant select on bookings_needing_reminders to service_role;

comment on view bookings_needing_reminders is 'Bookings scheduled for tomorrow that haven''t received a reminder email yet';

-- Note: The actual cron job will be set up via Supabase Dashboard or a separate edge function
-- that queries this view and sends emails. This avoids complex pg_cron + pg_net setup.
