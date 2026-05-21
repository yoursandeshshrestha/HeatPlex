/**
 * Signup Confirmation Page
 * Handles return from GoCardless after payment authorization
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase';

export function SignupConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleConfirmation();
  }, []);

  async function handleConfirmation() {
    const status = searchParams.get('status');
    const redirectFlowId = searchParams.get('redirect_flow_id');

    // Check if user cancelled
    if (status === 'cancelled') {
      navigate('/join/plan');
      return;
    }

    // If no redirect flow ID, something went wrong
    if (!redirectFlowId) {
      setError('Invalid confirmation. Please try again.');
      return;
    }

    try {
      // Send welcome email
      const email = searchParams.get('email');
      if (email) {
        await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              type: 'welcome',
              to: email,
              data: {
                firstName: searchParams.get('firstName') || '',
                plan: searchParams.get('plan') || 'annual',
                dashboardUrl: `${window.location.origin}/member`,
              },
            }),
          }
        );
      }

      // Navigate to completion page
      navigate('/join/done');
    } catch (err) {
      console.error('Confirmation error:', err);
      setError('Failed to complete signup. Please contact support.');
    }
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <LoadingScreen message="Confirming your payment..." />;
}
