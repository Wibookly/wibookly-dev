import { ArrowRight } from 'lucide-react';
import mockupAiDraft from '@/assets/mockup-ai-draft.png';
import mockupCategories from '@/assets/mockup-categories.png';
import mockupActivity from '@/assets/mockup-activity.png';
import mockupInbox from '@/assets/mockup-inbox.png';

const features = [
  {
    badge: 'AI Drafts',
    title: 'Write less, achieve more',
    subtitle: 'AI-powered email drafts',
    description: 'Get intelligent draft responses for each category. Wibookly learns your tone and style to craft perfect replies — you just review and send.',
    image: mockupAiDraft,
  },
  {
    badge: 'Smart Categories',
    title: 'Organize without effort',
    subtitle: 'Automatic email sorting',
    description: 'Automatically categorize every incoming email by sender, domain, or keywords. Your inbox stays clean without lifting a finger.',
    image: mockupCategories,
  },
  {
    badge: 'AI Dashboard',
    title: 'See everything at a glance',
    subtitle: 'AI Activity Dashboard',
    description: 'Track every AI action in real-time — drafts created, emails sorted, calendar events scheduled. Full transparency into what your assistant does.',
    image: mockupActivity,
  },
  {
    badge: 'Smart Inbox',
    title: 'Focus on what matters',
    subtitle: 'Priority-first inbox',
    description: 'Surface the emails that need your attention first. Low-priority messages are sorted away so you can focus on high-impact work.',
    image: mockupInbox,
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-card/70 text-primary text-sm font-medium mb-4 border border-primary/20 shadow-sm animate-fade-in">
              Features
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-fade-in text-foreground" style={{ animationDelay: '100ms' }}>
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              Powerful tools to manage your inbox efficiently
            </p>
          </div>

          {/* Alternating feature blocks */}
          <div className="space-y-16 md:space-y-24">
            {features.map((feature, index) => {
              const isReversed = index % 2 === 1;
              return (
                <div
                  key={feature.badge}
                  className="animate-fade-in"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className={`grid md:grid-cols-2 gap-10 md:gap-14 items-center ${isReversed ? 'md:direction-rtl' : ''}`}>
                    {/* Text */}
                    <div className={`space-y-5 ${isReversed ? 'md:order-2' : ''}`}>
                      <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary uppercase tracking-wider">
                        {feature.badge}
                      </span>
                      <h3 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                        {feature.title}
                      </h3>
                      <p className="text-sm font-medium text-primary">{feature.subtitle}</p>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      <a
                        href="#"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
                      >
                        Try it free
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </div>

                    {/* Image */}
                    <div className={`${isReversed ? 'md:order-1' : ''}`}>
                      <div className="relative">
                        <div className="absolute inset-0 -m-3 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-success/10 blur-xl" />
                        <div className="relative rounded-2xl border border-border/30 shadow-xl overflow-hidden bg-card/40 backdrop-blur-sm p-2">
                          <img
                            src={feature.image}
                            alt={feature.subtitle}
                            className="w-full rounded-xl"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
