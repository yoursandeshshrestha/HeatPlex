/**
 * Member Dashboard Page (Overview)
 * Main overview page showing membership status and quick actions
 */

import { useMember } from '@/contexts/AuthContext';
import { OverviewTab } from './components/OverviewTab';

export function MemberDashboardPage() {
  const member = useMember();

  if (!member) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {member.first_name}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's your Heat Plex membership overview
        </p>
      </div>

      <OverviewTab member={member} />
    </div>
  );
}
