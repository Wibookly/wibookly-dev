import { ENTERPRISE_VOLUME_TIERS, ENTERPRISE_BASE_PRICE } from '@/lib/pricing-config';

function formatPrice(price: number): string {
  return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`;
}

export function EnterprisePricing() {
  const lowestPrice = ENTERPRISE_BASE_PRICE * (1 - ENTERPRISE_VOLUME_TIERS[0].discount);

  return (
    <div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold text-foreground">
          {formatPrice(lowestPrice)}
        </span>
        <span className="text-muted-foreground">/user/mo</span>
      </div>
      <p className="text-xs text-muted-foreground mt-1.5 mb-3">
        6+ users · Based on Pro pricing
      </p>
      <div className="space-y-1.5 rounded-lg bg-primary/5 p-3">
        {ENTERPRISE_VOLUME_TIERS.map((tier) => (
          <div key={tier.label} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{tier.label}</span>
            <span className="font-semibold text-primary">
              {formatPrice(ENTERPRISE_BASE_PRICE * (1 - tier.discount))}/user
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
