import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

// Plan configuration with Stripe product/price IDs
export const PLAN_CONFIG = {
  starter: {
    name: 'Starter',
    price: 20,
    monthlyPriceId: 'price_1Sog5tAESvm0s6Eqlef0MlRD',
    annualPriceId: 'price_1SyhKmAESvm0s6EqSrGFVM1r',
    productId: 'prod_TmEZSmRDQaRFxJ',
    annualProductId: 'prod_TwaVWQOaCR4SlF',
    mailboxLimit: 1,
    features: {
      aiAutoDrafts: true,
      aiAutoReply: false,
      advancedAutomation: false,
      aiSignature: false,
      advancedAnalytics: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 50,
    monthlyPriceId: 'price_1Sog6BAESvm0s6EqGMDf8sch',
    annualPriceId: 'price_1SyhLUAESvm0s6Eq371kAWuh',
    productId: 'prod_TmEZZY5hzUCPhe',
    annualProductId: 'prod_TwaWPSYXMPb8Xq',
    mailboxLimit: 5,
    features: {
      aiAutoDrafts: true,
      aiAutoReply: true,
      advancedAutomation: true,
      aiSignature: true,
      advancedAnalytics: true,
    },
  },
  enterprise: {
    name: 'Business',
    price: 42.50,
    monthlyPriceId: 'price_1SyhgUAESvm0s6Eq8WbV6wWE',
    annualPriceId: null,
    productId: 'prod_TwasTFG45ScxCd',
    annualProductId: null,
    mailboxLimit: Infinity,
    features: {
      aiAutoDrafts: true,
      aiAutoReply: true,
      advancedAutomation: true,
      aiSignature: true,
      advancedAnalytics: true,
    },
  },
} as const;

export type PlanType = keyof typeof PLAN_CONFIG;

export interface SubscriptionState {
  plan: PlanType;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'none';
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: string | null;
  loading: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  isFreeOverride: boolean;
  refreshSubscription: () => Promise<void>;
  canConnectMoreMailboxes: (currentCount: number) => boolean;
  hasFeature: (feature: keyof typeof PLAN_CONFIG.starter.features) => boolean;
  getMailboxLimit: () => number;
  getUpgradePlan: () => PlanType | null;
  startCheckout: (plan: PlanType, billingInterval?: 'monthly' | 'annual') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, session, organization } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: 'starter',
    status: 'none',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    currentPeriodEnd: null,
    loading: true,
  });
  const [isFreeOverride, setIsFreeOverride] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Check for super-admin plan override first
      const { data: overrideData } = await supabase
        .from('user_plan_overrides')
        .select('granted_plan, is_active')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (overrideData?.is_active && overrideData.granted_plan) {
        const overridePlan = overrideData.granted_plan as PlanType;
        if (overridePlan in PLAN_CONFIG) {
          setIsFreeOverride(true);
          setState({
            plan: overridePlan,
            status: 'active',
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            currentPeriodEnd: null,
            loading: false,
          });
          return; // Skip Stripe check entirely
        }
      }
      setIsFreeOverride(false);

      if (!organization?.id) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', organization.id)
        .maybeSingle();

      if (subData) {
        // Map legacy 'professional' plan name to 'pro'
        let plan = (subData.plan as string) || 'starter';
        if (plan === 'professional') plan = 'pro';
        
        setState({
          plan: (plan as PlanType),
          status: (subData.status as SubscriptionState['status']) || 'active',
          stripeCustomerId: subData.stripe_customer_id,
          stripeSubscriptionId: subData.stripe_subscription_id,
          currentPeriodEnd: subData.current_period_end,
          loading: false,
        });
      } else {
        setState(prev => ({ ...prev, plan: 'starter', status: 'none', loading: false }));
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!error && data && !data.error) {
        let detectedPlan: PlanType = 'starter';
        const productId = data.product_id;
        if (
          productId === PLAN_CONFIG.pro.productId ||
          productId === PLAN_CONFIG.pro.annualProductId
        ) {
          detectedPlan = 'pro';
        } else if (
          productId === PLAN_CONFIG.starter.productId ||
          productId === PLAN_CONFIG.starter.annualProductId
        ) {
          detectedPlan = 'starter';
        } else if (data.subscribed && productId) {
          detectedPlan = 'pro';
        }

        setState(prev => ({
          ...prev,
          plan: data.subscribed ? detectedPlan : prev.plan,
          status: data.subscribed ? 'active' : prev.status,
          currentPeriodEnd: data.subscription_end || prev.currentPeriodEnd,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [organization?.id, session?.access_token]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    const interval = setInterval(fetchSubscription, 60000);
    return () => clearInterval(interval);
  }, [fetchSubscription]);

  const canConnectMoreMailboxes = useCallback((currentCount: number) => {
    const limit = PLAN_CONFIG[state.plan].mailboxLimit;
    return currentCount < limit;
  }, [state.plan]);

  const hasFeature = useCallback((feature: keyof typeof PLAN_CONFIG.starter.features) => {
    return PLAN_CONFIG[state.plan].features[feature];
  }, [state.plan]);

  const getMailboxLimit = useCallback(() => {
    return PLAN_CONFIG[state.plan].mailboxLimit;
  }, [state.plan]);

  const getUpgradePlan = useCallback((): PlanType | null => {
    if (state.plan === 'starter') return 'pro';
    if (state.plan === 'pro') return 'enterprise';
    return null;
  }, [state.plan]);

  const startCheckout = useCallback(async (plan: PlanType, billingInterval: 'monthly' | 'annual' = 'monthly') => {
    if (!session?.access_token) {
      throw new Error('Please sign in to upgrade');
    }

    const planConfig = PLAN_CONFIG[plan];
    const priceId = billingInterval === 'annual' 
      ? planConfig.annualPriceId 
      : planConfig.monthlyPriceId;
    
    if (!priceId) {
      window.open('mailto:sales@wibookly.com?subject=Enterprise%20Plan%20Inquiry', '_blank');
      return;
    }

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { priceId },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  }, [session?.access_token]);

  const openCustomerPortal = useCallback(async () => {
    if (!session?.access_token) {
      throw new Error('Please sign in to manage subscription');
    }

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (error) throw error;
    if (data?.url) {
      window.open(data.url, '_blank');
    }
  }, [session?.access_token]);

  return (
    <SubscriptionContext.Provider
      value={{
        ...state,
        isFreeOverride,
        refreshSubscription: fetchSubscription,
        canConnectMoreMailboxes,
        hasFeature,
        getMailboxLimit,
        getUpgradePlan,
        startCheckout,
        openCustomerPortal,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
