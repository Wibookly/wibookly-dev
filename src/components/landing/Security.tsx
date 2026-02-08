import { Shield, Key, Lock, CheckCircle2, Eye, Server, FileCheck } from 'lucide-react';

const securityFeatures = [
  {
    icon: Key,
    title: 'OAuth-based Access',
    description: 'We use industry-standard OAuth 2.0 for all email provider connections. Your credentials stay with Microsoft and Google — we never see them.',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/15',
  },
  {
    icon: Lock,
    title: 'No Password Storage',
    description: 'We never ask for or store your email password. Access is granted through secure tokens that can be revoked at any time from your email provider.',
    iconColor: 'text-accent-foreground',
    iconBg: 'bg-accent/20',
  },
  {
    icon: Shield,
    title: 'Enterprise-grade Encryption',
    description: 'All data is encrypted with 256-bit AES encryption at rest and TLS 1.3 in transit. Your emails and personal data are always protected.',
    iconColor: 'text-success',
    iconBg: 'bg-success/15',
  },
  {
    icon: Eye,
    title: 'Privacy by Design',
    description: 'We follow privacy-by-design principles. Your data is never sold, shared with third parties, or used for advertising purposes.',
    iconColor: 'text-warning',
    iconBg: 'bg-warning/15',
  },
  {
    icon: Server,
    title: 'Secure Infrastructure',
    description: 'Hosted on enterprise-grade cloud infrastructure with automatic failover, DDoS protection, and 99.9% uptime SLA.',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/15',
  },
  {
    icon: FileCheck,
    title: 'Regular Security Audits',
    description: 'Our systems undergo regular penetration testing and security audits by independent third-party firms to ensure the highest standards.',
    iconColor: 'text-success',
    iconBg: 'bg-success/15',
  },
];

const complianceBadges = [
  {
    name: 'SOC 2 Type II',
    description: 'Certified',
    icon: Shield,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    name: 'GDPR',
    description: 'Compliant',
    icon: FileCheck,
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    name: 'AES-256',
    description: 'Encryption',
    icon: Lock,
    color: 'text-accent-foreground',
    bg: 'bg-accent/10',
  },
  {
    name: 'ISO 27001',
    description: 'Standards',
    icon: Key,
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
];

export function Security() {
  return (
    <section id="security" className="py-24 md:py-36">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Dark security banner */}
          <div className="rounded-3xl bg-foreground text-background px-8 py-16 md:px-16 md:py-20 text-center mb-14 shadow-xl animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 mb-8">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight">
              Bank-level{' '}
              <span className="text-primary">security</span>{' '}
              for
              <br />
              your peace of mind
            </h2>
            <p className="mt-6 text-background/60 max-w-2xl mx-auto text-lg leading-relaxed">
              Your data security is our top priority. We use the same encryption standards trusted by financial institutions and healthcare organizations worldwide.
            </p>
          </div>

          {/* Compliance badges */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {complianceBadges.map((badge) => (
              <div
                key={badge.name}
                className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-card/80 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl ${badge.bg} flex items-center justify-center mb-4`}>
                  <badge.icon className={`w-7 h-7 ${badge.color}`} />
                </div>
                <p className="font-bold text-foreground text-base">{badge.name}</p>
                <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
              </div>
            ))}
          </div>

          {/* Security feature cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
            {securityFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="p-8 rounded-3xl bg-card/50 backdrop-blur-sm border border-card/80 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${300 + index * 80}ms` }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${feature.iconBg} mb-5`}>
                  <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Trust statement */}
          <div className="text-center animate-fade-in" style={{ animationDelay: '600ms' }}>
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/60 border border-primary/20 shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Trusted by businesses worldwide to protect their email communications</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
