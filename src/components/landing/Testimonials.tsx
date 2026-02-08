import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "Wibookly cut my email time in half. The AI drafts are surprisingly accurate — I barely need to edit them before sending.",
    name: 'Sarah Chen',
    role: 'Marketing Director',
    company: 'TechFlow Inc.',
  },
  {
    quote: "I was paying for 4 different tools to manage my inbox. Wibookly replaced all of them and does a better job. Genuinely impressed.",
    name: 'Marcus Johnson',
    role: 'Founder & CEO',
    company: 'Elevate Studio',
  },
  {
    quote: "The smart categories feature is a game changer. My inbox went from 200+ unread to zero within the first week of using Wibookly.",
    name: 'Priya Patel',
    role: 'Operations Manager',
    company: 'GreenLeaf Partners',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-card/70 text-primary text-sm font-medium mb-4 border border-primary/20 shadow-sm animate-fade-in">
              Testimonials
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-fade-in text-foreground" style={{ animationDelay: '100ms' }}>
              What our users say
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              Join thousands of professionals who&apos;ve transformed their email workflow
            </p>
          </div>

          {/* Testimonial cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-border/30 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-foreground leading-relaxed mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}, {testimonial.company}</p>
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
