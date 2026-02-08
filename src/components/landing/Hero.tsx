import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import mockupInbox from '@/assets/mockup-inbox.png';

interface HeroProps {
  onGetStartedClick: () => void;
}

const featurePills = [
  'Smart Inbox',
  'AI Drafts',
  'Organize Inbox',
  'Sort by Priority',
];

export function Hero({ onGetStartedClick }: HeroProps) {
  return (
    <section className="pt-36 pb-16 md:pt-48 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] animate-fade-in text-foreground">
            Your AI-powered
            <br />
            <span className="text-primary">email assistant.</span>
          </h1>
          
          {/* Sub-headline */}
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
            Wibookly organizes your inbox, drafts smart replies, and manages your calendar — all in one platform.
          </p>
          
          {/* CTA Button */}
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <Button 
              size="lg" 
              className="group px-8 py-6 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              onClick={onGetStartedClick}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          
          {/* Works with badges */}
          <div className="mt-6 flex items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <span className="text-sm text-muted-foreground/70">Works with</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/30 shadow-sm">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M2 6L12 13L22 6" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <rect x="2" y="4" width="20" height="16" rx="2" stroke="hsl(var(--primary))" strokeWidth="2"/>
                </svg>
                <span className="text-sm font-medium text-foreground">Outlook</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 border border-border/30 shadow-sm">
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

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-in" style={{ animationDelay: '250ms' }}>
            {featurePills.map((pill) => (
              <span
                key={pill}
                className="px-4 py-2 rounded-full bg-card/50 border border-border/30 text-sm font-medium text-foreground/80 shadow-sm hover:bg-card/70 hover:border-primary/30 transition-all cursor-default"
              >
                {pill}
              </span>
            ))}
          </div>

          {/* Product mockup */}
          <div className="mt-14 animate-fade-in" style={{ animationDelay: '350ms' }}>
            <div className="relative mx-auto max-w-4xl">
              {/* Gradient glow behind */}
              <div className="absolute inset-0 -m-4 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-success/20 blur-2xl" />
              <div className="relative rounded-2xl border border-border/30 shadow-2xl overflow-hidden bg-card/40 backdrop-blur-sm p-2">
                <img
                  src={mockupInbox}
                  alt="Wibookly inbox preview"
                  className="w-full rounded-xl"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
