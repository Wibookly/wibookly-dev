import { ArrowUpRight } from 'lucide-react';
import outlookLogo from '@/assets/outlook-logo.png';

// Official Gmail logo SVG
const GmailIcon = () => (
  <svg viewBox="0 0 48 48" className="w-7 h-7" aria-hidden="true">
    <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
    <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
    <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
    <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z" />
    <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z" />
  </svg>
);

interface HeroProps {
  onGetStartedClick: () => void;
}

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
            Your AI email assistant that organizes, drafts, and sends — so you can focus on what matters.
          </p>

          {/* CTA Button — large blue/green pill with arrow circle */}
          <div className="mt-10 flex justify-center">
            <button
              onClick={onGetStartedClick}
              className="group flex items-center gap-4 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground pl-8 pr-2 py-2 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Get started for free
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
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
              <div className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center shadow-sm overflow-hidden">
                <img src={outlookLogo} alt="Outlook" className="w-7 h-7 object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
