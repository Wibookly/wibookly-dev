import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onGetStartedClick: () => void;
}

export function CTASection({ onGetStartedClick }: CTASectionProps) {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground animate-fade-in leading-tight">
            A Better Relationship
            <br />
            <span className="text-primary">with Your Inbox</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground animate-fade-in leading-relaxed" style={{ animationDelay: '100ms' }}>
            Calm. Intelligent. Personal.
          </p>

          <div className="mt-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button
              size="lg"
              className="group px-10 py-7 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={onGetStartedClick}
            >
              Start Free with Wibookly
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          <p className="mt-8 text-sm text-muted-foreground/60 animate-fade-in" style={{ animationDelay: '300ms' }}>
            Privacy-first · No credit card required
          </p>
        </div>
      </div>
    </section>
  );
}
