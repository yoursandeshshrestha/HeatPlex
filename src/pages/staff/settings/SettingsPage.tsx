import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Save } from 'lucide-react';

type SystemSettingsRow = {
  id: number;
  default_plan: string | null;
  commission_amount_pence: number | null;
  pause_sequences: boolean | null;
  pause_commusoft_outbound: boolean | null;
  pause_new_signups: boolean | null;
  maintenance_mode: boolean | null;
  maintenance_message: string | null;
  twelve_month_minimum_enabled: boolean | null;
};

type SettingsForm = {
  default_plan: 'annual' | 'monthly';
  commission_amount_pence: number;
  pause_sequences: boolean;
  pause_commusoft_outbound: boolean;
  pause_new_signups: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  twelve_month_minimum_enabled: boolean;
};

function toForm(settings: SystemSettingsRow): SettingsForm {
  return {
    default_plan: settings.default_plan === 'monthly' ? 'monthly' : 'annual',
    commission_amount_pence: settings.commission_amount_pence ?? 2500,
    pause_sequences: Boolean(settings.pause_sequences),
    pause_commusoft_outbound: Boolean(settings.pause_commusoft_outbound),
    pause_new_signups: Boolean(settings.pause_new_signups),
    maintenance_mode: Boolean(settings.maintenance_mode),
    maintenance_message: settings.maintenance_message ?? '',
    twelve_month_minimum_enabled: Boolean(settings.twelve_month_minimum_enabled),
  };
}

function SettingsSwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        className="data-checked:bg-emerald-500"
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(Boolean(value))}
      />
    </div>
  );
}

export function SettingsPage() {
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;

      if (data) {
        const typed = data as SystemSettingsRow;
        setSettingsId(typed.id);
        setForm(toForm(typed));
      } else {
        setForm({
          default_plan: 'annual',
          commission_amount_pence: 2500,
          pause_sequences: false,
          pause_commusoft_outbound: false,
          pause_new_signups: false,
          maintenance_mode: false,
          maintenance_message: '',
          twelve_month_minimum_enabled: true,
        });
      }
    } catch (error) {
      console.error('Failed to load system settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setInitialLoading(false);
    }
  }

  async function saveSettings() {
    if (!form) return;
    try {
      setSaving(true);
      const payload = {
        default_plan: form.default_plan,
        commission_amount_pence: form.commission_amount_pence,
        pause_sequences: form.pause_sequences,
        pause_commusoft_outbound: form.pause_commusoft_outbound,
        pause_new_signups: form.pause_new_signups,
        maintenance_mode: form.maintenance_mode,
        maintenance_message: form.maintenance_message || null,
        twelve_month_minimum_enabled: form.twelve_month_minimum_enabled,
      };

      if (settingsId) {
        const { error } = await supabase
          .from('system_settings')
          .update(payload)
          .eq('id', settingsId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('system_settings')
          .insert(payload)
          .select('id')
          .single();
        if (error) throw error;
        setSettingsId(data.id);
      }

      toast.success('System settings saved');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  if (initialLoading || !form) {
    return <LoadingScreen message="Loading settings..." />;
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure global controls for pricing, operations, and member experience.
          </p>
        </div>
        <Button
          onClick={() => void saveSettings()}
          disabled={saving}
          className="shrink-0 cursor-pointer"
        >
          <Save className="mr-2 size-4" />
          {saving ? 'Saving...' : 'Save settings'}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-border/60 p-4">
              <h2 className="text-sm font-medium">Commercial Defaults</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Settings used by default in signup and payout flows.
              </p>
            </div>
            <div className="grid gap-4 p-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="default-plan">Default signup plan</Label>
                <Combobox
                  value={form.default_plan}
                  onValueChange={(value) =>
                    value &&
                    update('default_plan', value === 'monthly' ? 'monthly' : 'annual')
                  }
                >
                  <ComboboxInput
                    id="default-plan"
                    placeholder="Select plan"
                    className="h-9 w-full cursor-pointer"
                  />
                  <ComboboxContent>
                    <ComboboxList>
                      <ComboboxItem value="annual" className="cursor-pointer">
                        Annual
                      </ComboboxItem>
                      <ComboboxItem value="monthly" className="cursor-pointer">
                        Monthly
                      </ComboboxItem>
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
              <div className="space-y-2">
                <Label htmlFor="commission-amount">Default commission amount (pence)</Label>
                <Input
                  id="commission-amount"
                  type="number"
                  min={0}
                  value={form.commission_amount_pence}
                  onChange={(event) =>
                    update(
                      'commission_amount_pence',
                      Number.parseInt(event.target.value || '0', 10)
                    )
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Approx. £{(form.commission_amount_pence / 100).toFixed(2)} per conversion.
                </p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-border/60 p-4">
              <h2 className="text-sm font-medium">Operational Switches</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Emergency controls for traffic and integrations.
              </p>
            </div>
            <div className="divide-y divide-border/60">
              <SettingsSwitchRow
                label="Pause sequence sending"
                description="Stops lifecycle emails from sending."
                checked={form.pause_sequences}
                onCheckedChange={(value) => update('pause_sequences', value)}
              />
              <SettingsSwitchRow
                label="Pause new signups"
                description="Blocks new customer signup flow."
                checked={form.pause_new_signups}
                onCheckedChange={(value) => update('pause_new_signups', value)}
              />
              <SettingsSwitchRow
                label="Pause Commusoft outbound"
                description="Queues outbound sync writes without sending."
                checked={form.pause_commusoft_outbound}
                onCheckedChange={(value) => update('pause_commusoft_outbound', value)}
              />
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-border/60 p-4">
            <h2 className="text-sm font-medium">Member Experience</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Toggles and messaging that affect customer-facing behavior.
            </p>
          </div>
          <div className="divide-y divide-border/60">
            <SettingsSwitchRow
              label="Maintenance mode"
              description="Show maintenance banner and pause member operations."
              checked={form.maintenance_mode}
              onCheckedChange={(value) => update('maintenance_mode', value)}
            />
            <SettingsSwitchRow
              label="12-month minimum enabled"
              description="Controls monthly-plan minimum term behavior."
              checked={form.twelve_month_minimum_enabled}
              onCheckedChange={(value) => update('twelve_month_minimum_enabled', value)}
            />
          </div>
          <div className="space-y-2 border-t border-border/60 p-4">
            <Label htmlFor="maintenance-message">Maintenance message</Label>
            <Textarea
              id="maintenance-message"
              value={form.maintenance_message}
              onChange={(event) => update('maintenance_message', event.target.value)}
              placeholder="We are performing scheduled maintenance..."
              className="min-h-[180px] resize-y"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
