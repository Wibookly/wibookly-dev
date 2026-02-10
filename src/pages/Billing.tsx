import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useSubscription, PLAN_CONFIG, PlanType } from '@/lib/subscription';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, BarChart3, Zap, MessageSquare, DollarSign, RotateCcw } from 'lucide-react';

// Plan limits
const PLAN_LIMITS: Record<PlanType, { drafts: number; messages: number }> = {
  starter: { drafts: 10, messages: 50 },
  pro: { drafts: 30, messages: 240 },
  enterprise: { drafts: 30, messages: 240 },
};

const MAX_ADDITIONAL_DRAFTS = 250;
const MAX_ADDITIONAL_MESSAGES = 500;
const DRAFT_COST = 0.25;
const MESSAGE_COST = 0.06;

// Stripe price IDs for metered billing
const USAGE_PRICE_IDS = {
  additionalDrafts: 'price_1Sz7XCAESvm0s6EqJ89XGt8E',
  additionalMessages: 'price_1Sz7XPAESvm0s6EqxBfuFph5',
};

interface UsagePrefs {
  usage_billing_enabled: boolean;
  additional_drafts_limit: number;
  additional_messages_limit: number;
  monthly_spend_cap: number;
}

interface DailyUsage {
  auto_drafts_used: number;
  ai_messages_used: number;
  additional_drafts_used: number;
  additional_messages_used: number;
}

interface MonthlyCharges {
  additional_drafts_total: number;
  additional_messages_total: number;
  total_charges: number;
}

