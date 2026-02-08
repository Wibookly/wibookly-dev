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
      <p className="text-xs text-muted-foreground mt-1.5">
        6+ users · Volume discounts available
      </p>
    </div>
  );
}
