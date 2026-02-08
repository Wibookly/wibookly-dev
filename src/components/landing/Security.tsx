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

// Compliance badge SVGs — professional styled icons
function SOC2Badge() {
  return (
    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-primary/25 bg-card/80 flex flex-col items-center justify-center shadow-sm backdrop-blur-sm">
      <svg viewBox="0 0 32 32" className="w-7 h-7 mb-1" fill="none">
        <path d="M16 2L4 7v8c0 8.4 5.1 16.3 12 18 6.9-1.7 12-9.6 12-18V7L16 2z" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
        <path d="M11 16l3.5 3.5L22 12" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">AICPA</span>
      <span className="text-sm font-bold text-primary">SOC 2</span>
      <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">TYPE 1</span>
    </div>
  );
}

function CASABadge() {
  return (
    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-primary/25 bg-card/80 flex flex-col items-center justify-center shadow-sm backdrop-blur-sm">
      <svg viewBox="0 0 32 32" className="w-7 h-7 mb-1" fill="none">
        <rect x="4" y="8" width="24" height="16" rx="3" fill="hsl(var(--primary) / 0.1)" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
        <path d="M4 13h24" stroke="hsl(var(--primary))" strokeWidth="1.5"/>
        <rect x="7" y="18" width="6" height="3" rx="1" fill="hsl(var(--primary) / 0.2)" stroke="hsl(var(--primary))" strokeWidth="1"/>
      </svg>
      <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">TIER 3</span>
      <span className="text-sm font-bold text-primary">CASA</span>
      <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">CERTIFIED</span>
    </div>
  );
}

function GDPRBadge() {
  return (
    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-accent/25 bg-card/80 flex flex-col items-center justify-center shadow-sm backdrop-blur-sm">
      <svg viewBox="0 0 32 32" className="w-7 h-7 mb-1" fill="none">
        {/* EU stars circle */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          const cx = 16 + 11 * Math.cos(rad - Math.PI / 2);
          const cy = 16 + 11 * Math.sin(rad - Math.PI / 2);
          return <circle key={angle} cx={cx} cy={cy} r="1" fill="hsl(var(--accent))" />;
        })}
        {/* Lock icon center */}
        <rect x="11" y="16" width="10" height="8" rx="2" fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="1.5"/>
        <path d="M13.5 16V13c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v3" stroke="hsl(var(--accent))" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="16" cy="20" r="1" fill="hsl(var(--accent))"/>
      </svg>
      <span className="text-sm font-bold text-accent">GDPR</span>
      <div className="flex gap-0.5 mt-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="text-[8px] text-accent">★</span>
        ))}
      </div>
    </div>
  );
}

function CCPABadge() {
  return (
    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-2 border-accent/25 bg-card/80 flex flex-col items-center justify-center shadow-sm backdrop-blur-sm">
      <svg viewBox="0 0 32 32" className="w-7 h-7 mb-1" fill="none">
        <path d="M16 2L4 7v8c0 8.4 5.1 16.3 12 18 6.9-1.7 12-9.6 12-18V7L16 2z" fill="hsl(var(--accent) / 0.1)" stroke="hsl(var(--accent))" strokeWidth="1.5"/>
        <path d="M11 16l3.5 3.5L22 12" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-sm font-bold text-accent">CCPA</span>
      <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">COMPLIANT</span>
    </div>
  );
}

export function Security() {
  return (
    <section id="security" className="relative py-24 md:py-32">
      <div className="blob-decoration blob-green w-60 h-60 bottom-10 -left-10" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto glass-panel p-10 md:p-16">
          {/* Heading — centered */}
          <div className="text-center mb-12">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Bank-level <span className="text-primary">security</span> for
              <br />
              your peace of mind
            </h2>
          </div>

          {/* 4-column features */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {securityFeatures.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Dotted separator */}
          <div className="border-t border-dashed border-border/40 my-10" />

          {/* Compliance badges — centered */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mb-8">
            <SOC2Badge />
            <CASABadge />
            <GDPRBadge />
            <CCPABadge />
          </div>

          {/* Tagline — centered */}
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
