import { Crown, Sparkles, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSubscription, PLAN_CONFIG, PlanType } from '@/lib/subscription';
import { cn } from '@/lib/utils';

interface PlanBadgeProps {
  plan?: PlanType;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

export function PlanBadge({ plan: propPlan, size = 'md', showIcon = true, className }: PlanBadgeProps) {
  const { plan: currentPlan, status } = useSubscription();
  const plan = propPlan || currentPlan;
  
  const hasActiveSub = status === 'active' || status === 'trialing';
  const planConfig = PLAN_CONFIG[plan];

  const icons = {
    starter: Zap,
    pro: Sparkles,
    enterprise: Crown,
  };

  const colors = {
    starter: 'bg-muted text-muted-foreground border-border',
    pro: 'bg-primary/10 text-primary border-primary/20',
    enterprise: 'bg-accent/10 text-accent-foreground border-accent/20',
  };

  // If no active subscription and no propPlan override, show "No Plan"
  if (!hasActiveSub && !propPlan) {
    return (
      <Badge 
        variant="outline" 
        className={cn(
          'bg-destructive/10 text-destructive border-destructive/20',
          size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
          className
        )}
      >
        No Plan
      </Badge>
    );
  }

  const Icon = icons[plan];

  return (
    <Badge 
      variant="outline" 
      className={cn(
        colors[plan],
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        className
      )}
    >
      {showIcon && <Icon className={cn('mr-1', size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />}
      {planConfig.name}
    </Badge>
  );
}

export function UpgradeBadge({ className }: { className?: string }) {
  return (
    <Badge 
      variant="outline" 
      className={cn(
        'bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30 text-xs px-2 py-0.5',
        className
      )}
    >
      <Sparkles className="w-3 h-3 mr-1" />
      Upgrade
    </Badge>
  );
}
