# Heat Plex Database Schema

Complete database schema for the Heat Plex Membership Platform, based on the FRD specification.

## Overview

This schema supports:
- ✅ Member management with subscription lifecycle
- ✅ GoCardless payment integration (mandates, subscriptions, payments)
- ✅ Commusoft integration (jobs, certificates, bookings)
- ✅ Email automation sequences
- ✅ Admin dashboard (KPIs, alerts, audit logs)
- ✅ Engineer commission tracking
- ✅ Row-level security (RLS) policies

## Database Structure

### Core Tables
- `members` - Customer records with subscription status
- `staff` - Internal Heat Plex team members
- `sessions` - Authentication sessions
- `auth_tokens` - Magic link tokens
- `engineers` - Heat Plex engineers (Vas, Marinel, Spencer, Ryan, Albert)

### Payment Tables
- `mandates` - GoCardless Direct Debit mandates
- `subscriptions` - Monthly recurring subscriptions
- `payments` - All payment transactions

### Operational Tables
- `bookings` - Member-initiated service bookings
- `member_jobs` - Cached job records from Commusoft
- `gas_certificates` - CP12 certificates
- `savings_events` - Append-only savings ledger
- `job_completions` - For KPI tracking

### Communication Tables
- `templates` - Email templates
- `sequence_enrollments` - Active email sequences
- `scheduled_steps` - Email queue
- `send_log` - Email delivery tracking
- `unsubscribes` - Opt-out records

### System Tables
- `commusoft_outbox` - Reliable outbound writes to Commusoft
- `processed_webhook_events` - Webhook idempotency
- `alerts` - Admin alerts inbox
- `audit_log` - Append-only audit trail
- `system_settings` - Global configuration

## Quick Start

### 1. Apply Migrations to Supabase

```bash
# Make sure you're in the project root
cd /Users/sandeshshrestha/Desktop/Milktree/heatplex

# Link to your Supabase project (if not already linked)
npx supabase link --project-ref wwiiewoqnlvjgovobmga

# Apply all migrations
npx supabase db push

# Optional: Load seed data for testing
npx supabase db seed
```

### 2. Verify Setup

```bash
# Check migration status
npx supabase migration list

# Open Supabase Studio
npx supabase studio
```

### 3. Connect from Frontend

```bash
# Install Supabase client
npm install @supabase/supabase-js

# Or with bun
bun add @supabase/supabase-js
```

## Migration Files

| File | Description |
|------|-------------|
| `20260520000001_core_tables.sql` | Members, staff, auth, engineers |
| `20260520000002_payment_tables.sql` | Mandates, subscriptions, payments |
| `20260520000003_operational_tables.sql` | Bookings, jobs, certificates, savings |
| `20260520000004_communication_tables.sql` | Templates, sequences, email logs |
| `20260520000005_system_tables.sql` | Webhooks, outbox, alerts, audit, settings |
| `20260520000006_rls_policies.sql` | Row-level security policies |

## Seed Data

The `seed.sql` file creates test data:
- 3 test members (active, monthly, payment overdue)
- 1 test booking
- Sample payments, certificates, jobs
- Engineer commission records

**To load seed data:**
```bash
npx supabase db reset  # Resets and applies all migrations + seed
# OR
psql <your-connection-string> < supabase/seed.sql
```

## Key Features

### Auto-Generated IDs
All tables use UUIDv4 for primary keys via `uuid_generate_v4()`.

### Auto-Updated Timestamps
Tables with `updated_at` automatically update via trigger:
```sql
CREATE TRIGGER update_<table>_updated_at BEFORE UPDATE ON <table>
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Savings Recalculation
When a savings event is inserted, the member's `savings_total_pence` automatically updates:
```sql
CREATE TRIGGER trigger_recalculate_savings AFTER INSERT ON savings_events
    FOR EACH ROW EXECUTE FUNCTION recalculate_member_savings();
```

### Audit Log Protection
The `audit_log` table is append-only — updates and deletes are blocked by triggers.

### Row-Level Security
- **Members** can read/update their own data only
- **Staff** have full access to all data
- **Service role** (Edge Functions) bypass RLS for backend operations

## Environment Variables

Update your `.env` file:

```bash
# Already configured
VITE_SUPABASE_URL=https://wwiiewoqnlvjgovobmga.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Nw3zaE3tENancGMINZxLSg_Oc2DrXS_

# Add service role key for backend operations (get from Supabase dashboard)
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Next Steps

After database setup:

1. ✅ **Install Supabase Client** (see Phase 2)
2. ✅ **Create authentication flow** (magic links)
3. ✅ **Build signup wizard** (4 steps)
4. ✅ **Implement member portal**
5. ✅ **Integrate GoCardless payments**
6. ✅ **Connect Commusoft API**

## Schema Diagram

```
members ─┬─→ bookings
         ├─→ member_jobs
         ├─→ gas_certificates
         ├─→ savings_events
         ├─→ payments
         ├─→ mandates ──→ subscriptions
         ├─→ sequence_enrollments ──→ scheduled_steps
         └─→ engineer_commissions

staff ───→ audit_log
staff ───→ internal_notes
staff ───→ alerts (resolved_by)

engineers ─┬─→ bookings
           ├─→ member_jobs
           ├─→ gas_certificates
           ├─→ engineer_commissions
           └─→ job_completions

commusoft_outbox (outbound API writes)
processed_webhook_events (inbound webhooks)
```

## Maintenance

### Backup
```bash
# Full backup
npx supabase db dump -f backup.sql

# Schema only
npx supabase db dump --schema-only -f schema.sql
```

### Reset Database
```bash
# WARNING: This deletes all data
npx supabase db reset
```

### Create New Migration
```bash
npx supabase migration new <migration_name>
```

## Support

- **FRD Reference**: See `FRD-heatplex.md` Section 9 (Data Model)
- **Supabase Docs**: https://supabase.com/docs
- **Project Info**: See `docs/info-for-dev.md`
