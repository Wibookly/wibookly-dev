import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check, Zap, Sparkles, Crown } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 20,
    description: 'Perfect for individuals getting started with email automation',
    icon: Zap,
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
    id: 'professional',
    name: 'Professional',
    price: 50,
    description: 'For professionals who need powerful automation and insights',
    icon: Sparkles,
    popular: true,
    features: [
      'Up to 6 connected accounts',
      '30 auto drafts daily',
      '240 AI messages daily',
      'Chat with 3 years of email history',
      'Advanced AI intelligence',
      'Increased daily limits',
      'AI Auto Drafts',
      'AI Auto Reply',
      'Smart email categorization',
      'Unlimited email categories',
      'Advanced automation rules',
      'AI email signature',
      'Advanced AI analytics',
      'Calendar daily brief',
      'Priority support',
    ],
    notIncluded: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    priceLabel: 'Custom Pricing',
    description: 'For teams and organizations with advanced needs',
    icon: Crown,
    features: [
      'Unlimited connected accounts',
      'Everything in Professional',
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

export function PricingSection() {
  const navigate = useNavigate();

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
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
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
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    ) : (
                      <div className="text-2xl font-semibold text-primary">{plan.priceLabel}</div>
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
                    Get Started
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
