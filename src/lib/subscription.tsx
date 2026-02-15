import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { api, getAccessToken } from '@/lib/aws-api';

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
    name: 'Enterprise',
    price: null,
    monthlyPriceId: null,
    annualPriceId: null,
    productId: null,
    annualProductId: null,
    mailboxLimit: 999,
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

interface SubscriptionState {
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
  const { user, tokens, organization } = useAuth();
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
    if (!tokens?.access_token) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      // Check if user is super_admin
      const roleData = await api<{ role: string } | null>(`/users/${user?.id}/roles?role=super_admin`).catch(() => null);

      if (roleData?.role === 'super_admin') {
        setIsFreeOverride(true);
        setState({
          plan: 'pro',
          status: 'active',
          stripeCustomerId: null,
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
          loading: false,
        });
        return;
      }

      // Check for plan override
      const overrideData = await api<{ granted_plan: string; is_active: boolean } | null>(`/users/${user?.id}/plan-override`).catch(() => null);

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
          return;
        }
      }
      setIsFreeOverride(false);

      if (!organization?.id) {
        setState(prev => ({ ...prev, loading: false }));
        return;
      }

      // Fetch subscription from API
      const subData = await api<{
        plan: string;
        status: string;
        stripe_customer_id: string | null;
        stripe_subscription_id: string | null;
        current_period_end: string | null;
      } | null>(`/organizations/${organization.id}/subscription`).catch(() => null);

      if (subData) {
        let plan = subData.plan || 'starter';
        if (plan === 'professional') plan = 'pro';

        setState({
          plan: plan as PlanType,
          status: (subData.status as SubscriptionState['status']) || 'active',
          stripeCustomerId: subData.stripe_customer_id,
          stripeSubscriptionId: subData.stripe_subscription_id,
          currentPeriodEnd: subData.current_period_end,
          loading: false,
        });
      } else {
        setState(prev => ({ ...prev, plan: 'starter', status: 'none', loading: false }));
      }

      // Cross-check with Stripe
      const checkData = await api<{
        subscribed: boolean;
        product_id?: string;
        subscription_end?: string;
        error?: string;
      }>('/check-subscription').catch(() => null);

      if (checkData && !checkData.error) {
        let detectedPlan: PlanType = 'starter';
        const productId = checkData.product_id;
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
        } else if (checkData.subscribed && productId) {
          detectedPlan = 'pro';
        }

        setState(prev => ({
          ...prev,
          plan: checkData.subscribed ? detectedPlan : prev.plan,
          status: checkData.subscribed ? 'active' : prev.status,
          currentPeriodEnd: checkData.subscription_end || prev.currentPeriodEnd,
          loading: false,
        }));
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [organization?.id, tokens?.access_token, user?.id]);

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
    const token = getAccessToken();
    if (!token) {
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

    const data = await api<{ url?: string }>('/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    });

    if (data?.url) {
      window.open(data.url, '_blank');
    }
  }, []);

  const openCustomerPortal = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      throw new Error('Please sign in to manage subscription');
    }

    const data = await api<{ url?: string }>('/customer-portal', { method: 'POST' });

    if (data?.url) {
      window.open(data.url, '_blank');
    }
  }, []);

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
