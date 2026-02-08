import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onGetStartedClick: () => void;
}

export function Hero({ onGetStartedClick }: HeroProps) {
  return (
    <section className="pt-36 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] animate-fade-in text-foreground">
            Wibookly — Your AI
            <br />
            <span className="text-primary">Email Assistant.</span>
          </h1>

          {/* Sub-headline */}
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
            A calm, intelligent way to manage emails.
            <br className="hidden sm:block" />
            Organize, prioritize, and reply effortlessly — across all inboxes.
          </p>

          {/* CTA Button */}
          <div className="mt-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button
              size="lg"
              className="group px-10 py-7 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={onGetStartedClick}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Works with */}
          <div className="mt-10 flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <span className="text-sm text-muted-foreground/60">Works with</span>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground/80">Outlook</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-sm font-medium text-muted-foreground/80">Gmail</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-sm font-medium text-muted-foreground/80">IMAP</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
