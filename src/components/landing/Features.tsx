import { Layers, Filter, Wand2, Zap, Shield, Clock } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Smart Categories',
    description: 'Automatically organize emails into custom categories based on sender, domain, or keywords.'
  },
  {
    icon: Filter,
    title: 'Rule-Based Sorting',
    description: 'Create powerful rules to route emails exactly where they belong. No manual sorting required.'
  },
  {
    icon: Wand2,
    title: 'AI Draft Replies',
    description: "Get intelligent draft responses for each category. Edit, approve, and send — you're always in control."
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Process hundreds of emails in seconds. Built for speed and efficiency from the ground up.'
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays yours. We use enterprise-grade encryption and never sell your information.'
  },
  {
    icon: Clock,
    title: 'Save Hours Weekly',
    description: 'Reduce email time by up to 50%. Focus on what matters most to you and your business.'
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
            Everything you need
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Powerful tools to manage your inbox efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-7 rounded-2xl border border-border bg-card hover:border-primary/20 transition-all duration-300 hover:shadow-md"
            >
              <div className="mb-4 inline-flex items-center justify-center w-11 h-11 rounded-xl bg-secondary group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
              </div>
              <h3 className="text-base font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
