import { useState } from 'react';
import { Check, X, Zap, Sparkles, Crown, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription, PlanType } from '@/lib/subscription';
import { PRICING_PLANS, getAnnualPricePerMonth } from '@/lib/pricing-config';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PlanSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PLAN_ICONS: Record<string, typeof Zap> = {
  starter: Zap,
  pro: Sparkles,
  enterprise: Crown,
};

export function PlanSelectionModal({ open, onOpenChange }: PlanSelectionModalProps) {
  const { startCheckout, plan: currentPlan, status } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly');
  const hasActiveSub = status === 'active' || status === 'trialing';

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'enterprise') {
      window.open('mailto:sales@wibookly.com?subject=Business%20Plan%20Inquiry', '_blank');
      return;
    }

    setLoading(planId);
    try {
      await startCheckout(planId as PlanType, billingInterval);
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">Choose Your Plan</DialogTitle>
          <DialogDescription className="text-center">
            Subscribe to connect your email and unlock AI-powered features.
          </DialogDescription>
        </DialogHeader>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 my-2">
          <button
            onClick={() => setBillingInterval('monthly')}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              billingInterval === 'monthly'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingInterval('annual')}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
              billingInterval === 'annual'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Annual
            <Badge variant="secondary" className="ml-1.5 text-xs">Save 15%</Badge>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          {PRICING_PLANS.map((plan) => {
            const Icon = PLAN_ICONS[plan.id] || Zap;
            const isCurrentPlan = hasActiveSub && currentPlan === plan.id;
            const displayPrice = plan.monthlyPrice
              ? billingInterval === 'annual'
                ? getAnnualPricePerMonth(plan.monthlyPrice)
                : plan.monthlyPrice
              : null;

            return (
              <div
                key={plan.id}
                className={cn(
                  'relative rounded-lg border p-3 flex flex-col',
                  plan.popular
                    ? 'border-primary shadow-md ring-1 ring-primary/20'
                    : 'border-border',
                  isCurrentPlan && 'border-primary/50 bg-primary/5'
                )}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-xs">
                    Most Popular
                  </Badge>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-primary/10 rounded-md">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">{plan.name}</h3>
                </div>

                <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>

                <div className="mb-3">
                  {displayPrice !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">${displayPrice}</span>
                      <span className="text-sm text-muted-foreground">
                        /{plan.perUser ? 'user/' : ''}mo
                      </span>
                    </div>
                  ) : (
                    <div className="text-lg font-semibold text-primary">
                      {plan.priceLabel || 'Contact Sales'}
                    </div>
                  )}
                  {billingInterval === 'annual' && plan.showAnnualDiscount && plan.monthlyPrice && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      <span className="line-through">${plan.monthlyPrice}/mo</span>
                    </p>
                  )}
                </div>

                {/* Features */}
                <div className="flex-1 space-y-1.5 mb-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-1.5 text-xs">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-start gap-1.5 text-xs text-muted-foreground/50">
                      <X className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading !== null || isCurrentPlan}
                  variant={plan.popular ? 'default' : 'outline'}
                  className="w-full"
                  size="sm"
                >
                  {loading === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isCurrentPlan
                    ? 'Current Plan'
                    : loading === plan.id
                      ? 'Loading...'
                      : plan.id === 'enterprise'
                        ? 'Contact Sales'
                        : `Get ${plan.name}`}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-2">
          All plans include a 3-day free trial. Cancel anytime.
        </p>
      </DialogContent>
    </Dialog>
  );
}
