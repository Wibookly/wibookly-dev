import { Mail, MessageSquare, Calendar, Inbox, Sparkles, ArrowRight } from 'lucide-react';
import wibooklyLogo from '@/assets/logo-icon.png';

const competitors = [
  {
    icon: Mail,
    name: 'Fyxer.ai',
    price: '$30',
    description: 'Email organizer',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: MessageSquare,
    name: 'Chat GPT',
    price: '$20',
    description: 'Answers general questions',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    icon: Calendar,
    name: 'Calendly',
    price: '$10',
    description: 'Scheduling tool',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Inbox,
    name: 'Superhuman',
    price: '$30',
    description: 'Productivity-focused email inbox',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
];

const wibooklyFeatures = [
  {
    title: 'AI-powered email organizer',
    replaces: 'Fyxer.ai',
    replacesIcon: Mail,
  },
  {
    title: 'Answers any question, even about your business',
    replaces: 'Chat GPT',
    replacesIcon: MessageSquare,
  },
  {
    title: 'Seamless scheduling without switching apps',
    replaces: 'Calendly',
    replacesIcon: Calendar,
  },
  {
    title: 'AI-native, productivity-focused email inbox',
    replaces: 'Superhuman',
    replacesIcon: Inbox,
  },
];

export function ToolComparison() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14 animate-fade-in">
            <span className="inline-block px-4 py-1.5 rounded-full bg-card/70 text-primary text-sm font-medium mb-4 border border-primary/20 shadow-sm">
              Why Wibookly?
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground leading-tight">
              Replace 4 tools with one
              <br />
              <span className="text-primary">intelligent assistant.</span>
            </h2>
            <p className="mt-5 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Stop paying for multiple subscriptions. Wibookly consolidates your email workflow into one powerful platform.
            </p>
          </div>

          {/* Comparison Card */}
          <div className="rounded-3xl bg-card/50 backdrop-blur-sm border border-card/60 p-6 md:p-10 lg:p-14 shadow-xl animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-6 items-center">
              
              {/* Left: Competitors */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">Other tools</h3>
                {competitors.map((comp) => (
                  <div
                    key={comp.name}
                    className="flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card/70 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${comp.bg} flex items-center justify-center`}>
                        <comp.icon className={`w-5 h-5 ${comp.color}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{comp.name}</p>
                        <p className="text-xs text-muted-foreground">{comp.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground bg-secondary px-3 py-1.5 rounded-full">
                      {comp.price}
                    </span>
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-3 px-2">
                  <span className="text-sm text-muted-foreground">In total</span>
                  <span className="border-b-2 border-dashed border-border flex-1" />
                  <span className="text-3xl md:text-4xl font-bold text-foreground">
                    $90<span className="text-base font-normal text-muted-foreground">/month</span>
                  </span>
                </div>
              </div>

              {/* Center: VS */}
              <div className="flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-card border-2 border-border shadow-md flex items-center justify-center">
                  <span className="text-lg font-bold text-muted-foreground">vs</span>
                </div>
              </div>

              {/* Right: Wibookly */}
              <div className="space-y-5">
                <div className="flex flex-col items-center mb-6">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-success/20 border-2 border-primary/30 flex items-center justify-center shadow-lg mb-3">
                    <img src={wibooklyLogo} alt="Wibookly" className="w-16 h-16 object-contain" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Wibookly</h3>
                  <p className="text-sm text-muted-foreground">All-in-one email assistant</p>
                </div>

                <div className="space-y-3">
                  {wibooklyFeatures.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-primary/5 to-success/5 border border-primary/15">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{feature.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Replaces <feature.replacesIcon className="w-3 h-3 inline mx-0.5 text-primary" /> {feature.replaces}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-3 px-2">
                  <span className="text-sm text-muted-foreground">In total</span>
                  <span className="border-b-2 border-dashed border-primary/30 flex-1" />
                  <span className="text-3xl md:text-4xl font-bold text-primary">
                    $25<span className="text-base font-normal text-muted-foreground">/month</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save callout */}
          <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-success/10 border border-success/20 shadow-sm">
              <ArrowRight className="w-5 h-5 text-success" />
              <span className="text-base font-semibold text-success">Save over $65/month with Wibookly</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
