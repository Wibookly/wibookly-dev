import { Lock, KeyRound, Users, ShieldCheck, EyeOff } from 'lucide-react';

const securityPoints = [
  { icon: Lock, text: 'Encrypted data handling' },
  { icon: KeyRound, text: 'Secure email connections (OAuth)' },
  { icon: Users, text: 'Role-based access controls' },
  { icon: ShieldCheck, text: 'GDPR-aligned data practices' },
  { icon: EyeOff, text: 'Your data is never sold or shared' },
];

export function Security() {
  return (
    <section id="security" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14 animate-fade-in">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-tight">
              Built with Privacy
              <br />
              <span className="text-primary">and Trust at the Core</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Wibookly is designed with modern security principles — without loud or intimidating visuals.
            </p>
          </div>

          {/* Security points — flowing list */}
          <div className="space-y-1 animate-fade-in" style={{ animationDelay: '150ms' }}>
            {securityPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center gap-4 py-4 border-b border-border/10 last:border-b-0"
              >
                <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center shrink-0">
                  <point.icon className="w-4 h-4 text-foreground/50" />
                </div>
                <p className="text-foreground/85 leading-relaxed">{point.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
