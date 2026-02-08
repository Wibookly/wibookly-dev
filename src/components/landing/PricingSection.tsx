import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Zap, Sparkles, Crown } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 20,
    description: 'Perfect for individuals getting started with email automation',
    icon: Zap,
    features: [
      '1 connected mailbox',
      'AI Auto Drafts',
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
      'Up to 4 connected mailboxes',
      'AI Auto Drafts',
      'AI Auto Reply',
      'Smart email categorization',
      'Unlimited email categories',
      'Advanced automation rules',
      'AI email signature',
      'Advanced AI analytics',
      'Priority support',
    ],
    notIncluded: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    description: 'For teams and organizations with advanced needs',
    icon: Crown,
    features: [
      'Unlimited connected mailboxes',
      'Everything in Professional',
      'Admin dashboard',
      'Team management',
      'License assignment',
      'Usage reporting',
      'Custom integrations',
      'Dedicated account manager',
      'SLA guarantee',
    ],
    notIncluded: [],
    showGetStarted: true,
  },
];

export function PricingSection() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/auth?mode=signup');
  };

  return (
    <section id="pricing" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Simple, transparent pricing
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden bg-card border ${
                  plan.popular
                    ? 'border-primary ring-2 ring-primary/20 shadow-lg md:scale-105'
                    : 'border-border shadow-sm'
                } rounded-2xl transition-all duration-300 hover:shadow-md`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-[image:var(--gradient-primary)] text-primary-foreground px-4 py-1 text-xs font-semibold rounded-bl-xl">
                    Most Popular
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="mb-6">
                    {plan.price !== null ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </div>
                    ) : (
                      <div className="text-2xl font-semibold text-foreground">Contact Sales</div>
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
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'gradient' : 'outline'}
                    size="lg"
                    onClick={handleGetStarted}
                  >
                    {plan.price === null ? 'Get Started' : 'Get Started'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
