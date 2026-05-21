/**
 * Member Cancellation Flow
 * FR-10.x: Cancellation wizard with reason selection, retention, confirmation
 * TODO: Implement full 3-step cancellation flow
 */

import { useNavigate } from 'react-router-dom';
import { useMember } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SectionPanel, SUPPORT_PHONE_DISPLAY } from '../components/member-ui';
import { XCircle, ArrowLeft, AlertCircle, Phone, Mail } from 'lucide-react';

export function CancelPage() {
  const member = useMember();
  const navigate = useNavigate();

  if (!member) return null;

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => navigate('/member/billing')}
        className="mb-4 cursor-pointer"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Billing
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-red-400">
          Cancel Membership
        </h1>
        <p className="text-muted-foreground mt-1">
          We're sorry to see you go
        </p>
      </div>

      <div className="space-y-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <p className="font-medium mb-2">The cancellation flow will include:</p>
            <ul className="list-disc ml-6 space-y-1 text-sm">
              <li>Reason selection</li>
              <li>Retention offers based on your reason</li>
              <li>Confirmation of cancellation date</li>
            </ul>
          </AlertDescription>
        </Alert>

        <SectionPanel title="Contact Us to Cancel" icon={XCircle}>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              For now, please contact us directly to cancel your membership:
            </p>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start cursor-pointer"
                onClick={() => {
                  window.location.href = `tel:${SUPPORT_PHONE_DISPLAY.replace(/\s/g, '')}`;
                }}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call {SUPPORT_PHONE_DISPLAY}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start cursor-pointer"
                onClick={() => {
                  window.location.href = 'mailto:contact@heatplex.com?subject=Membership Cancellation Request';
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email contact@heatplex.com
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              We'll be happy to help you with your cancellation and discuss any concerns you may have.
            </p>
          </div>
        </SectionPanel>
      </div>
    </div>
  );
}
