import { Check } from 'lucide-react';
import wibooklyLogo from '@/assets/wibookly-logo.png';

const competitors = [
  {
    name: 'Fyxer.ai',
    price: 30,
    description: 'Email organizer',
    color: 'bg-purple-100 text-purple-700',
    icon: '🔮',
  },
  {
    name: 'ChatGPT',
    price: 23,
    description: 'Answers many general questions',
    color: 'bg-emerald-100 text-emerald-700',
    icon: '🤖',
  },
  {
    name: 'Calendly',
    price: 10,
    description: 'Scheduling tool',
    color: 'bg-blue-100 text-blue-700',
    icon: '📅',
  },
  {
    name: 'Superhuman',
    price: 30,
    description: 'Productivity-focused email inbox',
    color: 'bg-violet-100 text-violet-700',
    icon: '⚡',
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
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Replace 4 tools with one
            <br />
            intelligent assistant
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop paying for multiple subscriptions. WeBookly consolidates your email workflow into one powerful platform.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left — Competitors */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-border">
                <div className="space-y-4">
                  {competitors.map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border bg-secondary"
                    >
                      <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center text-lg shadow-sm">
                        {tool.icon}
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

                {/* Total */}
                <div className="mt-6 pt-6 border-t border-dashed border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">In total</span>
                    <span className="text-xl font-bold text-foreground">${totalCompetitor}/month</span>
                  </div>
                </div>
              </div>

              {/* Center VS divider (mobile: horizontal, desktop: overlaid) */}
              <div className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 items-center z-10 pointer-events-none" style={{ position: 'absolute' }}>
                {/* Handled via relative parent below */}
              </div>

              {/* Right — WeBookly */}
              <div className="p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <img src={wibooklyLogo} alt="WeBookly" className="h-8 w-auto" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground">WeBookly</div>
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

                {/* Total */}
                <div className="mt-6 pt-6 border-t border-dashed border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">In total</span>
                    <span className="text-xl font-bold text-primary">$20/month</span>
                  </div>
                </div>
              </div>
            </div>

            {/* VS badge overlay */}
            <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ position: 'relative' }}>
              {/* VS is positioned via the grid split */}
            </div>
          </div>

          {/* VS pill — sits centered between the two columns */}
          <div className="hidden md:flex justify-center -mt-[1px]">
            {/* Positioned above via absolute in a relative wrapper — simplified to a clean visual */}
          </div>
        </div>
      </div>
    </section>
  );
}
