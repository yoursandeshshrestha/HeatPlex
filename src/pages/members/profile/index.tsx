/**
 * Member Profile Page
 * Edit personal information and preferences
 */

import { useMember } from '@/contexts/AuthContext';
import { ProfileTab } from '../components/ProfileTab';

export function MemberProfilePage() {
  const member = useMember();

  if (!member) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <ProfileTab member={member} />
    </div>
  );
}
