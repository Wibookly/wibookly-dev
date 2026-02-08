import { Shield, Lock, Eye, Server, CheckCircle2 } from 'lucide-react';

const securityCards = [
  {
    icon: Shield,
    title: 'SOC 2 Type II',
    description: 'Audited and certified to meet the highest standards for data security, availability, and confidentiality.',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/20',
  },
  {
    icon: Lock,
    title: 'End-to-End Encryption',
    description: 'All data encrypted with AES-256 at rest and TLS 1.3 in transit. Your emails are protected at every step.',
    iconColor: 'text-success',
    iconBg: 'bg-success/20',
  },
  {
    icon: Server,
    title: 'Enterprise Infrastructure',
    description: 'Hosted on enterprise-grade cloud infrastructure with automatic failover, DDoS protection, and 99.9% uptime SLA.',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/20',
  },
  {
    icon: Eye,
    title: 'Privacy First',
    description: 'Your data is never sold, shared with third parties, or used for advertising. We follow privacy-by-design principles.',
    iconColor: 'text-success',
    iconBg: 'bg-success/20',
  },
];

const complianceBadges = [
  { name: 'SOC 2', label: 'Type II Certified' },
  { name: 'GDPR', label: 'Compliant' },
  { name: 'AES-256', label: 'Encryption' },
  { name: 'ISO 27001', label: 'Standards' },
  { name: 'OAuth 2.0', label: 'Secure Access' },
  { name: 'CCPA', label: 'Compliant' },
];

export function Security() {
  return (
    <section id="security" className="py-20 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          {/* Dark banner */}
          <div className="rounded-3xl bg-foreground overflow-hidden shadow-2xl animate-fade-in">
            <div className="px-8 py-16 md:px-16 md:py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-6">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-background leading-tight">
                Bank-level <span className="text-primary">security</span>
                <br />
                for your peace of mind
              </h2>
              <p className="mt-5 text-background/60 max-w-2xl mx-auto text-lg leading-relaxed">
                Your data security is our top priority. We use the same encryption standards trusted by financial institutions worldwide.
              </p>
            </div>

            {/* Security cards inside the dark banner */}
            <div className="grid md:grid-cols-2 gap-4 px-8 pb-12 md:px-16 md:pb-16">
              {securityCards.map((card, index) => (
                <div
                  key={card.title}
                  className="p-6 rounded-2xl bg-background/10 border border-background/10 hover:bg-background/15 transition-colors animate-fade-in"
                  style={{ animationDelay: `${200 + index * 80}ms` }}
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${card.iconBg} mb-4`}>
                    <card.icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-background mb-2">{card.title}</h3>
                  <p className="text-sm text-background/60 leading-relaxed">{card.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed statement below */}
          <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: '400ms' }}>
            <p className="text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              We use industry-standard OAuth 2.0 for all email provider connections — your credentials stay with Microsoft and Google. We never ask for or store your email password. Access tokens can be revoked at any time from your email provider settings.
            </p>
          </div>

          {/* Compliance badges row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-8 animate-fade-in" style={{ animationDelay: '500ms' }}>
            {complianceBadges.map((badge) => (
              <div
                key={badge.name}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-card/60 border border-border/30 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="text-sm font-semibold text-foreground">{badge.name}</span>
                <span className="text-xs text-muted-foreground">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
