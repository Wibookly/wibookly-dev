import { Check } from 'lucide-react';
import wibooklyLogo from '@/assets/wibookly-logo.png';
import chatgptLogo from '@/assets/chatgpt-logo.jpeg';
import calendlyLogo from '@/assets/calendly-logo.webp';
import superhumanLogo from '@/assets/superhuman-logo.webp';
import fyxerLogo from '@/assets/fyxer-logo.png';

const competitors = [
  {
    name: 'Fyxer.ai',
    price: 30,
    description: 'Email organizer',
    logo: fyxerLogo,
  },
  {
    name: 'ChatGPT',
    price: 23,
    description: 'Answers many general questions',
    logo: chatgptLogo,
  },
  {
    name: 'Calendly',
    price: 10,
    description: 'Scheduling tool',
    logo: calendlyLogo,
  },
  {
    name: 'Superhuman',
    price: 30,
    description: 'Productivity-focused email inbox',
    logo: superhumanLogo,
  },
];

const wibooklyBenefits = [
  { text: 'Full-stack AI Chief of Staff', replaces: 'Replaces Fyxer.ai' },
  { text: 'Answers any question, even about your business', replaces: 'Replaces ChatGPT' },
  { text: 'Seamless scheduling without switching apps', replaces: 'Replaces Calendly' },
  { text: 'AI-native, productivity-focused email inbox', replaces: 'Replaces Superhuman' },
];

const totalCompetitor = competitors.reduce((sum, c) => sum + c.price, 0);

export function ReplaceTools() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="blob-decoration blob-blue w-80 h-80 -bottom-20 -right-20" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Replace 4 tools with one
            <br />
            <span className="text-primary">intelligent assistant</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop paying for multiple subscriptions. Wibookly consolidates your email workflow into one powerful platform.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-panel overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left — Competitors */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-border/40">
                <div className="space-y-4">
                  {competitors.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/40 border border-border/30"
                    >
                      <div className="w-10 h-10 rounded-xl bg-card/80 border border-border/30 flex items-center justify-center shadow-sm overflow-hidden">
                        <img src={tool.logo} alt={tool.name} className="w-7 h-7 object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-foreground">{tool.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{tool.description}</div>
                      </div>
                      <div className="text-sm font-semibold text-foreground whitespace-nowrap">
                        ${tool.price}/mo
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-dashed border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">In total</span>
                    <span className="text-xl font-bold text-foreground">${totalCompetitor}/month</span>
                  </div>
                </div>
              </div>

              {/* Right — Wibookly */}
              <div className="p-8 flex flex-col bg-primary/[0.04]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <img src={wibooklyLogo} alt="Wibookly" className="h-12 w-auto" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground text-lg">Wibookly</div>
                    <div className="text-xs text-muted-foreground">All-in-one AI email assistant</div>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  {wibooklyBenefits.map((benefit) => (
                    <div key={benefit.text} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{benefit.text}</div>
                        <div className="text-xs text-muted-foreground">{benefit.replaces}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-dashed border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">In total</span>
                    <span className="text-xl font-bold text-primary">$20/month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
