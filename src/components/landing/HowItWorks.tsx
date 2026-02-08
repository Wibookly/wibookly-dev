import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import mockupIntegrations from '@/assets/mockup-integrations.png';
import mockupCategories from '@/assets/mockup-categories.png';
import mockupAiDraft from '@/assets/mockup-ai-draft.png';

const steps = [
  {
    step: '01',
    title: 'Connect your email',
    description: 'Securely connect your Microsoft Outlook or Gmail account with OAuth. We never see your password.',
    badge: 'Takes 1 min',
    image: mockupIntegrations,
  },
  {
    step: '02',
    title: 'Customize Categories',
    description: 'Create custom categories and rules to automatically sort and organize all your incoming emails.',
    badge: 'Takes 5 min',
    image: mockupCategories,
  },
  {
    step: '03',
    title: 'Review and send',
    description: 'Configure AI to generate smart draft replies, auto-respond, and manage your calendar seamlessly.',
    badge: 'Save 2h a day',
    image: mockupAiDraft,
  },
];

interface HowItWorksProps {
  onGetStartedClick?: () => void;
}

export function HowItWorks({ onGetStartedClick }: HowItWorksProps) {
  return (
    <section id="how-it-works" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-card/70 text-primary text-sm font-medium mb-4 border border-primary/20 shadow-sm animate-fade-in">
              Simple Setup
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-fade-in text-foreground leading-tight" style={{ animationDelay: '100ms' }}>
              Reclaim <span className="text-primary">90%</span> of your
              <br />
              email time
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '200ms' }}>
              Watch how Wibookly transforms a chaotic inbox into an organized, productive workspace
            </p>
            {onGetStartedClick && (
              <div className="mt-6 animate-fade-in" style={{ animationDelay: '250ms' }}>
                <Button
                  size="lg"
                  className="group rounded-full px-8 py-6 text-base font-semibold shadow-lg"
                  onClick={onGetStartedClick}
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            )}
          </div>

          {/* Step Cards */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="rounded-3xl bg-card/50 backdrop-blur-sm border border-border/30 shadow-lg overflow-hidden animate-fade-in hover:shadow-xl transition-shadow"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Text Content */}
                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-md">
                        {step.step}
                      </span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-xs font-medium text-success">
                        <Clock className="w-3 h-3" />
                        {step.badge}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {/* Image */}
                  <div className="bg-gradient-to-br from-primary/5 to-success/5 p-6 flex items-center justify-center">
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full rounded-xl shadow-md"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
