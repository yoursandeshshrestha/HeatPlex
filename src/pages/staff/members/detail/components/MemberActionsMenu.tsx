/**
 * Member Actions Menu
 * Dropdown menu with admin actions for member management
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  UserCheck,
  Calendar,
  CreditCard,
  Mail,
  Edit,
  Ban,
} from 'lucide-react';
import type { Tables } from '@/lib/supabase';
import type { Json } from '@/types/database.types';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';

type Member = Tables<'members'>;

interface MemberActionsMenuProps {
  member: Member;
  onUpdate: () => void;
}

export function MemberActionsMenu({ member, onUpdate }: MemberActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [actionDialog, setActionDialog] = useState<string | null>(null);
  const [statusToUpdate, setStatusToUpdate] = useState(member.status);
  const [daysToExtend, setDaysToExtend] = useState('30');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  async function logAuditAction(actionType: string, details: Record<string, unknown>) {
    const { error } = await supabase.rpc('append_audit_log', {
      p_action_type: actionType,
      p_target_type: 'member',
      p_target_id: member.id,
      p_summary: `Member action: ${actionType}`,
      p_before: null,
      p_after: details as unknown as Json,
    });

    if (error) throw error;
  }

  async function handleStatusUpdate() {
    if (!statusToUpdate || statusToUpdate === member.status) {
      toast.error('Please select a different status');
      return;
    }

    try {
      setActionLoading(true);

      const { error } = await supabase
        .from('members')
        .update({ status: statusToUpdate })
        .eq('id', member.id);

      if (error) throw error;

      // TODO: Log to audit_log table
      await logAuditAction('status_update', {
        before: member.status,
        after: statusToUpdate,
      });

      toast.success('Member status updated successfully');
      setActionDialog(null);
      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update member status');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleExtendRenewal() {
    const days = parseInt(daysToExtend);
    if (!days || days < 1) {
      toast.error('Please enter a valid number of days');
      return;
    }

    try {
      setActionLoading(true);

      const currentDate = member.renewal_date ? new Date(member.renewal_date) : new Date();
      const newRenewalDate = addDays(currentDate, days);

      const { error } = await supabase
        .from('members')
        .update({ renewal_date: format(newRenewalDate, 'yyyy-MM-dd') })
        .eq('id', member.id);

      if (error) throw error;

      await logAuditAction('extend_renewal', {
        days_extended: days,
        old_date: member.renewal_date,
        new_date: format(newRenewalDate, 'yyyy-MM-dd'),
      });

      toast.success(`Renewal date extended by ${days} days`);
      setActionDialog(null);
      onUpdate();
    } catch (error) {
      console.error('Error extending renewal:', error);
      toast.error('Failed to extend renewal date');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApplyCredit() {
    const amountPence = parseFloat(creditAmount) * 100;
    if (!amountPence || amountPence < 1) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!creditReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    try {
      setActionLoading(true);

      // Create a savings event
      const { error: savingsError } = await supabase
        .from('savings_events')
        .insert({
          member_id: member.id,
          source: 'goodwill_credit',
          amount_pence: Math.round(amountPence),
          applied_at: new Date().toISOString(),
          notes: creditReason,
        });

      if (savingsError) throw savingsError;

      // Update member's total savings
      const newTotal = (member.savings_total_pence || 0) + Math.round(amountPence);
      const { error: memberError } = await supabase
        .from('members')
        .update({ savings_total_pence: newTotal })
        .eq('id', member.id);

      if (memberError) throw memberError;

      await logAuditAction('apply_credit', {
        amount_pence: Math.round(amountPence),
        reason: creditReason,
      });

      toast.success(`£${creditAmount} credit applied successfully`);
      setActionDialog(null);
      setCreditAmount('');
      setCreditReason('');
      onUpdate();
    } catch (error) {
      console.error('Error applying credit:', error);
      toast.error('Failed to apply credit');
    } finally {
      setActionLoading(false);
    }
  }

  const actions = [
    {
      id: 'update_status',
      label: 'Update Status',
      icon: Edit,
      onClick: () => setActionDialog('update_status'),
      show: true,
    },
    {
      id: 'extend_renewal',
      label: 'Extend Renewal Date',
      icon: Calendar,
      onClick: () => setActionDialog('extend_renewal'),
      show: member.status === 'active',
    },
    {
      id: 'apply_credit',
      label: 'Apply Credit to Savings',
      icon: CreditCard,
      onClick: () => setActionDialog('apply_credit'),
      show: true,
    },
    {
      id: 'send_magic_link',
      label: 'Send Magic Link',
      icon: Mail,
      onClick: () => toast.info('Magic link feature coming soon'),
      show: true,
    },
    {
      id: 'suspend',
      label: member.status === 'suspended' ? 'Reactivate Member' : 'Suspend Member',
      icon: member.status === 'suspended' ? UserCheck : Ban,
      onClick: () => {
        setStatusToUpdate(member.status === 'suspended' ? 'active' : 'suspended');
        setActionDialog('quick_status');
      },
      show: ['active', 'suspended', 'payment_overdue'].includes(member.status),
    },
  ];

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="cursor-pointer shrink-0">
            Actions
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-1">
          <div className="space-y-1">
            {actions
              .filter((action) => action.show)
              .map((action) => (
                <Button
                  key={action.id}
                  variant="ghost"
                  size="sm"
                  className="w-full cursor-pointer justify-start"
                  onClick={() => {
                    action.onClick();
                    setOpen(false);
                  }}
                >
                  <action.icon className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Update Status Dialog */}
      <AlertDialog
        open={actionDialog === 'update_status'}
        onOpenChange={(open) => !open && setActionDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Member Status</AlertDialogTitle>
            <AlertDialogDescription>
              Change the membership status for {member.first_name} {member.last_name}.
              This action will be logged in the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="status">New Status</Label>
            <Combobox value={statusToUpdate} onValueChange={(val) => val && setStatusToUpdate(val)}>
              <ComboboxInput placeholder="Select status" className="mt-1.5 cursor-pointer" />
              <ComboboxContent>
                <ComboboxList>
                  <ComboboxItem value="pending" className="cursor-pointer">Pending</ComboboxItem>
                  <ComboboxItem value="active" className="cursor-pointer">Active</ComboboxItem>
                  <ComboboxItem value="payment_overdue" className="cursor-pointer">
                    Payment Overdue
                  </ComboboxItem>
                  <ComboboxItem value="suspended" className="cursor-pointer">Suspended</ComboboxItem>
                  <ComboboxItem value="cancellation_requested" className="cursor-pointer">
                    Cancellation Requested
                  </ComboboxItem>
                  <ComboboxItem value="cancelled" className="cursor-pointer">Cancelled</ComboboxItem>
                  <ComboboxItem value="expired" className="cursor-pointer">Expired</ComboboxItem>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={actionLoading}
              className="cursor-pointer"
            >
              {actionLoading ? 'Updating...' : 'Update Status'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quick Status Dialog (Suspend/Reactivate) */}
      <AlertDialog
        open={actionDialog === 'quick_status'}
        onOpenChange={(open) => !open && setActionDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusToUpdate === 'suspended' ? 'Suspend Member' : 'Reactivate Member'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {statusToUpdate === 'suspended'
                ? 'This will suspend the member account. They will retain portal access but cannot book services.'
                : 'This will reactivate the member account to active status.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusUpdate}
              disabled={actionLoading}
              className="cursor-pointer"
            >
              {actionLoading ? 'Processing...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Extend Renewal Dialog */}
      <AlertDialog
        open={actionDialog === 'extend_renewal'}
        onOpenChange={(open) => !open && setActionDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Extend Renewal Date</AlertDialogTitle>
            <AlertDialogDescription>
              Extend the membership renewal date for goodwill or support purposes.
              Current renewal date: {member.renewal_date ? format(new Date(member.renewal_date), 'PP') : 'Not set'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="days">Extend by (days)</Label>
            <Input
              id="days"
              type="number"
              min="1"
              value={daysToExtend}
              onChange={(e) => setDaysToExtend(e.target.value)}
              placeholder="30"
              className="mt-1.5 cursor-text"
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              New date will be:{' '}
              {member.renewal_date &&
                format(
                  addDays(new Date(member.renewal_date), parseInt(daysToExtend) || 0),
                  'PP'
                )}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleExtendRenewal}
              disabled={actionLoading}
              className="cursor-pointer"
            >
              {actionLoading ? 'Extending...' : 'Extend Renewal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Apply Credit Dialog */}
      <AlertDialog
        open={actionDialog === 'apply_credit'}
        onOpenChange={(open) => !open && setActionDialog(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Credit to Savings</AlertDialogTitle>
            <AlertDialogDescription>
              Add a goodwill credit to the member's savings total. This will appear in their
              portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="amount">Amount (£)</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="25.00"
                className="mt-1.5 cursor-text"
              />
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Textarea
                id="reason"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                placeholder="e.g., Goodwill gesture for delayed service"
                className="mt-1.5 cursor-text"
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleApplyCredit}
              disabled={actionLoading}
              className="cursor-pointer"
            >
              {actionLoading ? 'Applying...' : 'Apply Credit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
