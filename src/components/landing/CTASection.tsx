import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTASectionProps {
  onGetStartedClick: () => void;
}

export function CTASection({ onGetStartedClick }: CTASectionProps) {
  return (
    <section className="py-24 md:py-32 bg-[image:var(--gradient-cta)]">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-fade-in">
            Ready to take control of your inbox?
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
            Join thousands of professionals who save hours every week with WeBookly's intelligent email management.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button 
              variant="gradient" 
              size="xl" 
              className="group"
              onClick={onGetStartedClick}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '300ms' }}>
            No credit card required · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
