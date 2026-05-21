/**
 * Member Jobs & Invoices Page
 * FR-7.x: Job history, invoice details, member discount visibility
 * TODO: Implement full functionality
 */

import { useMember } from '@/contexts/AuthContext';
import { SectionPanel, PanelEmpty } from '../components/member-ui';
import { FileText } from 'lucide-react';

export function JobsPage() {
  const member = useMember();

  if (!member) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Jobs & Invoices</h1>
        <p className="text-muted-foreground mt-1">
          View your complete job history and invoices
        </p>
      </div>

      <div className="space-y-8">
        <SectionPanel title="Recent Jobs" icon={FileText} flushList>
          <PanelEmpty
            flush
            message="No jobs yet"
            hint="Your completed jobs and invoices will appear here"
          />
        </SectionPanel>
      </div>
    </div>
  );
}
