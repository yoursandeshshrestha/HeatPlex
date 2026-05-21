/**
 * Admin KPI Dashboard
 * Main overview for Heat Plex operations team
 */

import { useState, useEffect } from 'react';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, subWeeks, subMonths } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileDown, AlertCircle, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingScreen } from '@/components/ui/loading-screen';
import {
  getMemberKPIs,
  getRevenueKPIs,
  getOperationalKPIs,
  getTopEngineers,
  type DateRangeFilter,
  type MemberKPIs,
  type RevenueKPIs,
  type OperationalKPIs,
  type EngineerStats,
} from '@/lib/supabase/queries';
import { DashboardStatsCards } from './components/DashboardStatsCards';
import { OperationalMetricsCards } from './components/OperationalMetricsCards';
import { TopEngineersCard } from './components/TopEngineersCard';
import { DateRangeSelector } from './components/DateRangeSelector';

type DateRangePreset = 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';

function getDateRangeFromPreset(preset: DateRangePreset): DateRangeFilter {
  const now = new Date();

  switch (preset) {
    case 'this_week':
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
    case 'last_week':
      const lastWeek = subWeeks(now, 1);
      return {
        from: startOfWeek(lastWeek, { weekStartsOn: 1 }),
        to: endOfWeek(lastWeek, { weekStartsOn: 1 }),
      };
    case 'this_month':
      return {
        from: startOfMonth(now),
        to: endOfMonth(now),
      };
    case 'last_month':
      const lastMonth = subMonths(now, 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    default:
      return {
        from: startOfWeek(now, { weekStartsOn: 1 }),
        to: endOfWeek(now, { weekStartsOn: 1 }),
      };
  }
}

export function AdminDashboardPage() {
  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_week');
  const [dateRange, setDateRange] = useState<DateRangeFilter>(getDateRangeFromPreset('this_week'));
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [memberKPIs, setMemberKPIs] = useState<MemberKPIs | null>(null);
  const [revenueKPIs, setRevenueKPIs] = useState<RevenueKPIs | null>(null);
  const [operationalKPIs, setOperationalKPIs] = useState<OperationalKPIs | null>(null);
  const [topEngineers, setTopEngineers] = useState<EngineerStats[]>([]);
  const [unresolvedAlerts] = useState(0); // Placeholder until alerts system is built

  useEffect(() => {
    loadDashboardData();
  }, [dateRange]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const [members, revenue, operational, engineers] = await Promise.all([
        getMemberKPIs(dateRange),
        getRevenueKPIs(dateRange),
        getOperationalKPIs(dateRange),
        getTopEngineers(dateRange, 3),
      ]);

      setMemberKPIs(members);
      setRevenueKPIs(revenue);
      setOperationalKPIs(operational);
      setTopEngineers(engineers);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  function handleDatePresetChange(preset: DateRangePreset) {
    setDatePreset(preset);
    setDateRange(getDateRangeFromPreset(preset));
  }

  function handleExportReport() {
    // TODO: Generate PDF report
    console.log('Export weekly report');
  }

  if (initialLoading) {
    return <LoadingScreen message="Loading dashboard..." />;
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Heat Plex membership overview and key metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeSelector
            preset={datePreset}
            onPresetChange={handleDatePresetChange}
          />
          <Button onClick={handleExportReport} className="cursor-pointer">
            <FileDown className="mr-2 size-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Alerts Banner */}
      {unresolvedAlerts > 0 && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            You have <strong>{unresolvedAlerts} unresolved alerts</strong>. Click to review.
          </AlertDescription>
        </Alert>
      )}

      {/* Hero Metrics */}
      {memberKPIs && revenueKPIs && (
        <DashboardStatsCards memberKPIs={memberKPIs} revenueKPIs={revenueKPIs} />
      )}

      {/* Operational Metrics */}
      {operationalKPIs && <OperationalMetricsCards metrics={operationalKPIs} />}

      {/* Top Engineers Preview */}
      <div className="grid gap-4 lg:grid-cols-2">
        {topEngineers.length > 0 && <TopEngineersCard engineers={topEngineers} />}
        <RecentMembersCard />
      </div>
    </div>
  );
}

function RecentMembersCard() {
  const [recentMembers, setRecentMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentMembers();
  }, []);

  async function loadRecentMembers() {
    try {
      const { supabase } = await import('@/lib/supabase');
      const { data, error } = await supabase
        .from('members')
        .select('id, first_name, last_name, email, plan')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentMembers(data || []);
    } catch (error) {
      console.error('Failed to load recent members:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-0">
      <div className="flex items-center justify-between border-b p-4">
        <div className="text-sm font-medium">Recent Members ({recentMembers.length})</div>
        <Button
          variant="ghost"
          size="sm"
          className="cursor-pointer"
          onClick={() => {
            window.location.href = '/staff/members';
          }}
        >
          View All
          <ArrowRight className="ml-2 size-4" />
        </Button>
      </div>
      <div className="relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Plan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className={loading ? 'opacity-50' : ''}>
            {recentMembers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-sm">
                  No recent members
                </TableCell>
              </TableRow>
            ) : (
              recentMembers.map((member) => (
                <TableRow key={member.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell className="font-medium">
                    {member.first_name} {member.last_name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{member.email}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium capitalize">
                      {member.plan}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
