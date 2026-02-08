import { AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubscription, PLAN_CONFIG, PlanType } from '@/lib/subscription';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface UpgradeBannerProps {
  feature: string;
  requiredPlan?: PlanType;
  className?: string;
}

export function UpgradeBanner({ feature, requiredPlan = 'pro', className = '' }: UpgradeBannerProps) {
  const { startCheckout, plan } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await startCheckout(requiredPlan);
    } catch (error: any) {
      toast({
        title: 'Upgrade Failed',
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const targetPlan = PLAN_CONFIG[requiredPlan];

  return (
    <div className={`bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">
            Upgrade to {targetPlan.name} to unlock {feature}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {feature} is available on the {targetPlan.name} plan
            {targetPlan.price && ` starting at $${targetPlan.price}/month`}.
          </p>
          <Button 
            onClick={handleUpgrade} 
            disabled={loading}
            className="mt-3"
            size="sm"
          >
            {loading ? 'Loading...' : requiredPlan === 'enterprise' ? 'Contact Sales' : `Upgrade to ${targetPlan.name}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface UpgradeInlineProps {
  message: string;
  requiredPlan?: PlanType;
}

export function UpgradeInline({ message, requiredPlan = 'pro' }: UpgradeInlineProps) {
  const { startCheckout } = useSubscription();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      await startCheckout(requiredPlan);
    } catch (error: any) {
      toast({
        title: 'Upgrade Failed',
        description: error.message || 'Failed to start checkout',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const targetPlan = PLAN_CONFIG[requiredPlan];

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md">
      <AlertCircle className="w-4 h-4 text-primary" />
      <span>{message}</span>
      <Button 
        variant="link" 
        size="sm" 
        className="p-0 h-auto text-primary"
        onClick={handleUpgrade}
        disabled={loading}
      >
        {loading ? '...' : `Upgrade to ${targetPlan.name}`}
      </Button>
    </div>
  );
}
