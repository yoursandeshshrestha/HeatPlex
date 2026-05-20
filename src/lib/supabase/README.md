# Supabase Client Library

Type-safe Supabase client with React hooks for Heat Plex membership platform.

## Structure

```
lib/supabase/
├── client.ts       # Supabase client initialization + type helpers
├── queries.ts      # Database query functions
├── hooks.ts        # React hooks for queries
└── index.ts        # Public exports
```

## Usage

### Basic Queries

```tsx
import { getMemberById, getMemberBookings } from '@/lib/supabase';

// Fetch member
const member = await getMemberById('uuid');

// Fetch member bookings
const bookings = await getMemberBookings('uuid');
```

### React Hooks

```tsx
import { useMember, useMemberBookings } from '@/lib/supabase';

function MemberProfile({ memberId }: { memberId: string }) {
  const { data: member, loading, error, refetch } = useMember(memberId);
  const { data: bookings } = useMemberBookings(memberId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!member) return <div>Member not found</div>;

  return (
    <div>
      <h1>{member.first_name} {member.last_name}</h1>
      <p>Plan: {member.plan}</p>
      <p>Savings: £{member.savings_total_pence / 100}</p>
      
      <h2>Bookings ({bookings?.length || 0})</h2>
      {/* ... */}
    </div>
  );
}
```

### Direct Supabase Client

```tsx
import { supabase } from '@/lib/supabase';

// Custom query
const { data, error } = await supabase
  .from('members')
  .select('*, bookings(*)')
  .eq('status', 'active')
  .order('started_at', { ascending: false });
```

## Available Hooks

### Member
- `useMember(memberId)` - Single member by ID
- `useMemberByEmail(email)` - Single member by email

### Bookings
- `useMemberBookings(memberId)` - All member bookings
- `useActiveBooking(memberId)` - Current active booking

### Certificates
- `useMemberCertificates(memberId)` - All CP12 certificates

### Jobs
- `useMemberJobs(memberId, limit?)` - Job history

### Payments
- `useMemberPayments(memberId)` - Payment history

### Savings
- `useMemberSavings(memberId)` - Savings events

### Engineers
- `useEngineers()` - All active engineers
- `useEngineerBySlug(slug)` - Single engineer by slug

## Type Helpers

```tsx
import type { Tables, InsertDto, UpdateDto } from '@/lib/supabase';

// Table row types
type Member = Tables<'members'>;
type Booking = Tables<'bookings'>;

// Insert types (for creating new records)
type NewMember = InsertDto<'members'>;

// Update types (for updating records)
type MemberUpdate = UpdateDto<'members'>;
```

## Authentication

See `src/contexts/AuthContext.tsx` for authentication implementation.

```tsx
import { useAuth, useMember } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, userType, signOut } = useAuth();
  const member = useMember(); // Returns member if authenticated as member

  return (
    <div>
      {userType === 'member' && <p>Welcome, {member?.first_name}!</p>}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

## Type Generation

To regenerate types after database changes:

```bash
npx supabase gen types --lang=typescript --linked > src/types/database.types.ts
```
