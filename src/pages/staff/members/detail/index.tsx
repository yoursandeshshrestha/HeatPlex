/**
 * Member Detail Page
 * Comprehensive view of a single member with tabs for different sections
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { MemberOverviewTab } from './tabs/OverviewTab';
import { MemberBookingsTab } from './tabs/BookingsTab';
import { MemberPaymentsTab } from './tabs/PaymentsTab';
import { MemberNotesTab } from './tabs/NotesTab';
import { MemberActionsMenu } from './components/MemberActionsMenu';
import { MemberStatusBadge } from './components/MemberStatusBadge';
import { MemberAvatar } from './components/detail-ui';
import { formatDate } from '@/lib/date-utils';
import { toast } from 'sonner';

type Member = Tables<'members'>;

const MEMBER_TABS = ['overview', 'bookings', 'payments', 'notes'] as const;
type MemberTab = (typeof MEMBER_TABS)[number];

function parseTab(value: string | null): MemberTab {
  if (value && MEMBER_TABS.includes(value as MemberTab)) {
    return value as MemberTab;
  }
  return 'overview';
}

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const activeTab = parseTab(searchParams.get('tab'));

  useEffect(() => {
    if (id) {
      loadMember();
    }
  }, [id]);

  async function loadMember() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id!)
        .single();

      if (error) throw error;

      setMember(data);
    } catch (error) {
      console.error('Error loading member:', error);
      toast.error('Failed to load member details');
      navigate('/staff/members');
    } finally {
      setLoading(false);
    }
  }

  function handleMemberUpdate() {
    loadMember();
  }

  function handleTabChange(tab: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (tab === 'overview') {
          next.delete('tab');
        } else {
          next.set('tab', tab);
        }
        return next;
      },
      { replace: true }
    );
  }

  if (loading) {
    return <LoadingScreen message="Loading member details..." />;
  }

  if (!member) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold">Member not found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This member may have been removed or the link is incorrect.
          </p>
          <Button onClick={() => navigate('/staff/members')} className="mt-4 cursor-pointer">
            Back to Members
          </Button>
        </div>
      </div>
    );
  }

  const planLabel = member.plan === 'annual' ? 'Annual' : 'Monthly';
  const planPrice = member.plan === 'annual' ? '£199/yr' : '£19.99/mo';

  return (
    <div className="space-y-6 p-6">
      <button
        type="button"
        onClick={() => navigate('/staff/members')}
        className="mb-6 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Members
      </button>

      <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-6">
        <div className="flex min-w-0 items-start gap-4">
          <MemberAvatar firstName={member.first_name} lastName={member.last_name} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-semibold tracking-tight">
                {member.first_name} {member.last_name}
              </h1>
              <MemberStatusBadge status={member.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {planLabel} · {planPrice}
              {member.started_at && <> · Member since {formatDate(member.started_at)}</>}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{member.email}</p>
          </div>
        </div>

        <MemberActionsMenu member={member} onUpdate={handleMemberUpdate} />
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="cursor-pointer">
            Overview
          </TabsTrigger>
          <TabsTrigger value="bookings" className="cursor-pointer">
            Bookings
          </TabsTrigger>
          <TabsTrigger value="payments" className="cursor-pointer">
            Payments
          </TabsTrigger>
          <TabsTrigger value="notes" className="cursor-pointer">
            Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <MemberOverviewTab member={member} onUpdate={handleMemberUpdate} />
        </TabsContent>

        <TabsContent value="bookings">
          <MemberBookingsTab memberId={member.id} />
        </TabsContent>

        <TabsContent value="payments">
          <MemberPaymentsTab memberId={member.id} member={member} />
        </TabsContent>

        <TabsContent value="notes">
          <MemberNotesTab memberId={member.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
