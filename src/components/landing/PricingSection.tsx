import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { PRICING_PLANS, getAnnualPricePerMonth, type BillingInterval } from '@/lib/pricing-config';
import { BillingToggle } from './BillingToggle';
import { VolumeDiscountInfo } from './VolumeDiscountInfo';

export function PricingSection() {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('annual');

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="blob-decoration blob-teal w-72 h-72 top-20 -left-20" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Simple, <span className="text-primary">transparent</span> pricing
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
            Choose monthly or save more with annual billing.
          </p>
          <BillingToggle interval={billingInterval} onChange={setBillingInterval} />
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_PLANS.map((plan) => {
            const Icon = plan.icon;
            const annualPrice = plan.monthlyPrice
              ? getAnnualPricePerMonth(plan.monthlyPrice)
              : null;
            const displayPrice =
              billingInterval === 'annual' ? annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative overflow-hidden flex flex-col ${
                  plan.popular
                    ? 'floating-card ring-2 ring-primary/20 md:scale-105'
                    : 'floating-card-alt'
                } p-0`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-[image:var(--gradient-primary)] text-primary-foreground px-4 py-1 text-xs font-semibold rounded-bl-2xl">
                    Most Popular
                  </div>
                )}
                <div className="p-6 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>
                <div className="px-6 pb-6 flex-1">
                  <div className="mb-6">
                    {displayPrice !== null ? (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-bold text-foreground">
                            ${displayPrice}
                          </span>
                          <span className="text-muted-foreground">/month</span>
                        </div>
                        {billingInterval === 'annual' && plan.monthlyPrice && (
                          <div className="mt-1 flex items-center gap-2">
                            <span className="text-sm text-muted-foreground line-through">
                              ${plan.monthlyPrice}/mo
                            </span>
                            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                              Save 15%
                            </span>
                          </div>
                        )}
                        {billingInterval === 'annual' && plan.monthlyPrice && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Billed ${Math.round(displayPrice * 12)}/year
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xl font-semibold text-primary">
                        {plan.priceLabel}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded.map((feature, index) => (
                      <li key={`not-${index}`} className="flex items-start gap-3 opacity-40">
                        <div className="w-5 h-5 mt-0.5 flex-shrink-0 flex items-center justify-center">
                          <div className="w-1.5 h-0.5 bg-muted-foreground rounded" />
                        </div>
                        <span className="text-sm line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 pb-6">
                  <Button
                    className="w-full rounded-xl"
                    variant={plan.popular ? 'gradient' : 'outline'}
                    size="lg"
                    onClick={handleGetStarted}
                  >
                    {plan.monthlyPrice === null ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <VolumeDiscountInfo interval={billingInterval} />
      </div>
    </section>
  );
}
