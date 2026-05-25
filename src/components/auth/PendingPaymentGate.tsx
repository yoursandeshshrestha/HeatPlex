/**
 * Redirects pending members to complete payment before using the portal.
 */

import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useMember } from '@/contexts/AuthContext';

export function PendingPaymentGate({ children }: { children: ReactNode }) {
  const member = useMember();

  if (member?.status === 'pending') {
    return <Navigate to="/member/complete-payment" replace />;
  }

  return <>{children}</>;
}
