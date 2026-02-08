import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Mail, FolderOpen } from 'lucide-react';

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
          
          {/* Trust line */}
          <p className="mt-6 text-sm text-muted-foreground/70 animate-fade-in" style={{ animationDelay: '300ms' }}>
            You stay in control.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="mt-16 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="relative rounded-3xl bg-card/40 backdrop-blur-sm border border-card/60 p-8 md:p-12 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Inbox Card */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/70 border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Smart Inbox</h3>
                <p className="text-sm text-muted-foreground">Emails sorted automatically</p>
              </div>
              
              {/* Categories Card */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/70 border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center mb-4">
                  <FolderOpen className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Categories</h3>
                <p className="text-sm text-muted-foreground">Organized by context</p>
              </div>
              
              {/* AI Draft Card */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/70 border border-border/30 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-2xl bg-success/15 flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-success" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">AI Drafts</h3>
                <p className="text-sm text-muted-foreground">Replies ready for review</p>
              </div>
            </div>
            
            {/* Decorative glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 rounded-3xl blur-xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
