import { Zap, Sparkles, Crown, type LucideIcon } from 'lucide-react';

// Volume discount tiers for annual billing
export const ANNUAL_DISCOUNT_TIERS = [
  { min: 1, max: 14, discount: 0.15, label: '1–14 users' },
  { min: 15, max: 49, discount: 0.18, label: '15–49 users' },
  { min: 50, max: 99, discount: 0.20, label: '50–99 users' },
  { min: 100, max: Infinity, discount: 0.25, label: '100+ users' },
] as const;

// Monthly volume discount (enterprise only)
export const MONTHLY_ENTERPRISE_DISCOUNT = 0.15; // 15% off for 100+ users

export type BillingInterval = 'monthly' | 'annual';

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number | null;
  description: string;
  icon: LucideIcon;
  popular?: boolean;
  priceLabel?: string;
  features: string[];
  notIncluded: string[];
  showAnnualDiscount?: boolean;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 20,
    description: 'Perfect for individuals getting started with email automation',
    icon: Zap,
    showAnnualDiscount: true,
    features: [
      '1 connected account',
      '10 auto drafts daily',
      '50 AI messages daily',
      'Chat with 3 months of email history',
      'Smart email categorization',
      '10 email categories',
      'Basic analytics',
      'Email support',
    ],
    notIncluded: [
      'AI Auto Reply',
      'Advanced automation rules',
      'AI email signature',
      'Advanced AI analytics',
      'Calendar daily brief',
      'Advanced AI intelligence',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 50,
    description: 'For professionals who need powerful automation and insights',
    icon: Sparkles,
    popular: true,
    showAnnualDiscount: true,
    features: [
      'Up to 6 connected accounts',
      '30 auto drafts daily',
      '240 AI messages daily',
      'Chat with 3 years of email history',
      'Advanced AI intelligence',
      'AI Auto Drafts',
      'AI Auto Reply',
      'Smart email categorization',
      '20 email categories',
      'Advanced automation rules',
      'AI email signature',
      'Advanced AI analytics',
      'Calendar daily brief',
      'Increase auto draft daily limit',
      'Increase AI message daily limit',
      'Increase AI chat daily limit',
      'Priority support',
    ],
    notIncluded: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyPrice: null,
    priceLabel: 'Custom Pricing',
    description: 'For teams and organizations with advanced needs',
    icon: Crown,
    showAnnualDiscount: false,
    features: [
      'Unlimited connected accounts',
      'Everything in Pro',
      'Admin dashboard',
      'Increased auto draft daily limits',
      'Increased AI message daily limits',
      'Increased AI chat daily limits',
      'Advanced reporting',
      'Team management',
      'License assignment',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    notIncluded: [],
  },
];

/**
 * Get the annual discount percentage for a given user count.
 */
export function getAnnualDiscount(userCount: number): number {
  const tier = ANNUAL_DISCOUNT_TIERS.find(
    (t) => userCount >= t.min && userCount <= t.max
  );
  return tier?.discount ?? 0.15;
}

/**
 * Calculate the discounted annual price per month (using the base 1-14 user tier by default).
 */
export function getAnnualPricePerMonth(monthlyPrice: number, discountPercent: number = 0.15): number {
  return Math.round(monthlyPrice * (1 - discountPercent) * 100) / 100;
}

/**
 * Calculate the total annual price.
 */
export function getAnnualTotal(monthlyPrice: number, discountPercent: number = 0.15): number {
  return Math.round(monthlyPrice * (1 - discountPercent) * 12 * 100) / 100;
}
