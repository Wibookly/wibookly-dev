import { Mail, Layers, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Mail,
    title: 'Connect Your Email',
    description: 'Securely connect Gmail, Outlook, or IMAP accounts. Your inbox stays exactly where it is — Wibookly simply understands it.',
  },
  {
    icon: Layers,
    title: 'Customize Your Categories',
    description: 'Create natural, intelligent categories that match how you think — not rigid rules.',
  },
  {
    icon: Sparkles,
    title: 'Set Your AI Intelligence',
    description: 'Teach Wibookly what matters most. It adapts to your priorities, tone, and workflow over time.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground animate-fade-in leading-tight">
            How Wibookly Works
          </h2>
          <p className="mt-5 text-lg text-muted-foreground animate-fade-in leading-relaxed" style={{ animationDelay: '100ms' }}>
            Three simple steps. Designed to feel invisible.
          </p>
        </div>

        {/* Flowing vertical steps */}
        <div className="max-w-xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative pl-16 pb-14 last:pb-0 animate-fade-in"
              style={{ animationDelay: `${200 + index * 120}ms` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[1.375rem] top-12 bottom-0 w-px bg-gradient-to-b from-primary/30 to-transparent" />
              )}

              {/* Icon */}
              <div className="absolute left-0 top-0 w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                <step.icon className="w-5 h-5 text-primary" />
              </div>

              {/* Text */}
              <h3 className="text-xl font-semibold text-foreground mb-2">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
