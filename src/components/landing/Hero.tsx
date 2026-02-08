import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onGetStartedClick: () => void;
}

export function Hero({ onGetStartedClick }: HeroProps) {
  return (
    <section className="pt-12 pb-16 md:pt-20 md:pb-24">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] text-foreground">
            Replace 4 tools with one
            <br />
            intelligent assistant
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Stop paying for multiple subscriptions. Wibookly consolidates your email
            workflow into one powerful platform.
          </p>
          
          <div className="mt-8">
            <Button 
              size="lg" 
              className="group rounded-full px-8 py-6 text-base font-medium"
              onClick={onGetStartedClick}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
