/**
 * Member Membership Page
 * View and manage membership details
 */

import { useMember } from '@/contexts/AuthContext';
import { MembershipTab } from './components/MembershipTab';

export function MemberMembershipPage() {
  const member = useMember();

  if (!member) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Membership</h1>
        <p className="text-muted-foreground mt-1">
          View your plan details and payment information
        </p>
      </div>

      <MembershipTab member={member} />
    </div>
  );
}
