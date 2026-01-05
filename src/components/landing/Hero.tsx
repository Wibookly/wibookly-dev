import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onGetStartedClick: () => void;
}

export function Hero({ onGetStartedClick }: HeroProps) {
  return (
    <section className="pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] animate-fade-in text-foreground">
            Your inbox, organized
            <br />
            and handled for you.
          </h1>
          
          {/* Sub-headline */}
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
            Wibookly brings clarity to your inbox by organizing messages, creating smart categories, and drafting thoughtful replies — all with AI working quietly in the background.
          </p>
          
          {/* CTA Button */}
          <div className="mt-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button 
              size="lg" 
              className="group px-8 py-6 text-base font-medium"
              onClick={onGetStartedClick}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          {/* Trust line */}
          <p className="mt-6 text-sm text-muted-foreground/70 animate-fade-in" style={{ animationDelay: '300ms' }}>
            You stay in control.
          </p>
        </div>
      </div>
    </section>
  );
}
