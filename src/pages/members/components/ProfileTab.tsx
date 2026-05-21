/**
 * Profile Tab
 * Personal information and preferences
 */

import { useState } from 'react';
import type { Tables } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2 } from 'lucide-react';
import { SectionPanel } from './member-ui';

type Member = Tables<'members'>;

interface ProfileTabProps {
  member: Member;
}

export function ProfileTab({ member }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: member.first_name,
    last_name: member.last_name,
    phone: member.phone,
    address_line_1: member.address_line_1,
    address_line_2: member.address_line_2 || '',
    address_town: member.address_town,
    address_postcode: member.address_postcode,
    marketing_email_opt_in: member.marketing_email_opt_in || false,
  });

  function handleChange(field: keyof typeof formData, value: string | boolean) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: updateError } = await supabase
        .from('members')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address_line_1: formData.address_line_1,
          address_line_2: formData.address_line_2 || null,
          address_town: formData.address_town,
          address_postcode: formData.address_postcode,
          marketing_email_opt_in: formData.marketing_email_opt_in,
          marketing_consent_at:
            formData.marketing_email_opt_in && !member.marketing_email_opt_in
              ? new Date().toISOString()
              : member.marketing_consent_at,
        })
        .eq('id', member.id);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
      window.location.reload();
    } catch (err) {
      console.error('Update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setFormData({
      first_name: member.first_name,
      last_name: member.last_name,
      phone: member.phone,
      address_line_1: member.address_line_1,
      address_line_2: member.address_line_2 || '',
      address_town: member.address_town,
      address_postcode: member.address_postcode,
      marketing_email_opt_in: member.marketing_email_opt_in || false,
    });
    setIsEditing(false);
    setError(null);
    setSuccess(false);
  }

  const fieldClass = isEditing ? undefined : 'text-sm font-medium';

  return (
    <div className="space-y-8">
      {success && (
        <Alert className="border-emerald-500/25 bg-emerald-500/10">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <AlertDescription className="text-emerald-400">
            Profile updated successfully
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <SectionPanel
        title="Personal Information"
        action={
          !isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="h-7 cursor-pointer px-2.5 text-xs"
            >
              Edit
            </Button>
          ) : undefined
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">First name</Label>
              {isEditing ? (
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  required
                  disabled={loading}
                />
              ) : (
                <p className={fieldClass}>{member.first_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last name</Label>
              {isEditing ? (
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  required
                  disabled={loading}
                />
              ) : (
                <p className={fieldClass}>{member.last_name}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-sm font-medium">{member.email}</p>
            <p className="text-xs text-muted-foreground">Contact support to change your email</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            {isEditing ? (
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                disabled={loading}
              />
            ) : (
              <p className={fieldClass}>{member.phone}</p>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="cursor-pointer">
                {loading ? (
                  <>
                    <Spinner className="mr-2 size-4" />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          )}
        </form>
      </SectionPanel>

      <SectionPanel title="Service Address">
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_line_1">Address line 1</Label>
              <Input
                id="address_line_1"
                value={formData.address_line_1}
                onChange={(e) => handleChange('address_line_1', e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line_2">Address line 2 (optional)</Label>
              <Input
                id="address_line_2"
                value={formData.address_line_2}
                onChange={(e) => handleChange('address_line_2', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="address_town">Town / city</Label>
                <Input
                  id="address_town"
                  value={formData.address_town}
                  onChange={(e) => handleChange('address_town', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_postcode">Postcode</Label>
                <Input
                  id="address_postcode"
                  value={formData.address_postcode}
                  onChange={(e) =>
                    handleChange('address_postcode', e.target.value.toUpperCase())
                  }
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm font-medium leading-relaxed">
            <p>{member.address_line_1}</p>
            {member.address_line_2 && <p>{member.address_line_2}</p>}
            <p>{member.address_town}</p>
            <p>{member.address_postcode}</p>
          </div>
        )}
      </SectionPanel>

      <SectionPanel title="Communication Preferences">
        {isEditing ? (
          <div className="flex items-start gap-2">
            <Checkbox
              id="marketing_email_opt_in"
              checked={formData.marketing_email_opt_in}
              onCheckedChange={(checked) =>
                handleChange('marketing_email_opt_in', checked === true)
              }
              disabled={loading}
              className="mt-0.5 cursor-pointer"
            />
            <Label htmlFor="marketing_email_opt_in" className="text-sm font-normal leading-snug">
              Send me tips, offers, and updates about Heat Plex services
            </Label>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Marketing emails:{' '}
            <span className="font-medium text-foreground">
              {member.marketing_email_opt_in ? 'Subscribed' : 'Not subscribed'}
            </span>
          </p>
        )}
      </SectionPanel>
    </div>
  );
}
