import { Shield, Key, Lock, CheckCircle2 } from 'lucide-react';

const securityFeatures = [
  {
    icon: Key,
    title: 'OAuth-based Access',
    description: 'We use industry-standard OAuth 2.0. Your credentials stay with Microsoft.',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/15',
  },
  {
    icon: Lock,
    title: 'No Password Storage',
    description: 'We never ask for or store your email password. Ever.',
    iconColor: 'text-accent-foreground',
    iconBg: 'bg-accent/20',
  },
  {
    icon: Shield,
    title: 'Enterprise-grade Security',
    description: 'Bank-level encryption for all data in transit and at rest.',
    iconColor: 'text-success',
    iconBg: 'bg-success/15',
  }
];

const securityChecks = [
  'SOC 2 Type II Compliant',
  'GDPR Compliant',
  '256-bit AES Encryption',
  'Regular Security Audits'
];

export function Security() {
  return (
    <section id="security" className="py-24 md:py-36">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          {/* Dark security banner */}
          <div className="rounded-3xl bg-foreground text-background px-8 py-16 md:px-16 md:py-20 text-center mb-12 shadow-xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
              Bank-level{' '}
              <span className="text-primary">security</span>{' '}
              for
              <br />
              your peace of mind
            </h2>
            <p className="mt-6 text-background/60 max-w-xl mx-auto text-lg leading-relaxed">
              Security and privacy are built into everything we do
            </p>
          </div>

          {/* Security feature cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="text-center p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-card/80 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${feature.iconBg} mb-6`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Security checks */}
          <div className="flex flex-wrap justify-center gap-3 animate-fade-in" style={{ animationDelay: '600ms' }}>
            {securityChecks.map((check) => (
              <div
                key={check}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/60 border border-primary/20 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{check}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
