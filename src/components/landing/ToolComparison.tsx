import { Mail, MessageSquare, Calendar, Inbox, Sparkles } from 'lucide-react';
import wibooklyLogo from '@/assets/logo-icon.png';

const competitors = [
  {
    icon: Mail,
    name: 'Fyxer.ai',
    price: '$30',
    description: 'Email organizer',
  },
  {
    icon: MessageSquare,
    name: 'Chat GPT',
    price: '$20',
    description: 'Answers general questions',
  },
  {
    icon: Calendar,
    name: 'Calendly',
    price: '$10',
    description: 'Scheduling tool',
  },
  {
    icon: Inbox,
    name: 'Superhuman',
    price: '$30',
    description: 'Productivity-focused email inbox',
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
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-sm p-6 md:p-10 lg:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-6 items-center">
              
              {/* Left: Competitors */}
              <div className="space-y-4">
                {competitors.map((comp) => (
                  <div
                    key={comp.name}
                    className="flex items-center justify-between p-4 rounded-xl border border-border bg-background/60"
                  >
                    <div className="flex items-center gap-3">
                      <comp.icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground text-sm">{comp.name}</p>
                        <p className="text-xs text-muted-foreground">{comp.description}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-foreground bg-secondary px-3 py-1 rounded-full">
                      {comp.price}
                    </span>
                  </div>
                ))}

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm text-muted-foreground">In total</span>
                  <span className="border-b border-dashed border-border flex-1" />
                  <span className="text-2xl md:text-3xl font-bold text-foreground">
                    $90<span className="text-base font-normal text-muted-foreground">/month</span>
                  </span>
                </div>
              </div>

              {/* Center: VS */}
              <div className="flex items-center justify-center">
                <span className="text-lg font-semibold text-muted-foreground px-4">vs</span>
              </div>

              {/* Right: Wibookly */}
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                    <img src={wibooklyLogo} alt="Wibookly" className="w-12 h-12 object-contain" />
                  </div>
                </div>

                <div className="space-y-3">
                  {wibooklyFeatures.map((feature) => (
                    <div key={feature.title} className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{feature.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Replaces <feature.replacesIcon className="w-3 h-3 inline mx-0.5" /> {feature.replaces}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm text-muted-foreground">In total</span>
                  <span className="border-b border-dashed border-border flex-1" />
                  <span className="text-2xl md:text-3xl font-bold text-primary">
                    $25<span className="text-base font-normal text-muted-foreground">/month</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
