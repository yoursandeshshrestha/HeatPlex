/**
 * Member Certificates Page
 * FR-6.x: CP12 certificates list and download
 * TODO: Implement full functionality
 */

import { useMember } from '@/contexts/AuthContext';
import { SectionPanel, PanelEmpty } from '../components/member-ui';
import { Award } from 'lucide-react';

export function CertificatesPage() {
  const member = useMember();

  if (!member) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
        <p className="text-muted-foreground mt-1">
          Download your Gas Safety Certificates (CP12)
        </p>
      </div>

      <div className="space-y-8">
        <SectionPanel title="Your Certificates" icon={Award} flushList>
          <PanelEmpty
            flush
            message="No certificates yet"
            hint="You'll see your CP12 here within 24 hours of your annual service"
          />
        </SectionPanel>
      </div>
    </div>
  );
}
