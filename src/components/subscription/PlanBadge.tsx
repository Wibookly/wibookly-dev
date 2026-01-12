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
  const { plan: currentPlan } = useSubscription();
  const plan = propPlan || currentPlan;
  
  const planConfig = PLAN_CONFIG[plan];

  const icons = {
    starter: Zap,
    professional: Sparkles,
    enterprise: Crown,
  };

  const colors = {
    starter: 'bg-muted text-muted-foreground border-border',
    professional: 'bg-primary/10 text-primary border-primary/20',
    enterprise: 'bg-accent/10 text-accent-foreground border-accent/20',
  };

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
