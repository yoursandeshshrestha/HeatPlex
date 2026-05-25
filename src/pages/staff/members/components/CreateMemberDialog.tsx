/**
 * Manual member creation dialog for staff
 */

import { useEffect, useState } from 'react';
import type { Tables } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Info, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  createMemberManual,
  type ManualMemberStatus,
  type MemberPlan,
} from '../lib/create-member';

interface CreateMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (member: Tables<'members'>) => void;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  town: string;
  postcode: string;
  plan: MemberPlan;
  status: ManualMemberStatus;
  promoCode: string;
  commusoftCustomerId: string;
  marketingOptIn: boolean;
  termsConfirmed: boolean;
}

const initialFormState: FormState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  town: '',
  postcode: '',
  plan: 'annual',
  status: 'active',
  promoCode: '',
  commusoftCustomerId: '',
  marketingOptIn: false,
  termsConfirmed: false,
};

const PLAN_OPTIONS: { value: MemberPlan; label: string; price: string }[] = [
  { value: 'annual', label: 'Annual', price: '£199 / year' },
  { value: 'monthly', label: 'Monthly', price: '£19.99 / month' },
];

const STATUS_OPTIONS: { value: ManualMemberStatus; label: string; hint: string }[] = [
  { value: 'active', label: 'Active', hint: 'Membership is live' },
  { value: 'pending', label: 'Pending', hint: 'Billing not set up yet' },
];

const consentCheckboxClassName =
  'mt-0.5 size-4 shrink-0 cursor-pointer border-foreground/40 bg-card shadow-sm ring-1 ring-border/60 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground';

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">{title}</h3>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="rounded-xl border border-border/60 bg-muted/20 py-4">{children}</div>
    </section>
  );
}