export default function Billing() {
  const { profile, organization, session } = useAuth();
  const { plan, status, openCustomerPortal } = useSubscription();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  // Usage preferences
  const [prefs, setPrefs] = useState<UsagePrefs>({
    usage_billing_enabled: false,
    additional_drafts_limit: 0,
    additional_messages_limit: 0,
    monthly_spend_cap: 50,
  });
  const [savedPrefs, setSavedPrefs] = useState<UsagePrefs | null>(null);

  // Daily usage
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({
    auto_drafts_used: 0,
    ai_messages_used: 0,
    additional_drafts_used: 0,
    additional_messages_used: 0,
  });

  // Monthly charges
  const [monthlyCharges, setMonthlyCharges] = useState<MonthlyCharges>({
    additional_drafts_total: 0,
    additional_messages_total: 0,
    total_charges: 0,
  });

  const planLimits = PLAN_LIMITS[plan] || PLAN_LIMITS.starter;

  const hasUnsavedChanges = savedPrefs && (
    prefs.usage_billing_enabled !== savedPrefs.usage_billing_enabled ||
    prefs.additional_drafts_limit !== savedPrefs.additional_drafts_limit ||
    prefs.additional_messages_limit !== savedPrefs.additional_messages_limit ||
    prefs.monthly_spend_cap !== savedPrefs.monthly_spend_cap
  );

  const fetchData = useCallback(async () => {
    if (!organization?.id || !profile?.user_id) return;

    try {
      // Fetch usage preferences
      const { data: prefsData } = await supabase
        .from('usage_preferences')
        .select('*')
        .eq('organization_id', organization.id)
        .maybeSingle() as { data: any };

      if (prefsData) {
        const p: UsagePrefs = {
          usage_billing_enabled: prefsData.usage_billing_enabled,
          additional_drafts_limit: prefsData.additional_drafts_limit,
          additional_messages_limit: prefsData.additional_messages_limit,
          monthly_spend_cap: Number(prefsData.monthly_spend_cap),
        };
        setPrefs(p);
        setSavedPrefs(p);
      } else {
        setSavedPrefs({ ...prefs });
      }

      // Fetch today's usage
      const today = new Date().toISOString().split('T')[0];
      const { data: usageData } = await supabase
        .from('daily_usage')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('usage_date', today)
        .maybeSingle() as { data: any };

      if (usageData) {
        setDailyUsage({
          auto_drafts_used: usageData.auto_drafts_used,
          ai_messages_used: usageData.ai_messages_used,
          additional_drafts_used: usageData.additional_drafts_used,
          additional_messages_used: usageData.additional_messages_used,
        });
      }

      // Fetch current month charges
      const monthYear = new Date().toISOString().slice(0, 7);
      const { data: chargesData } = await supabase
        .from('monthly_usage_charges')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('month_year', monthYear)
        .maybeSingle() as { data: any };

      if (chargesData) {
        setMonthlyCharges({
          additional_drafts_total: chargesData.additional_drafts_total,
          additional_messages_total: chargesData.additional_messages_total,
          total_charges: Number(chargesData.total_charges),
        });
      }
    } catch (err) {
      console.error('Error fetching billing data:', err);
    } finally {
      setLoading(false);
    }
  }, [organization?.id, profile?.user_id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!organization?.id || !profile?.user_id || !session?.access_token) return;
    setSaving(true);

    try {
      // Upsert usage preferences
      const { error } = await supabase
        .from('usage_preferences')
        .upsert({
          organization_id: organization.id,
          user_id: profile.user_id,
          usage_billing_enabled: prefs.usage_billing_enabled,
          additional_drafts_limit: prefs.additional_drafts_limit,
          additional_messages_limit: prefs.additional_messages_limit,
          monthly_spend_cap: prefs.monthly_spend_cap,
        } as any, { onConflict: 'organization_id' });

      if (error) throw error;

      setSavedPrefs({ ...prefs });
      toast({
        title: 'Usage preferences saved',
        description: 'Your usage-based pricing settings have been updated.',
      });
    } catch (err) {
      console.error('Error saving preferences:', err);
      toast({
        title: 'Error',
        description: 'Failed to save usage preferences.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (savedPrefs) setPrefs({ ...savedPrefs });
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      await openCustomerPortal();
    } catch {
      toast({ title: 'Error', description: 'Failed to open subscription management.', variant: 'destructive' });
    } finally {
      setPortalLoading(false);
    }
  };

  // Calculate time until reset
  const getResetTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `${hours} hours`;
  };

  // Max monthly per user based on plan limit * 28 days
  const monthlyDraftsMax = planLimits.drafts * 28;
  const monthlyMessagesMax = planLimits.messages * 28;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Billing & Usage</h1>

      {/* Subscription Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {PLAN_CONFIG[plan]?.name || 'Starter'}
              </h2>
              {status === 'active' && (
                <Badge variant="secondary" className="text-xs">Active</Badge>
              )}
              {organization && (
                <span className="text-sm text-muted-foreground">({organization.name})</span>
              )}
            </div>
          </div>
          <CreditCard className="w-5 h-5 text-muted-foreground" />
        </div>
        <Button
          variant="outline"
          onClick={handleManageSubscription}
          disabled={portalLoading || status === 'none'}
        >
          {portalLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Manage your Subscription
        </Button>
      </Card>

      {/* Usage Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Usage</h2>
        </div>

        {/* Auto-Drafts Usage */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Auto-Drafts Usage</p>
          <p className="text-sm text-foreground">
            {dailyUsage.auto_drafts_used} out of {planLimits.drafts} daily auto-drafts used.{' '}
            <span className="text-muted-foreground">Limit resets in {getResetTime()}.</span>{' '}
            <span className="text-muted-foreground">(up to {monthlyDraftsMax.toLocaleString()} per month)</span>
          </p>
          <Progress value={(dailyUsage.auto_drafts_used / planLimits.drafts) * 100} className="h-2" />
        </div>

        {/* AI Messages Usage */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">AI Messages Usage</p>
          <p className="text-sm text-foreground">
            {dailyUsage.ai_messages_used} out of {planLimits.messages} daily AI messages used.{' '}
            <span className="text-muted-foreground">Limit resets in {getResetTime()}.</span>{' '}
            <span className="text-muted-foreground">(up to {monthlyMessagesMax.toLocaleString()} per month)</span>
          </p>
          <Progress value={(dailyUsage.ai_messages_used / planLimits.messages) * 100} className="h-2" />
        </div>
      </Card>

      {/* Usage-based Pricing Card */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Usage-based Pricing</h2>
            {hasUnsavedChanges && (
              <span className="text-sm text-primary">(unsaved changes)</span>
            )}
          </div>
          <Switch
            checked={prefs.usage_billing_enabled}
            onCheckedChange={(val) => setPrefs(p => ({ ...p, usage_billing_enabled: val }))}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Extend your usage beyond your plan limits
        </p>

        {prefs.usage_billing_enabled && (
          <>
            {/* Additional Auto-Drafts */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-primary">Additional Daily Auto-Drafts Limit</p>
              <p className="text-sm text-foreground">
                {planLimits.drafts} included + up to {prefs.additional_drafts_limit} additional per day
              </p>
              <Slider
                value={[prefs.additional_drafts_limit]}
                onValueChange={([val]) => setPrefs(p => ({ ...p, additional_drafts_limit: val }))}
                max={MAX_ADDITIONAL_DRAFTS}
                step={10}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Each additional auto-draft exceeding your daily limit costs ${DRAFT_COST.toFixed(2)}.
                Charges only apply to received emails that actually trigger an auto-draft—most emails do not.
              </p>
            </div>

            {/* Additional AI Messages */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-primary">AI Messages</p>
              <p className="text-sm text-foreground">
                Your plan includes {planLimits.messages} daily AI messages. Each additional AI message exceeding your daily limit costs ${MESSAGE_COST.toFixed(2)}.
              </p>
            </div>

            {/* Monthly Spend Cap */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-primary">Monthly Additional Spend Cap / Team Member</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-foreground">$</span>
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  value={prefs.monthly_spend_cap}
                  onChange={(e) => setPrefs(p => ({ ...p, monthly_spend_cap: Number(e.target.value) || 0 }))}
                  className="w-24"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum amount you're willing to spend per month on additional usage.
              </p>
            </div>

            {/* Current Month Usage */}
            <div className="space-y-2 pt-4 border-t border-border">
              <p className="text-sm font-medium text-primary">Current Month Usage</p>
              <div className="space-y-1 text-sm text-foreground">
                <p>Additional auto-drafts used: {monthlyCharges.additional_drafts_total}</p>
                <p>Additional AI messages used: {monthlyCharges.additional_messages_total}</p>
                <p className="font-semibold">Total charges: ${monthlyCharges.total_charges.toFixed(2)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges} className="bg-orange-500 hover:bg-orange-600 text-white">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={!hasUnsavedChanges}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Changes
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
