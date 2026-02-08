import { Mail, FolderOpen, Sparkles } from 'lucide-react';

const steps = [
  {
    icon: Mail,
    step: '01',
    title: 'Connect Outlook',
    description: 'Securely connect your Microsoft Outlook account with OAuth. We never see your password.'
  },
  {
    icon: FolderOpen,
    step: '02',
    title: 'Customize Categories',
    description: 'Create custom categories and rules to automatically sort incoming emails.'
  },
  {
    icon: Sparkles,
    step: '03',
    title: 'Review AI Drafts',
    description: 'Let AI generate draft replies for each category. Review and send when ready.'
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Three simple steps to transform your email workflow
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.title} className="relative group">
              <div className="bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-md transition-all duration-300">
                <div className="text-xs font-mono text-muted-foreground mb-4">{step.step}</div>
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary mb-5 group-hover:bg-primary/10 transition-colors">
                  <step.icon className="w-6 h-6 text-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
