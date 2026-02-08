import { Button } from '@/components/ui/button';
import { ArrowRight, Clock, Zap, ShieldCheck } from 'lucide-react';

interface CTASectionProps {
  onGetStartedClick: () => void;
}

const trustBadges = [
  { icon: Zap, label: '7 days free trial' },
  { icon: Clock, label: 'Takes 30 seconds' },
  { icon: ShieldCheck, label: '30-day money-back guarantee' },
];

export function CTASection({ onGetStartedClick }: CTASectionProps) {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground animate-fade-in leading-tight">
            Ready to reclaim
            <br />
            <span className="text-primary">your time?</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '100ms' }}>
            Join thousands of professionals who&apos;ve already transformed their email workflow with Wibookly.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button
              size="lg"
              className="group rounded-full px-8 py-6 text-base font-semibold shadow-lg"
              onClick={onGetStartedClick}
            >
              Get Started for Free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 py-6 text-base font-semibold border-border/40"
              asChild
            >
              <a href="mailto:hello@wibookly.ai">Schedule Demo Call</a>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <badge.icon className="w-4 h-4 text-success" />
                <span>{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
