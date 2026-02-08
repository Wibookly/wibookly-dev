import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, FolderOpen, Sparkles, Bot } from 'lucide-react';

interface HeroProps {
  onGetStartedClick: () => void;
}

export function Hero({ onGetStartedClick }: HeroProps) {
  return (
    <section className="pt-36 pb-20 md:pt-48 md:pb-32 bg-[image:var(--gradient-hero)] overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Email Management</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] animate-fade-in text-foreground">
            Your inbox,{' '}
            <span className="bg-[image:var(--gradient-primary)] bg-clip-text text-transparent">
              organized
            </span>
            <br />
            and handled for you.
          </h1>
          
          {/* Sub-headline */}
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '100ms' }}>
            WeBookly brings clarity to your inbox by organizing messages, creating smart categories, and drafting thoughtful replies — all with AI working quietly in the background.
          </p>
          
          {/* CTA Buttons */}
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
            <Button 
              variant="outline" 
              size="xl"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See How It Works
            </Button>
          </div>
          
          {/* Trust line */}
          <p className="mt-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '300ms' }}>
            No credit card required · Free plan available · You stay in control
          </p>
        </div>

        {/* Feature Cards Preview */}
        <div className="mt-20 max-w-5xl mx-auto animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Smart Inbox */}
            <div className="group p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <Mail className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Smart Inbox</h3>
              <p className="text-muted-foreground leading-relaxed">Emails sorted and organized automatically by AI</p>
            </div>
            
            {/* Categories */}
            <div className="group p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                <FolderOpen className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Categories</h3>
              <p className="text-muted-foreground leading-relaxed">Custom categories organized by context and priority</p>
            </div>
            
            {/* AI Drafts */}
            <div className="group p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">AI Drafts</h3>
              <p className="text-muted-foreground leading-relaxed">Intelligent replies ready for your review and approval</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
