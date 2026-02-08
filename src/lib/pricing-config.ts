import { Zap, Sparkles, Crown, type LucideIcon } from 'lucide-react';

// Enterprise volume discount tiers (6+ users, based on Pro per-seat price)
export const ENTERPRISE_VOLUME_TIERS = [
  { min: 6, max: 14, discount: 0.15, label: '6–14 users' },
  { min: 15, max: 49, discount: 0.18, label: '15–49 users' },
  { min: 50, max: 99, discount: 0.20, label: '50–99 users' },
  { min: 100, max: Infinity, discount: 0.25, label: '100+ users' },
] as const;

export const ENTERPRISE_BASE_PRICE = 50; // Per-seat base price (same as Pro)

export type BillingInterval = 'monthly' | 'annual';

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number | null;
  description: string;
  icon: LucideIcon;
  popular?: boolean;
  priceLabel?: string;
  perUser?: boolean;
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
    description: 'For professionals and small teams who need powerful automation',
    icon: Sparkles,
    popular: true,
    perUser: true,
    showAnnualDiscount: true,
    features: [
      'Up to 5 team members',
      '30 auto drafts daily per user',
      '240 AI messages daily per user',
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
    priceLabel: 'Volume Pricing',
    description: 'For growing teams of 6+ users with volume discounts',
    icon: Crown,
    showAnnualDiscount: false,
    features: [
      'Everything in Pro',
      'Starting from 6 users',
      'Admin dashboard',
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
 * Get the enterprise per-seat price for a given user count.
 */
export function getEnterprisePerSeatPrice(userCount: number): number {
  const tier = ENTERPRISE_VOLUME_TIERS.find(
    (t) => userCount >= t.min && userCount <= t.max
  );
  const discount = tier?.discount ?? 0.15;
  return Math.round(ENTERPRISE_BASE_PRICE * (1 - discount) * 100) / 100;
}

/**
 * Calculate the discounted annual price per month.
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
