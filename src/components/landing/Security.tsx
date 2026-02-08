import { Shield, Key, Lock, CheckCircle2 } from 'lucide-react';

const securityFeatures = [
  {
    icon: Key,
    title: 'OAuth-based Access',
    description: 'We use industry-standard OAuth 2.0. Your credentials stay with your provider.',
  },
  {
    icon: Lock,
    title: 'No Password Storage',
    description: 'We never ask for or store your email password. Ever.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-level encryption for all data in transit and at rest.',
  },
];

const securityChecks = [
  'SOC 2 Type II Compliant',
  'GDPR Compliant',
  '256-bit AES Encryption',
  'Regular Security Audits',
];

export function Security() {
  return (
    <section id="security" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-fade-in">
            <span className="text-sm font-medium text-primary">Security</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
            Your data is safe with us
          </h2>
          <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
            Security and privacy are built into everything we do
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {securityFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${300 + index * 100}ms` }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-6">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Security checks */}
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '600ms' }}>
          {securityChecks.map((check) => (
            <div
              key={check}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card border border-border shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{check}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
