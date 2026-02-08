import { ReactNode } from 'react';
import { useSubscription, PLAN_CONFIG, PlanType } from '@/lib/subscription';
import { UpgradeBanner } from './UpgradeBanner';

type FeatureKey = keyof typeof PLAN_CONFIG.starter.features;

interface FeatureGateProps {
  feature: FeatureKey;
  children: ReactNode;
  fallback?: ReactNode;
  showBanner?: boolean;
  featureDisplayName?: string;
  requiredPlan?: PlanType;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback,
  showBanner = true,
  featureDisplayName,
  requiredPlan = 'pro'
}: FeatureGateProps) {
  const { hasFeature } = useSubscription();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showBanner) {
    const displayName = featureDisplayName || formatFeatureName(feature);
    return <UpgradeBanner feature={displayName} requiredPlan={requiredPlan} />;
  }

  return null;
}

interface MailboxGateProps {
  currentCount: number;
  children: ReactNode;
  onBlocked?: () => void;
}

export function MailboxGate({ currentCount, children, onBlocked }: MailboxGateProps) {
  const { canConnectMoreMailboxes, plan, getMailboxLimit } = useSubscription();

  if (canConnectMoreMailboxes(currentCount)) {
    return <>{children}</>;
  }

  const limit = getMailboxLimit();
  const nextPlan = plan === 'starter' ? 'pro' : 'enterprise';

  return (
    <UpgradeBanner 
      feature={`more than ${limit} mailbox${limit > 1 ? 'es' : ''}`}
      requiredPlan={nextPlan}
    />
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
