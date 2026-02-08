import { Check, Mail, Sparkles, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription, PLAN_CONFIG, PlanType } from '@/lib/subscription';
import { PlanBadge } from './PlanBadge';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useActiveEmail } from '@/contexts/ActiveEmailContext';

export function SubscriptionCard() {
  const { plan, status, currentPeriodEnd, startCheckout, openCustomerPortal, getMailboxLimit } = useSubscription();
  const { connections } = useActiveEmail();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const planConfig = PLAN_CONFIG[plan];
  const connectedCount = connections.length;
  const mailboxLimit = getMailboxLimit();

  const handleUpgrade = async (targetPlan: PlanType) => {
    setLoading(targetPlan);
    try {
      await startCheckout(targetPlan);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManage = async () => {
    setLoading('manage');
    try {
      await openCustomerPortal();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to open portal',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Plan</CardTitle>
          <PlanBadge />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mailbox Usage */}
        <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Connected Mailboxes</p>
              <p className="text-xs text-muted-foreground">
                {connectedCount} of {mailboxLimit === Infinity ? 'unlimited' : mailboxLimit} used
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{connectedCount}</p>
            <p className="text-xs text-muted-foreground">
              / {mailboxLimit === Infinity ? '∞' : mailboxLimit}
            </p>
          </div>
        </div>

        {/* Plan Features */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Features</p>
          <div className="grid gap-1.5">
            {Object.entries(planConfig.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <Check className={`w-4 h-4 ${enabled ? 'text-success' : 'text-muted-foreground/30'}`} />
                <span className={enabled ? 'text-foreground' : 'text-muted-foreground/50'}>
                  {formatFeatureName(feature)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription End Date */}
        {currentPeriodEnd && status === 'active' && (
          <p className="text-xs text-muted-foreground">
            Renews on {new Date(currentPeriodEnd).toLocaleDateString()}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {plan !== 'enterprise' && (
            <Button 
              onClick={() => handleUpgrade(plan === 'starter' ? 'pro' : 'enterprise')}
              disabled={loading !== null}
              className="flex-1"
              size="sm"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loading === (plan === 'starter' ? 'pro' : 'enterprise') 
                ? 'Loading...' 
                : plan === 'starter' 
                  ? 'Upgrade to Pro' 
                  : 'Contact Sales'}
            </Button>
          )}
          {plan !== 'starter' && (
            <Button 
              variant="outline" 
              onClick={handleManage}
              disabled={loading !== null}
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              {loading === 'manage' ? '...' : 'Manage'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function formatFeatureName(feature: string): string {
  const names: Record<string, string> = {
    aiAutoDrafts: 'AI Auto Drafts',
    aiAutoReply: 'AI Auto Reply',
    advancedAutomation: 'Advanced Automation Rules',
    aiSignature: 'AI Email Signature',
    advancedAnalytics: 'Advanced AI Analytics',
  };
  return names[feature] || feature;
}
