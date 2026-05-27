/**
 * Email Logs Management Page
 * Staff interface for viewing email logs and retrying failed sends
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from '@/components/ui/combobox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar as CalendarIcon,
  RefreshCw,
  Search,
  FilterX,
  ChevronLeft,
  ChevronRight,
  Mail,
  XCircle,
  CheckCircle,
  AlertCircle,
  MailOpen,
  MousePointerClick,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/ui/loading-screen';
import {
  getEmailLogs,
  retryEmail,
  type EmailLog,
  type EmailLogsFilters,
} from '@/lib/supabase/email-queries';
import type { DateRange } from 'react-day-picker';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
];

const TEMPLATE_OPTIONS = [
  { value: 'all', label: 'All Templates' },
  { value: 'welcome-step-1', label: 'Welcome Email' },
  { value: 'magic-link', label: 'Magic Link' },
  { value: 'booking-confirmation', label: 'Booking Confirmation' },
  { value: 'booking-reminder', label: 'Booking Reminder' },
  { value: 'booking-cancelled', label: 'Booking Cancelled' },
  { value: 'payment-confirmation', label: 'Payment Confirmation' },
  { value: 'payment-failed', label: 'Payment Failed' },
  { value: 'renewal-reminder', label: 'Renewal Reminder' },
];

function getStatusBadge(log: EmailLog) {
  if (log.bounced_at) {
    return (
      <Badge className="bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400">
        <XCircle className="mr-1 size-3" />
        Bounced
      </Badge>
    );
  }

  if (log.complained_at) {
    return (
      <Badge className="bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 dark:text-orange-400">
        <AlertCircle className="mr-1 size-3" />
        Complained
      </Badge>
    );
  }

  if (log.status === 'failed') {
    return (
      <Badge className="bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400">
        <XCircle className="mr-1 size-3" />
        Failed
      </Badge>
    );
  }

  if (log.clicked_at) {
    return (
      <Badge className="bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 dark:text-purple-400">
        <MousePointerClick className="mr-1 size-3" />
        Clicked
      </Badge>
    );
  }

  if (log.opened_at) {
    return (
      <Badge className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400">
        <MailOpen className="mr-1 size-3" />
        Opened
      </Badge>
    );
  }

  if (log.status === 'sent') {
    return (
      <Badge className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400">
        <CheckCircle className="mr-1 size-3" />
        Sent
      </Badge>
    );
  }

  return (
    <Badge className="bg-muted text-muted-foreground">
      {log.status || 'Unknown'}
    </Badge>
  );
}

function getTemplateLabel(templateKey: string | null): string {
  if (!templateKey) return '-';
  const option = TEMPLATE_OPTIONS.find((opt) => opt.value === templateKey);
  return option?.label || templateKey;
}

export function EmailLogsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalSent, setTotalSent] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const [totalOpened, setTotalOpened] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const statusFilter = searchParams.get('status') || 'all';
  const templateFilter = searchParams.get('template') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const dateFromFilter = searchParams.get('dateFrom') || '';
  const dateToFilter = searchParams.get('dateTo') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);

  // Initialize date range from URL params
  useEffect(() => {
    if (dateFromFilter || dateToFilter) {
      setDateRange({
        from: dateFromFilter ? new Date(dateFromFilter) : undefined,
        to: dateToFilter ? new Date(dateToFilter) : undefined,
      });
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [statusFilter, templateFilter, searchQuery, dateFromFilter, dateToFilter, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      setSearchParams(params);
    }
  }, [statusFilter, templateFilter, searchQuery, dateFromFilter, dateToFilter]);

  async function loadLogs() {
    setLoading(true);
    try {
      const filters: EmailLogsFilters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        templateKey: templateFilter !== 'all' ? templateFilter : undefined,
        search: searchQuery || undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
        page: currentPage,
        pageSize,
      };

      const result = await getEmailLogs(filters);
      setLogs(result.logs);
      setTotalCount(result.total);
      setTotalSent(result.totalSent);
      setTotalFailed(result.totalFailed);
      setTotalOpened(result.totalOpened);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load email logs:', error);
      toast.error('Failed to load email logs');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }

  function handleStatusChange(value: string | null) {
    if (value) {
      const params = new URLSearchParams(searchParams);
      if (value === 'all') {
        params.delete('status');
      } else {
        params.set('status', value);
      }
      setSearchParams(params);
    }
  }

  function handleTemplateChange(value: string | null) {
    if (value) {
      const params = new URLSearchParams(searchParams);
      if (value === 'all') {
        params.delete('template');
      } else {
        params.set('template', value);
      }
      setSearchParams(params);
    }
  }

  function handleSearchChange(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  }

  function handleDateRangeChange(range: DateRange | undefined) {
    setDateRange(range);
    const params = new URLSearchParams(searchParams);

    if (range?.from) {
      params.set('dateFrom', format(range.from, 'yyyy-MM-dd'));
    } else {
      params.delete('dateFrom');
    }

    if (range?.to) {
      params.set('dateTo', format(range.to, 'yyyy-MM-dd'));
    } else {
      params.delete('dateTo');
    }

    setSearchParams(params);
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  }

  function handleClearAllFilters() {
    setDateRange(undefined);
    setSearchParams({});
  }

  function handleRowClick(log: EmailLog) {
    setSelectedLog(log);
    setDetailsOpen(true);
  }

  async function handleRetry(logId: string) {
    setRetrying(logId);
    try {
      await retryEmail(logId);
      toast.success('Email queued for retry');
      loadLogs();
    } catch (error) {
      console.error('Failed to retry email:', error);
      toast.error('Failed to retry email');
    } finally {
      setRetrying(null);
    }
  }

  const hasActiveFilters =
    statusFilter !== 'all' ||
    templateFilter !== 'all' ||
    searchQuery ||
    dateFromFilter ||
    dateToFilter;

  if (initialLoading) {
    return <LoadingScreen message="Loading email logs..." />;
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Email Logs</h1>
          <p className="text-muted-foreground">Monitor email delivery and retry failed sends</p>
        </div>
        <Button onClick={loadLogs} variant="outline" className="cursor-pointer">
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Total Emails</div>
            <div className="text-muted-foreground">
              <Mail className="size-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold tracking-tight">{totalCount}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {hasActiveFilters ? 'Matching filters' : 'All emails'}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Sent</div>
            <div className="text-muted-foreground">
              <CheckCircle className="size-4 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold tracking-tight text-emerald-600">
              {totalSent}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Successfully delivered</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Failed</div>
            <div className="text-muted-foreground">
              <XCircle className="size-4 text-red-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold tracking-tight text-red-600">
              {totalFailed}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Failed to send</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Opened</div>
            <div className="text-muted-foreground">
              <MailOpen className="size-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold tracking-tight text-blue-600">
              {totalOpened}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {totalSent > 0 ? `${Math.round((totalOpened / totalSent) * 100)}% open rate` : '-'}
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-[240px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search email or subject..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-9 pl-9 cursor-pointer"
          />
        </div>

        <Combobox value={statusFilter} onValueChange={handleStatusChange}>
          <ComboboxInput placeholder="Filter by status" className="h-9 w-[150px] cursor-pointer" />
          <ComboboxContent>
            <ComboboxList>
              {STATUS_OPTIONS.map((option) => (
                <ComboboxItem key={option.value} value={option.value} className="cursor-pointer">
                  {option.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <Combobox value={templateFilter} onValueChange={handleTemplateChange}>
          <ComboboxInput placeholder="Filter by template" className="h-9 w-[180px] cursor-pointer" />
          <ComboboxContent>
            <ComboboxList>
              {TEMPLATE_OPTIONS.map((option) => (
                <ComboboxItem key={option.value} value={option.value} className="cursor-pointer">
                  {option.label}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'h-9 justify-start text-left font-normal cursor-pointer',
                !dateRange && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, 'LLL dd, y')} - {format(dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={handleClearAllFilters} className="cursor-pointer">
            <FilterX className="mr-2 size-4" />
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Email Logs Table */}
      <Card className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="text-sm font-medium">Email Logs ({totalCount})</div>
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
                <TableHead>Sent At</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={loading ? 'opacity-50' : ''}>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-sm">
                    No email logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => handleRowClick(log)}
                  >
                    <TableCell className="font-medium">
                      {format(new Date(log.sent_at), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.to_email}</div>
                      {log.member && (
                        <div className="text-xs text-muted-foreground">
                          {log.member.first_name} {log.member.last_name}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {getTemplateLabel(log.template_key)}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">
                      {log.subject || '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(log)}</TableCell>
                    <TableCell className="text-right">
                      {log.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetry(log.id);
                          }}
                          disabled={retrying === log.id}
                          className="cursor-pointer"
                        >
                          <RefreshCw className={cn('mr-1 size-3', retrying === log.id && 'animate-spin')} />
                          Retry
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * pageSize) + 1} to{' '}
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} emails
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((page) => {
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => {
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                        <Button
                          variant={page === currentPage ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                          disabled={loading}
                          className="size-9 cursor-pointer p-0"
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="cursor-pointer"
              >
                Next
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Email Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Email Details</DialogTitle>
            <DialogDescription>
              {selectedLog && format(new Date(selectedLog.sent_at), 'MMM dd, yyyy HH:mm:ss')}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">To</div>
                  <div className="mt-1 font-medium">{selectedLog.to_email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Status</div>
                  <div className="mt-1">{getStatusBadge(selectedLog)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Template</div>
                  <div className="mt-1">{getTemplateLabel(selectedLog.template_key)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Provider ID</div>
                  <div className="mt-1 font-mono text-sm">{selectedLog.provider_message_id || '-'}</div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground">Subject</div>
                <div className="mt-1">{selectedLog.subject || '-'}</div>
              </div>

              {selectedLog.error_message && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Error</div>
                  <div className="mt-1 rounded-md bg-red-500/10 p-3 font-mono text-sm text-red-700 dark:text-red-400">
                    {selectedLog.error_message}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                {selectedLog.opened_at && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Opened At</div>
                    <div className="mt-1 text-sm">
                      {format(new Date(selectedLog.opened_at), 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                  </div>
                )}
                {selectedLog.clicked_at && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Clicked At</div>
                    <div className="mt-1 text-sm">
                      {format(new Date(selectedLog.clicked_at), 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                  </div>
                )}
                {selectedLog.bounced_at && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Bounced At</div>
                    <div className="mt-1 text-sm">
                      {format(new Date(selectedLog.bounced_at), 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                  </div>
                )}
                {selectedLog.complained_at && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Complained At</div>
                    <div className="mt-1 text-sm">
                      {format(new Date(selectedLog.complained_at), 'MMM dd, yyyy HH:mm:ss')}
                    </div>
                  </div>
                )}
              </div>

              {selectedLog.status === 'failed' && (
                <div className="flex justify-end border-t pt-4">
                  <Button
                    onClick={() => {
                      handleRetry(selectedLog.id);
                      setDetailsOpen(false);
                    }}
                    disabled={retrying === selectedLog.id}
                    className="cursor-pointer"
                  >
                    <RefreshCw className={cn('mr-2 size-4', retrying === selectedLog.id && 'animate-spin')} />
                    Retry Email
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
