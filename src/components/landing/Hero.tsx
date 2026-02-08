import { ArrowUpRight } from 'lucide-react';

interface HeroProps {
  onGetStartedClick: () => void;
}

// Gmail icon
const GmailIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
    <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6z" fill="#F6F6F6"/>
    <path d="M2 6l10 7 10-7" fill="none" stroke="#D94F4F" strokeWidth="1.5"/>
    <path d="M22 6l-10 7L2 6" fill="none"/>
    <path d="M2 6v12l7-7" fill="#E66060"/>
    <path d="M22 6v12l-7-7" fill="#E66060"/>
    <path d="M2 18l7-7 3 2 3-2 7 7" fill="#D94F4F"/>
    <path d="M2 6l10 7 10-7v12H2z" fill="none" stroke="#D94F4F" strokeWidth="0"/>
    <rect x="1" y="4" width="22" height="16" rx="2" fill="none" stroke="#D94F4F" strokeWidth="1.2"/>
    <path d="M2 5l10 7.5L22 5" stroke="#D94F4F" strokeWidth="1.2" fill="none"/>
  </svg>
);

// Outlook icon
const OutlookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" aria-hidden="true">
    <rect x="7" y="2" width="15" height="20" rx="1.5" fill="#1A73E8" opacity="0.15"/>
    <rect x="7" y="2" width="15" height="20" rx="1.5" fill="none" stroke="#1A73E8" strokeWidth="1"/>
    <rect x="2" y="5" width="12" height="14" rx="1" fill="#0078D4"/>
    <ellipse cx="8" cy="12" rx="3.5" ry="4" fill="none" stroke="white" strokeWidth="1.5"/>
  </svg>
);

export function Hero({ onGetStartedClick }: HeroProps) {
  return (
    <section className="pt-32 pb-24 md:pt-40 md:pb-32 bg-secondary overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto text-center">
          {/* Headline — large serif */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.08] text-foreground"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            Emails so good,
            <br />
            you just press send!
          </h1>

          {/* Sub-headline */}
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            WeBookly organizes your inbox, drafts responses and reacts to your emails with AI workflows.
          </p>

          {/* CTA Button — large dark pill with arrow circle */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={onGetStartedClick}
              className="group flex items-center gap-4 rounded-full bg-foreground text-background pl-8 pr-2 py-2 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Get started for free
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-background text-foreground transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </button>
          </div>

          {/* Provider line */}
          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span>WeBookly sits on top of</span>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center shadow-sm">
                <GmailIcon />
              </div>
              <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center shadow-sm">
                <OutlookIcon />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
