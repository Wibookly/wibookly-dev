import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Mail, FolderOpen, Reply, Layers, Calendar } from 'lucide-react';

interface HeroProps {
  onGetStartedClick: () => void;
}

const featureCards = [
  {
    icon: Mail,
    title: 'Smart Inbox',
    description: 'Emails sorted automatically',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/15',
  },
  {
    icon: Layers,
    title: 'Smart Categories',
    description: 'AI-powered email organization',
    iconColor: 'text-accent-foreground',
    iconBg: 'bg-accent/20',
  },
  {
    icon: Sparkles,
    title: 'AI Drafts',
    description: 'Replies ready for review',
    iconColor: 'text-success',
    iconBg: 'bg-success/15',
  },
  {
    icon: Reply,
    title: 'AI Auto Reply',
    description: 'Automatic smart responses',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/15',
  },
  {
    icon: FolderOpen,
    title: 'Rule-Based Sorting',
    description: 'Custom rules for every email',
    iconColor: 'text-warning',
    iconBg: 'bg-warning/15',
  },
  {
    icon: Calendar,
    title: 'AI Scheduling',
    description: 'Seamless calendar management',
    iconColor: 'text-success',
    iconBg: 'bg-success/15',
  },
];

export function Hero({ onGetStartedClick }: HeroProps) {
  return (
    <section className="pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] animate-fade-in text-foreground">
            Replace 4 tools with one
            <br />
            intelligent assistant.
          </h1>
          
          {/* Sub-headline */}
          <p className="mt-8 text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
            Stop paying for multiple subscriptions. Wibookly consolidates your email workflow into one powerful platform.
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

        {/* Feature Cards Grid */}
        <div className="mt-16 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="relative rounded-3xl bg-card/40 backdrop-blur-sm border border-card/60 p-8 md:p-12 shadow-xl">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {featureCards.map((card, index) => (
                <div
                  key={card.title}
                  className="flex flex-col items-center text-center p-5 md:p-6 rounded-2xl bg-card/70 border border-border/30 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  style={{ animationDelay: `${500 + index * 80}ms` }}
                >
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl ${card.iconBg} flex items-center justify-center mb-4`}>
                    <card.icon className={`w-7 h-7 md:w-8 md:h-8 ${card.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1 text-sm md:text-base">{card.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">{card.description}</p>
                </div>
              ))}
            </div>
            
            {/* Decorative glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 rounded-3xl blur-xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
