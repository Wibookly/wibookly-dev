import { ShieldCheck, Lock, Server, UserCheck } from 'lucide-react';

const securityFeatures = [
  {
    icon: ShieldCheck,
    title: 'SOC2 Type 1',
    description: "We've completed SOC 2 Type 1 examination, independently audited for security, availability, and confidentiality.",
  },
  {
    icon: Lock,
    title: 'Encryption',
    description: 'Your emails are encrypted in transit and at rest.',
  },
  {
    icon: Server,
    title: 'Enterprise-Grade Infrastructure',
    description: 'Built on secure cloud infrastructure with 99.9% uptime.',
  },
  {
    icon: UserCheck,
    title: 'Privacy First',
    description: 'We never train AI models on your data. Your information stays yours.',
  },
];

// Compliance badge component
function ComplianceBadge({ label, sublabel, variant }: { label: string; sublabel: string; variant: 'blue' | 'teal' | 'green' | 'accent' }) {
  const colors = {
    blue: 'border-primary/30 text-primary',
    teal: 'border-accent/30 text-accent',
    green: 'border-primary/30 text-primary',
    accent: 'border-accent/30 text-accent',
  };

  return (
    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-2 ${colors[variant]} bg-card flex flex-col items-center justify-center shadow-sm`}>
      <span className="text-[9px] md:text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{sublabel}</span>
      <span className="text-sm md:text-base font-bold">{label}</span>
      <span className="text-[8px] md:text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
        {variant === 'blue' ? 'TYPE 1' : variant === 'teal' ? 'CERTIFIED' : variant === 'green' ? '' : ''}
      </span>
    </div>
  );
}

export function Security() {
  return (
    <section id="security" className="py-24 md:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto rounded-3xl border border-border bg-card p-10 md:p-16">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              Bank-level <span className="text-primary">security</span> for
              <br />
              your peace of mind
            </h2>
          </div>

          {/* 4-column features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {securityFeatures.map((feature) => (
              <div key={feature.title} className="text-left">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Dotted separator */}
          <div className="border-t border-dashed border-border my-10" />

          {/* Compliance badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
            <ComplianceBadge label="SOC 2" sublabel="AICPA" variant="blue" />
            <ComplianceBadge label="CASA" sublabel="TIER 3" variant="teal" />
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-primary/30 bg-card flex flex-col items-center justify-center shadow-sm">
              <span className="text-xs md:text-sm font-bold text-primary">GDPR</span>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-[6px] text-accent">★</span>
                ))}
              </div>
            </div>
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-accent/30 bg-card flex flex-col items-center justify-center shadow-sm">
              <span className="text-xs md:text-sm font-bold text-accent">CCPA</span>
              <ShieldCheck className="w-3 h-3 text-accent mt-0.5" />
            </div>
          </div>

          {/* Tagline */}
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
              Secure. Private. Encrypted.
            </h3>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              With CASA Tier 3 compliance and industry-leading encryption, your emails stay private, secure, and protected — always.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
