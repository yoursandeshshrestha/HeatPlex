/**
 * Bookings Management Page
 * Staff interface for viewing and managing bookings
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Calendar as CalendarIcon, UserPlus, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, FilterX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { LoadingScreen } from '@/components/ui/loading-screen';
import {
  getStaffBookings,
  type BookingWithDetails,
  type BookingFilters,
} from '@/lib/supabase/queries';
import { AssignEngineerModal } from './components/AssignEngineerModal';
import type { DateRange } from 'react-day-picker';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'booked', label: 'Booked' },
  { value: 'rescheduled', label: 'Rescheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled_by_member', label: 'Cancelled by Member' },
  { value: 'cancelled_by_provider', label: 'Cancelled by Provider' },
  { value: 'no_show', label: 'No Show' },
];

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    booked: {
      label: 'Booked',
      className: 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400',
    },
    rescheduled: {
      label: 'Rescheduled',
      className: 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-400',
    },
    completed: {
      label: 'Completed',
      className: 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400',
    },
    cancelled_by_member: {
      label: 'Cancelled',
      className: 'bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400',
    },
    cancelled_by_provider: {
      label: 'Cancelled',
      className: 'bg-red-500/10 text-red-700 hover:bg-red-500/20 dark:text-red-400',
    },
    no_show: {
      label: 'No Show',
      className: 'bg-slate-500/10 text-slate-700 hover:bg-slate-500/20 dark:text-slate-400',
    },
  };

  const { label, className } = config[status] || {
    label: status,
    className: 'bg-muted text-muted-foreground',
  };

  return <Badge className={className}>{label}</Badge>;
}

export function BookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalCancelled, setTotalCancelled] = useState(0);
  const [totalUnassigned, setTotalUnassigned] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  const statusFilter = searchParams.get('status') || 'all';
  const dateFromFilter = searchParams.get('dateFrom') || '';
  const dateToFilter = searchParams.get('dateTo') || '';
  const unassignedOnly = searchParams.get('unassigned') === 'true';
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
    loadBookings();
  }, [statusFilter, dateFromFilter, dateToFilter, unassignedOnly, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      setSearchParams(params);
    }
  }, [statusFilter, dateFromFilter, dateToFilter, unassignedOnly]);

  async function loadBookings() {
    setLoading(true);
    try {
      const filters: BookingFilters = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        dateFrom: dateFromFilter || undefined,
        dateTo: dateToFilter || undefined,
        unassignedOnly,
        page: currentPage,
        pageSize,
      };

      const result = await getStaffBookings(filters);
      setBookings(result.bookings);
      setTotalCount(result.total);
      setTotalActive(result.totalActive);
      setTotalCancelled(result.totalCancelled);
      setTotalUnassigned(result.totalUnassigned);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      toast.error('Failed to load bookings');
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

  function handleUnassignedToggle() {
    const params = new URLSearchParams(searchParams);
    if (unassignedOnly) {
      params.delete('unassigned');
    } else {
      params.set('unassigned', 'true');
    }
    setSearchParams(params);
  }

  function handleAssignClick(booking: BookingWithDetails) {
    setSelectedBooking(booking);
    setAssignModalOpen(true);
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

  const hasActiveFilters =
    statusFilter !== 'all' || dateFromFilter || dateToFilter || unassignedOnly;

  if (initialLoading) {
    return <LoadingScreen message="Loading bookings..." />;
  }

  return (
    <div className="space-y-4 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">Manage bookings and assign engineers</p>
        </div>
        <Button onClick={loadBookings} variant="outline" className="cursor-pointer">
          <RefreshCw className="mr-2 size-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Total Bookings</div>
            <div className="text-muted-foreground">
              <CalendarIcon className="size-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold tracking-tight">{totalCount}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {hasActiveFilters ? 'Matching filters' : 'All bookings'}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Active</div>
            <div className="text-muted-foreground">
              <CalendarIcon className="size-4 text-blue-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold tracking-tight text-blue-600">{totalActive}</div>
            <div className="mt-1 text-xs text-muted-foreground">Booked & rescheduled</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Cancelled</div>
            <div className="text-muted-foreground">
              <CalendarIcon className="size-4 text-red-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold tracking-tight text-red-600">{totalCancelled}</div>
            <div className="mt-1 text-xs text-muted-foreground">All cancellations</div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">Unassigned</div>
            <div className="text-muted-foreground">
              <AlertCircle className="size-4 text-amber-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-semibold tracking-tight text-amber-600">
              {totalUnassigned}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              <span className="text-amber-600">Needs assignment</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Combobox value={statusFilter} onValueChange={handleStatusChange}>
          <ComboboxInput placeholder="Filter by status" className="h-9 w-[180px] cursor-pointer" />
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
                    {format(dateRange.from, 'LLL dd, y')} -{' '}
                    {format(dateRange.to, 'LLL dd, y')}
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

        <Button
          variant={unassignedOnly ? 'default' : 'outline'}
          onClick={handleUnassignedToggle}
          className="cursor-pointer"
        >
          {unassignedOnly ? 'Show All' : 'Unassigned Only'}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={handleClearAllFilters}
            className="cursor-pointer"
          >
            <FilterX className="mr-2 size-4" />
            Clear All Filters
          </Button>
        )}
      </div>

      {/* Bookings Table */}
      <Card className="p-0">
        <div className="flex items-center justify-between border-b p-4">
          <div className="text-sm font-medium">
            Bookings ({totalCount})
            {unassignedOnly && <span className="ml-2 text-amber-600">• Unassigned Only</span>}
          </div>
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
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Engineer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className={loading ? 'opacity-50' : ''}>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-sm">
                    No bookings found
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className={cn(
                      (booking.status === 'booked' || booking.status === 'rescheduled') &&
                        'cursor-pointer hover:bg-muted/30',
                      !booking.engineer_id &&
                        (booking.status === 'booked' || booking.status === 'rescheduled') &&
                        'bg-amber-500/5'
                    )}
                    onClick={() => {
                      if (booking.status === 'booked' || booking.status === 'rescheduled') {
                        handleAssignClick(booking);
                      }
                    }}
                  >
                    <TableCell className="font-medium">
                      {format(new Date(booking.scheduled_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{booking.slot === 'AM' ? 'Morning' : 'Afternoon'}</TableCell>
                    <TableCell className="font-medium">
                      {booking.member.first_name} {booking.member.last_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="text-sm">{booking.member.email}</div>
                      {booking.member.phone && (
                        <div className="text-xs">{booking.member.phone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {booking.engineer ? (
                        <span className="font-medium">{booking.engineer.name}</span>
                      ) : (booking.status === 'booked' || booking.status === 'rescheduled') ? (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertCircle className="size-3" />
                          Unassigned
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell className="text-right">
                      {(booking.status === 'booked' || booking.status === 'rescheduled') && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignClick(booking);
                          }}
                          className="cursor-pointer"
                        >
                          <UserPlus className="mr-1 size-3" />
                          {booking.engineer ? 'Reassign' : 'Assign'}
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
              {Math.min(currentPage * pageSize, totalCount)} of {totalCount} bookings
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
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center gap-1">
                        {showEllipsis && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
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

      {/* Assign Engineer Modal */}
      <AssignEngineerModal
        booking={selectedBooking}
        open={assignModalOpen}
        onOpenChange={setAssignModalOpen}
        onSuccess={loadBookings}
      />
    </div>
  );
}
