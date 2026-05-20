-- =============================================================================
-- SEED DATA FOR DEVELOPMENT / TESTING
-- =============================================================================
-- This migration adds test members and sample data for development
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)
-- =============================================================================

-- Create auth users for testing (password: password123)
-- Note: Password is bcrypt hashed version of "password123"
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'alice@heatplex.test',
    '$2b$10$UHGQM7XXfy9bxYyfZ263/u6uh17yrQxcz9CuwROsIVkY/gPz/MsDS', -- password123
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    '{"sub":"00000000-0000-0000-0000-000000000001","email":"alice@heatplex.test","email_verified":true,"phone_verified":false}',
    'email',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Test member (annual plan)
INSERT INTO members (
    id,
    email,
    phone,
    first_name,
    last_name,
    address_line_1,
    address_town,
    address_postcode,
    plan,
    status,
    started_at,
    renewal_date,
    terms_accepted_at,
    commusoft_customer_id,
    savings_total_pence
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'alice@heatplex.test',
    '+447700900000',
    'Alice',
    'Johnson',
    '64 Stanley Grove',
    'Battersea',
    'SW8 3PG',
    'annual',
    'active',
    NOW() - INTERVAL '30 days',
    NOW() + INTERVAL '335 days',
    NOW() - INTERVAL '30 days',
    'commu_test_001',
    14000
) ON CONFLICT (id) DO NOTHING;

-- Test member (monthly plan)
INSERT INTO members (
    id,
    email,
    phone,
    first_name,
    last_name,
    address_line_1,
    address_town,
    address_postcode,
    plan,
    status,
    started_at,
    renewal_date,
    terms_accepted_at,
    commusoft_customer_id
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'bob@heatplex.test',
    '+447700900001',
    'Bob',
    'Smith',
    '123 Test Street',
    'Chelsea',
    'SW3 1AB',
    'monthly',
    'active',
    NOW() - INTERVAL '2 months',
    NOW() + INTERVAL '10 months',
    NOW() - INTERVAL '2 months',
    'commu_test_002'
) ON CONFLICT (id) DO NOTHING;

-- Test member (payment overdue)
INSERT INTO members (
    id,
    email,
    phone,
    first_name,
    last_name,
    address_line_1,
    address_town,
    address_postcode,
    plan,
    status,
    started_at,
    renewal_date,
    terms_accepted_at
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    'charlie@heatplex.test',
    '+447700900002',
    'Charlie',
    'Brown',
    '456 Test Lane',
    'Clapham',
    'SW4 2CD',
    'monthly',
    'payment_overdue',
    NOW() - INTERVAL '3 months',
    NOW() + INTERVAL '9 months',
    NOW() - INTERVAL '3 months'
) ON CONFLICT (id) DO NOTHING;

-- Test savings events for first member
INSERT INTO savings_events (member_id, source, amount_pence, source_ref, applied_at) VALUES
    ('00000000-0000-0000-0000-000000000001', 'annual_service_included', 14000, 'annual_service_2025', NOW() - INTERVAL '15 days'),
    ('00000000-0000-0000-0000-000000000001', 'job_discount', 8000, 'job_001', NOW() - INTERVAL '10 days'),
    ('00000000-0000-0000-0000-000000000001', 'job_discount', 5000, 'job_002', NOW() - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Test booking for first member
INSERT INTO bookings (
    id,
    member_id,
    scheduled_date,
    slot,
    status,
    engineer_id
) VALUES (
    '00000000-0000-0000-0000-000000000100',
    '00000000-0000-0000-0000-000000000001',
    CURRENT_DATE + INTERVAL '7 days',
    'AM',
    'booked',
    (SELECT id FROM engineers WHERE slug = 'vas')
) ON CONFLICT (id) DO NOTHING;

-- Test mandate for first member
INSERT INTO mandates (
    id,
    member_id,
    gocardless_mandate_id,
    scheme,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000200',
    '00000000-0000-0000-0000-000000000001',
    'MD0000TEST001',
    'bacs',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Test payment for first member
INSERT INTO payments (
    id,
    member_id,
    mandate_id,
    gocardless_payment_id,
    amount_pence,
    type,
    status,
    charge_date,
    confirmed_at
) VALUES (
    '00000000-0000-0000-0000-000000000300',
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000200',
    'PM0000TEST001',
    19900,
    'signup_annual',
    'confirmed',
    CURRENT_DATE - INTERVAL '30 days',
    NOW() - INTERVAL '30 days'
) ON CONFLICT (id) DO NOTHING;

-- Test gas certificate for first member
INSERT INTO gas_certificates (
    id,
    member_id,
    commusoft_certificate_id,
    issued_at,
    expires_at,
    engineer_id
) VALUES (
    '00000000-0000-0000-0000-000000000400',
    '00000000-0000-0000-0000-000000000001',
    'CP12_TEST_001',
    NOW() - INTERVAL '15 days',
    CURRENT_DATE + INTERVAL '350 days',
    (SELECT id FROM engineers WHERE slug = 'vas')
) ON CONFLICT (id) DO NOTHING;

-- Test job for first member
INSERT INTO member_jobs (
    id,
    member_id,
    commusoft_job_id,
    job_type,
    scheduled_date,
    completed_at,
    engineer_id,
    total_invoiced_pence,
    member_discount_pence,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000500',
    '00000000-0000-0000-0000-000000000001',
    'JOB_TEST_001',
    'Boiler Repair',
    CURRENT_DATE - INTERVAL '10 days',
    NOW() - INTERVAL '10 days',
    (SELECT id FROM engineers WHERE slug = 'vas'),
    40000,
    8000,
    'completed'
) ON CONFLICT (id) DO NOTHING;

-- Test commission for engineer
INSERT INTO engineer_commissions (
    member_id,
    engineer_id,
    attributed_at,
    amount_pence,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    (SELECT id FROM engineers WHERE slug = 'vas'),
    NOW() - INTERVAL '30 days',
    2500,
    'pending'
) ON CONFLICT DO NOTHING;

-- =============================================================================
-- STAFF AUTH USERS
-- =============================================================================

-- Auth user for Joe (Owner)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'joe@heatplex.com',
    '$2b$10$UHGQM7XXfy9bxYyfZ263/u6uh17yrQxcz9CuwROsIVkY/gPz/MsDS',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '{"sub":"10000000-0000-0000-0000-000000000001","email":"joe@heatplex.com","email_verified":true,"phone_verified":false}',
    'email',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Auth user for Miles (Admin)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'miles@heatplex.com',
    '$2b$10$UHGQM7XXfy9bxYyfZ263/u6uh17yrQxcz9CuwROsIVkY/gPz/MsDS',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    '{"sub":"10000000-0000-0000-0000-000000000002","email":"miles@heatplex.com","email_verified":true,"phone_verified":false}',
    'email',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Auth user for Jackie (Staff)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'jackie@heatplex.com',
    '$2b$10$UHGQM7XXfy9bxYyfZ263/u6uh17yrQxcz9CuwROsIVkY/gPz/MsDS',
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
    id,
    provider_id,
    user_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES (
    '10000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000003',
    '{"sub":"10000000-0000-0000-0000-000000000003","email":"jackie@heatplex.com","email_verified":true,"phone_verified":false}',
    'email',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

