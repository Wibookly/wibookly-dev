import { Layers, Filter, Wand2, Zap, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Smart Categories',
    description: 'Automatically organize emails into custom categories based on sender, domain, or keywords.',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/15',
  },
  {
    icon: Filter,
    title: 'Rule-Based Sorting',
    description: 'Create powerful rules to route emails exactly where they belong. No manual sorting required.',
    iconColor: 'text-accent-foreground',
    iconBg: 'bg-accent/20',
  },
  {
    icon: Wand2,
    title: 'AI Draft Replies',
    description: "Get intelligent draft responses for each category. Edit, approve, and send — you're always in control.",
    iconColor: 'text-success',
    iconBg: 'bg-success/15',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process hundreds of emails in seconds. Built for speed and efficiency from the ground up.',
    iconColor: 'text-warning',
    iconBg: 'bg-warning/15',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays yours. We use enterprise-grade encryption and never sell your information.',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/15',
  },
  {
    icon: Clock,
    title: 'Save Hours Weekly',
    description: 'Reduce email time by up to 50%. Focus on what matters most to you and your business.',
    iconColor: 'text-success',
    iconBg: 'bg-success/15',
  }
];

export function Features() {
  return (
    <section id="features" className="py-24 md:py-36">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full bg-card/70 text-primary text-sm font-medium mb-4 border border-primary/20 shadow-sm animate-fade-in">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight animate-fade-in text-foreground" style={{ animationDelay: '100ms' }}>
            Everything you need
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            Powerful tools to manage your inbox efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-8 rounded-3xl border border-card/80 bg-card/50 backdrop-blur-sm shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <div className={`mb-5 inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.iconBg} group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
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
