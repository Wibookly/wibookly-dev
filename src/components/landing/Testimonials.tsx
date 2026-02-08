const testimonials = [
  {
    quote: "Wibookly cut my email time in half. The AI drafts are surprisingly accurate — I barely need to edit them before sending.",
    name: 'Sarah Chen',
    role: 'Marketing Director, TechFlow Inc.',
  },
  {
    quote: "I was paying for 4 different tools to manage my inbox. Wibookly replaced all of them and does a better job.",
    name: 'Marcus Johnson',
    role: 'Founder & CEO, Elevate Studio',
  },
  {
    quote: "The smart categories feature is a game changer. My inbox went from 200+ unread to zero within the first week.",
    name: 'Priya Patel',
    role: 'Operations Manager, GreenLeaf Partners',
  },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground animate-fade-in leading-tight">
              What Our Users Say
            </h2>
          </div>

          {/* Flowing testimonials */}
          <div className="space-y-10">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="animate-fade-in"
                style={{ animationDelay: `${150 + index * 100}ms` }}
              >
                <blockquote className="text-lg text-foreground/85 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="mt-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
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
