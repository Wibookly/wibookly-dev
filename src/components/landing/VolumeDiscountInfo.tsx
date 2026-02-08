import { ANNUAL_DISCOUNT_TIERS } from '@/lib/pricing-config';
import type { BillingInterval } from '@/lib/pricing-config';

interface VolumeDiscountInfoProps {
  interval: BillingInterval;
}

export function VolumeDiscountInfo({ interval }: VolumeDiscountInfoProps) {
  return (
    <div className="mt-16 max-w-2xl mx-auto">
      <div className="floating-card-alt p-8 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {interval === 'annual' ? 'Annual Discounts by Team Size' : 'Volume Discounts'}
        </h3>
        {interval === 'annual' ? (
          <ul className="space-y-2 text-sm text-muted-foreground">
            {ANNUAL_DISCOUNT_TIERS.map((tier) => (
              <li key={tier.label} className="flex items-center justify-between max-w-xs mx-auto">
                <span>{tier.label}</span>
                <span className="font-semibold text-primary">
                  Save {Math.round(tier.discount * 100)}%
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Standard pricing applies.
            <br />
            Volume discounts available for organizations with 100+ users (15% off).
          </p>
        )}
        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Enterprise (100+ users):</strong> Custom pricing,
            priority support, and flexible billing.{' '}
            <a
              href="mailto:sales@wibookly.com?subject=Enterprise%20Plan%20Inquiry"
              className="text-primary hover:underline"
            >
              Contact sales
            </a>{' '}
            for a tailored plan.
          </p>
        </div>
      </div>
    </div>
  );
}
