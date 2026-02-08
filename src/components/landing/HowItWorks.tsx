import { Mail, FolderOpen, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Mail,
    step: '01',
    title: 'Connect Your Email',
    description: 'Securely connect your Google or Microsoft account with OAuth 2.0. We never see your password.',
  },
  {
    icon: FolderOpen,
    step: '02',
    title: 'Customize Categories',
    description: 'Create custom categories and rules to automatically sort incoming emails exactly how you want.',
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Review AI Drafts',
    description: 'Let AI generate intelligent draft replies for each category. Review, edit, and send when ready.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <span className="text-sm font-medium text-primary">Simple Setup</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
            Up and running in minutes
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            Three simple steps to transform your email workflow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative group animate-fade-in"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <div className="relative bg-card rounded-2xl p-8 border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[image:var(--gradient-primary)] text-white flex items-center justify-center text-sm font-bold shadow-md">
                  {step.step}
                </div>
                
                <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-secondary mb-6 group-hover:bg-primary/10 transition-colors">
                  <step.icon className="w-7 h-7 text-foreground group-hover:text-primary transition-colors" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
