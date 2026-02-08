import { Layers, Filter, Wand2, Zap, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Smart Categories',
    description: 'Automatically organize emails into custom categories based on sender, domain, or keywords.',
  },
  {
    icon: Filter,
    title: 'Rule-Based Sorting',
    description: 'Create powerful rules to route emails exactly where they belong. No manual sorting required.',
  },
  {
    icon: Wand2,
    title: 'AI Draft Replies',
    description: "Get intelligent draft responses for each category. Edit, approve, and send — you're always in control.",
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process hundreds of emails in seconds. Built for speed and efficiency from the ground up.',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays yours. We use enterprise-grade encryption and never sell your information.',
  },
  {
    icon: Clock,
    title: 'Save Hours Weekly',
    description: 'Reduce email time by up to 50%. Focus on what matters most to you and your business.',
  },
];

export function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      {/* Organic blob */}
      <div className="blob-decoration blob-teal w-72 h-72 bottom-10 left-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-card/60 border border-border/40 mb-6 animate-fade-in backdrop-blur-sm">
            <span className="text-sm font-medium text-accent">Features</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
            Everything you need
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            Powerful tools to manage your inbox efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group floating-card p-8 animate-fade-in"
              style={{ animationDelay: `${300 + index * 80}ms` }}
            >
              <div className="mb-5 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
