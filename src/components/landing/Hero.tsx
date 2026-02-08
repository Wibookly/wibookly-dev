import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroProps {
  onGetStartedClick: () => void;
}

export function Hero({ onGetStartedClick }: HeroProps) {
  return (
    <section className="pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] animate-fade-in text-foreground">
            Your AI-powered
            <br />
            email assistant.
          </h1>
          
          {/* Sub-headline */}
          <p className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
            Wibookly organizes your inbox, drafts smart replies, and manages your calendar — all in one platform.
          </p>
          
          {/* CTA Button */}
          <div className="mt-10 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Button 
              size="lg" 
              className="group px-8 py-6 text-base font-medium rounded-full shadow-lg"
              onClick={onGetStartedClick}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          {/* Integrations: Outlook & Gmail logos */}
          <div className="mt-8 flex items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <span className="text-sm text-muted-foreground/70">Works with</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/40 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M2 6L12 13L22 6" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="hsl(var(--primary))" strokeWidth="2"/>
                </svg>
                <span className="text-sm font-medium text-foreground">Outlook</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/40 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M4 4L10 10" stroke="hsl(var(--destructive))" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20 4L14 10" stroke="hsl(var(--success))" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M4 20L10 14" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M20 20L14 14" stroke="hsl(var(--warning))" strokeWidth="2" strokeLinecap="round"/>
                  <rect x="8" y="8" width="8" height="8" rx="1" stroke="hsl(var(--foreground))" strokeWidth="1.5"/>
                </svg>
                <span className="text-sm font-medium text-foreground">Gmail</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