function Field({
  id,
  label,
  required,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}

export function CreateMemberDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateMemberDialogProps) {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm(initialFormState);
      setError(null);
    }
  }, [open]);

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.termsConfirmed) {
      setError('Confirm that the member has accepted the terms and conditions');
      return;
    }

    setSubmitting(true);
    try {
      const member = await createMemberManual({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        town: form.town,
        postcode: form.postcode,
        plan: form.plan,
        status: form.status,
        promoCode: form.promoCode,
        commusoftCustomerId: form.commusoftCustomerId,
        marketingOptIn: form.marketingOptIn,
      });

      toast.success(`${member.first_name} ${member.last_name} added — they can sign in with this email`);
      onCreated(member);
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to create member';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,720px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
        <DialogHeader className="space-y-3 border-b border-border/60 px-6 py-5 pr-14">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserPlus className="size-5" strokeWidth={1.75} />
            </div>
            <div>
              <DialogTitle className="text-lg">Add member</DialogTitle>
              <DialogDescription className="mt-0.5">
                Creates their membership profile and a login account for this email.
              </DialogDescription>
            </div>
          </div>
          <div className="flex gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
            <p>
              GoCardless is not set up here. Use <span className="font-medium text-foreground">Pending</span> if
              payment still needs to be arranged.
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <FormSection title="Contact" description="Member login and communication details">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field id="create-firstName" label="First name" required>
                    <Input
                      id="create-firstName"
                      value={form.firstName}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      required
                      disabled={submitting}
                      className="h-9 cursor-text bg-background"
                    />
                  </Field>
                  <Field id="create-lastName" label="Last name" required>
                    <Input
                      id="create-lastName"
                      value={form.lastName}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      required
                      disabled={submitting}
                      className="h-9 cursor-text bg-background"
                    />
                  </Field>
                </div>
                <Field id="create-email" label="Email" required>
                  <Input
                    id="create-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    required
                    disabled={submitting}
                    className="h-9 cursor-text bg-background"
                    placeholder="name@example.com"
                  />
                </Field>
                <Field id="create-phone" label="Phone" required>
                  <Input
                    id="create-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    required
                    disabled={submitting}
                    className="h-9 cursor-text bg-background"
                    placeholder="07XXX XXXXXX"
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Service address" description="Where annual service visits take place">
              <div className="space-y-3">
                <Field id="create-addressLine1" label="Address line 1" required>
                  <Input
                    id="create-addressLine1"
                    value={form.addressLine1}
                    onChange={(e) => updateField('addressLine1', e.target.value)}
                    required
                    disabled={submitting}
                    className="h-9 cursor-text bg-background"
                  />
                </Field>
                <Field id="create-addressLine2" label="Address line 2">
                  <Input
                    id="create-addressLine2"
                    value={form.addressLine2}
                    onChange={(e) => updateField('addressLine2', e.target.value)}
                    disabled={submitting}
                    className="h-9 cursor-text bg-background"
                    placeholder="Optional"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="create-town" label="Town" required>
                    <Input
                      id="create-town"
                      value={form.town}
                      onChange={(e) => updateField('town', e.target.value)}
                      required
                      disabled={submitting}
                      className="h-9 cursor-text bg-background"
                    />
                  </Field>
                  <Field id="create-postcode" label="Postcode" required>
                    <Input
                      id="create-postcode"
                      value={form.postcode}
                      onChange={(e) =>
                        updateField('postcode', e.target.value.toUpperCase())
                      }
                      required
                      disabled={submitting}
                      className="h-9 cursor-text bg-background"
                      placeholder="SW8 3PG"
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection title="Membership">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Plan</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PLAN_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        disabled={submitting}
                        onClick={() => updateField('plan', option.value)}
                        className={cn(
                          'cursor-pointer rounded-lg border px-3 py-3 text-left transition-colors',
                          form.plan === option.value
                            ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/10'
                            : 'border-border/60 bg-background hover:bg-muted/40'
                        )}
                      >
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{option.price}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {STATUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        disabled={submitting}
                        onClick={() => updateField('status', option.value)}
                        className={cn(
                          'cursor-pointer rounded-lg border px-3 py-3 text-left transition-colors',
                          form.status === option.value
                            ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/10'
                            : 'border-border/60 bg-background hover:bg-muted/40'
                        )}
                      >
                        <p className="text-sm font-medium">{option.label}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{option.hint}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </FormSection>

            <FormSection title="Additional details" description="Optional attribution and integrations">
              <div className="space-y-3">
                <Field id="create-promoCode" label="Promo / engineer code">
                  <Input
                    id="create-promoCode"
                    value={form.promoCode}
                    onChange={(e) => updateField('promoCode', e.target.value)}
                    disabled={submitting}
                    className="h-9 cursor-text bg-background"
                    placeholder="Optional"
                  />
                </Field>
                <Field id="create-commusoft" label="Commusoft customer ID">
                  <Input
                    id="create-commusoft"
                    value={form.commusoftCustomerId}
                    onChange={(e) => updateField('commusoftCustomerId', e.target.value)}
                    disabled={submitting}
                    className="h-9 cursor-text bg-background font-mono text-sm"
                    placeholder="Optional"
                  />
                </Field>
              </div>
            </FormSection>

            <div className="space-y-3 rounded-xl border border-border/60 bg-muted/20 py-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="create-marketing"
                  checked={form.marketingOptIn}
                  onCheckedChange={(checked) =>
                    updateField('marketingOptIn', checked === true)
                  }
                  disabled={submitting}
                  className={consentCheckboxClassName}
                />
                <Label
                  htmlFor="create-marketing"
                  className="cursor-pointer text-sm font-normal leading-snug"
                >
                  Opted in to marketing emails
                </Label>
              </div>
              <div className="flex items-start gap-3 border-t border-border/60 pt-3">
                <Checkbox
                  id="create-terms"
                  checked={form.termsConfirmed}
                  onCheckedChange={(checked) =>
                    updateField('termsConfirmed', checked === true)
                  }
                  disabled={submitting}
                  className={consentCheckboxClassName}
                />
                <Label
                  htmlFor="create-terms"
                  className="cursor-pointer text-sm font-normal leading-snug"
                >
                  Member has accepted the terms and conditions
                  <span className="text-destructive"> *</span>
                </Label>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter className="border-t border-border/60 bg-muted/20 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !form.termsConfirmed}
              className="cursor-pointer min-w-[120px]"
            >
              {submitting ? 'Creating…' : 'Create member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
