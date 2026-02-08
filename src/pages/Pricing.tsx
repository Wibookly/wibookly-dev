import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import wibooklyLogo from '@/assets/wibookly-logo.png';
import { PRICING_PLANS, getAnnualPricePerMonth, type BillingInterval } from '@/lib/pricing-config';
import { BillingToggle } from '@/components/landing/BillingToggle';
import { EnterprisePricing } from '@/components/landing/EnterprisePricing';

export default function Pricing() {
  const navigate = useNavigate();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('annual');

  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-[image:var(--gradient-hero)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between h-14 px-6 rounded-2xl bg-card/80 backdrop-blur-lg border border-border/50 shadow-sm">
            <Link to="/" className="flex items-center group">
              <img 
                src={wibooklyLogo} 
                alt="Wibookly" 
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-105" 
              />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </Link>
              <Link to="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link to="/pricing" className="text-sm font-medium text-foreground transition-colors">
                Pricing
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={handleGetStarted}>
                Sign In
              </Button>
              <Button variant="gradient" size="sm" onClick={handleGetStarted}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-36 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose monthly or save more with annual billing.
            </p>
            <BillingToggle interval={billingInterval} onChange={setBillingInterval} />
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {PRICING_PLANS.map((plan) => {
              const Icon = plan.icon;
              const showDiscount = plan.showAnnualDiscount && billingInterval === 'annual';
              const annualPrice = plan.monthlyPrice
                ? getAnnualPricePerMonth(plan.monthlyPrice)
                : null;
              const displayPrice = showDiscount ? annualPrice : plan.monthlyPrice;

              return (
                <Card 
                  key={plan.id}
                  className={`relative overflow-hidden bg-card border ${plan.popular ? 'border-primary ring-2 ring-primary/20 shadow-lg scale-105' : 'border-border shadow-sm'} rounded-2xl transition-all duration-300 hover:shadow-md`}
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
                      {plan.id === 'enterprise' ? (
                        <EnterprisePricing />
                      ) : displayPrice !== null ? (
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-foreground">
                              ${displayPrice}
                            </span>
                            <span className="text-muted-foreground">
                              {plan.perUser ? '/user/month' : '/month'}
                            </span>
                          </div>
                          {showDiscount && plan.monthlyPrice && (
                            <div className="mt-1.5 flex items-center gap-2">
                              <span className="text-sm text-muted-foreground line-through">
                                ${plan.monthlyPrice}/mo
                              </span>
                              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                Save 15%
                              </span>
                            </div>
                          )}
                          {showDiscount && annualPrice && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Billed ${Math.round(annualPrice * 12)}/year
                            </p>
                          )}
                        </div>
                      ) : null}
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
                  <CardFooter className="flex-col gap-2">
                    <Button 
                      className="w-full"
                      variant={plan.popular ? 'gradient' : 'outline'}
                      size="lg"
                      onClick={handleGetStarted}
                    >
                      {plan.id === 'starter'
                        ? 'Start your free trial'
                        : plan.id === 'pro'
                          ? 'Try Pro – full power unlocked'
                          : 'Get Started'}
                    </Button>
                    {(plan.id === 'starter' || plan.id === 'pro') && (
                      <p className="text-xs text-muted-foreground text-center">
                        Your 3-day free trial included – cancel anytime
                      </p>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Questions?</h2>
            <p className="text-muted-foreground mb-6">
              Need help choosing? Contact us at{' '}
              <a href="mailto:support@wibookly.ai" className="text-primary hover:underline">
                support@wibookly.ai
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-card">
        <div className="container mx-auto px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Wibookly. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
