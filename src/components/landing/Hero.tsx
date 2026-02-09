import { ArrowUpRight, Sparkles, Zap, Brain, Mail } from 'lucide-react';
import outlookLogo from '@/assets/outlook-logo.png';
import wibooklyLogo from '@/assets/wibookly-logo.png';

// Official Gmail logo SVG
const GmailIcon = () => (
  <svg viewBox="0 0 48 48" className="w-8 h-8" aria-hidden="true">
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
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
      {/* Organic blob decorations */}
      <div className="blob-decoration blob-green w-96 h-96 -top-20 -left-32" />
      <div className="blob-decoration blob-blue w-80 h-80 top-20 -right-20" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            <span className="text-foreground">Your inbox, handled.</span>
            <br />
            <span className="text-primary">Your focus, reclaimed.</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Wibookly reads, categorizes, drafts, and sends your emails — so you can focus on what really matters.
          </p>

          <div className="mt-10 flex justify-center">
            <button
              onClick={onGetStartedClick}
              className="group flex items-center gap-4 rounded-full bg-[image:var(--gradient-primary)] text-primary-foreground pl-8 pr-2 py-2 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              Get started
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-foreground text-primary transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="w-5 h-5" />
              </span>
            </button>
          </div>

          {/* ── Superpower visual: Wibookly on top of Gmail & Outlook ── */}
          <div className="mt-14 flex flex-col items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
              Your AI sits on top of
            </span>

            <div className="relative mt-2">
              {/* Glowing ring behind the whole stack */}
              <div className="absolute inset-0 -m-6 rounded-full bg-primary/5 blur-2xl animate-pulse pointer-events-none" />

              {/* Email provider bubbles */}
              <div className="relative flex items-end justify-center gap-6">
                {/* Gmail bubble */}
                <div className="relative group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-card/90 border-2 border-border/50 flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                    <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
                      <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden="true">
                        <path fill="#4caf50" d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z" />
                        <path fill="#1e88e5" d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z" />
                        <polygon fill="#e53935" points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17" />
                        <path fill="#c62828" d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z" />
                        <path fill="#fbc02d" d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z" />
                      </svg>
                    </div>
                  </div>
                  <span className="block text-xs text-muted-foreground mt-2 text-center font-medium">Gmail</span>

                  {/* Floating superpower icon */}
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
                    <Zap className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>

                {/* Wibookly logo — elevated above both */}
                <div className="relative -mb-2 z-10 group">
                  {/* Glow effect */}
                  <div className="absolute inset-0 -m-3 rounded-full bg-primary/10 blur-xl animate-pulse pointer-events-none" style={{ animationDuration: '2s' }} />

                  <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-card border-[3px] border-primary/40 flex items-center justify-center shadow-xl backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                    <img
                      src={wibooklyLogo}
                      alt="Wibookly"
                      className="h-20 md:h-24 w-auto drop-shadow-md"
                    />
                  </div>

                  {/* Sparkle decorations */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center animate-bounce" style={{ animationDuration: '2.5s' }}>
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center animate-bounce" style={{ animationDuration: '3.5s' }}>
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center animate-bounce" style={{ animationDuration: '4s' }}>
                    <Mail className="w-3.5 h-3.5 text-accent" />
                  </div>

                  <span className="block text-xs text-primary mt-2 text-center font-bold tracking-wide">AI-Powered</span>
                </div>

                {/* Outlook bubble */}
                <div className="relative group">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-card/90 border-2 border-border/50 flex items-center justify-center shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
                    <img src={outlookLogo} alt="Outlook" className="w-12 h-12 md:w-14 md:h-14 object-contain" />
                  </div>
                  <span className="block text-xs text-muted-foreground mt-2 text-center font-medium">Outlook</span>

                  {/* Floating superpower icon */}
                  <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center animate-bounce" style={{ animationDuration: '3.2s' }}>
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                  </div>
                </div>
              </div>

              {/* Connector lines from Wibookly to email providers */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                {/* Left connector: Wibookly center to Gmail center */}
                <line x1="115" y1="80" x2="60" y2="60" stroke="hsl(170 65% 30% / 0.25)" strokeWidth="2" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" values="8;0" dur="1.5s" repeatCount="indefinite" />
                </line>
                {/* Right connector: Wibookly center to Outlook center */}
                <line x1="205" y1="80" x2="260" y2="60" stroke="hsl(170 65% 30% / 0.25)" strokeWidth="2" strokeDasharray="4 4">
                  <animate attributeName="stroke-dashoffset" values="8;0" dur="1.5s" repeatCount="indefinite" />
                </line>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
