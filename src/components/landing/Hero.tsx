import { ArrowUpRight, Sparkles, Zap, Brain, Mail, Star, Cpu } from 'lucide-react';
import outlookLogo from '@/assets/outlook-logo.png';
import wibooklyLogo from '@/assets/wibookly-logo.png';

// Official Gmail logo SVG
const GmailIcon = () => (
  <svg viewBox="0 0 48 48" className="w-full h-full" aria-hidden="true">
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

      {/* Engine animation keyframes */}
      <style>{`
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg); }
          to   { transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg); }
        }
        @keyframes spin-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spin-ring-reverse {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
        @keyframes float-y {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes float-y-alt {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(8px); }
        }
        @keyframes energy-pulse {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(1.15); }
        }
        @keyframes dash-flow {
          from { stroke-dashoffset: 16; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes icon-breathe {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50%      { transform: scale(1.15); opacity: 1; }
        }
      `}</style>

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

          {/* ── Engine visual: Wibookly on top of Gmail & Outlook ── */}
          <div className="mt-14 flex flex-col items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
              Your AI sits on top of
            </span>

            <div className="relative mt-4" style={{ width: '340px', height: '200px' }}>

              {/* ── Spinning orbital rings around the center ── */}
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '50%', top: '42%',
                  width: '220px', height: '220px',
                  marginLeft: '-110px', marginTop: '-110px',
                  border: '1.5px dashed hsl(170 65% 30% / 0.2)',
                  borderRadius: '50%',
                  animation: 'spin-ring 12s linear infinite',
                }}
              />
              <div
                className="absolute pointer-events-none"
                style={{
                  left: '50%', top: '42%',
                  width: '280px', height: '280px',
                  marginLeft: '-140px', marginTop: '-140px',
                  border: '1px dashed hsl(210 70% 45% / 0.15)',
                  borderRadius: '50%',
                  animation: 'spin-ring-reverse 18s linear infinite',
                }}
              />

              {/* ── Orbiting particles ── */}
              {[
                { size: 6, radius: 110, duration: 8, delay: 0, color: 'hsl(170 65% 30%)' },
                { size: 5, radius: 110, duration: 8, delay: 4, color: 'hsl(210 70% 45%)' },
                { size: 4, radius: 140, duration: 14, delay: 0, color: 'hsl(170 65% 30%)' },
                { size: 5, radius: 140, duration: 14, delay: 7, color: 'hsl(210 70% 45%)' },
                { size: 3, radius: 140, duration: 14, delay: 10, color: 'hsl(155 50% 45%)' },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%', top: '42%',
                    width: 0, height: 0,
                    animation: `spin-ring ${p.duration}s linear infinite`,
                    animationDelay: `-${p.delay}s`,
                  }}
                >
                  <div
                    style={{
                      width: p.size,
                      height: p.size,
                      borderRadius: '50%',
                      background: p.color,
                      boxShadow: `0 0 8px ${p.color}`,
                      transform: `translateX(${p.radius}px)`,
                    }}
                  />
                </div>
              ))}

              {/* ── Energy pulse behind center ── */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: '50%', top: '42%',
                  width: '160px', height: '160px',
                  marginLeft: '-80px', marginTop: '-80px',
                  background: 'radial-gradient(circle, hsl(170 65% 30% / 0.15), transparent 70%)',
                  animation: 'energy-pulse 3s ease-in-out infinite',
                }}
              />

              {/* ── Wibookly center hub ── */}
              <div
                className="absolute z-20"
                style={{
                  left: '50%', top: '42%',
                  transform: 'translate(-50%, -50%)',
                  animation: 'float-y 4s ease-in-out infinite',
                }}
              >
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-card border-[3px] border-primary/40 flex items-center justify-center shadow-xl backdrop-blur-sm">
                  <img
                    src={wibooklyLogo}
                    alt="Wibookly"
                    className="h-18 md:h-22 w-auto drop-shadow-md"
                    style={{ height: '5.5rem' }}
                  />
                </div>
                <span className="block text-xs text-primary mt-1.5 text-center font-bold tracking-wide">AI-Powered</span>
              </div>

              {/* ── Floating superpower icons ── */}
              <div
                className="absolute z-30 w-8 h-8 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center"
                style={{
                  left: '50%', top: '2%',
                  marginLeft: '-16px',
                  animation: 'icon-breathe 2.5s ease-in-out infinite',
                }}
              >
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div
                className="absolute z-30 w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center"
                style={{
                  left: '12%', top: '30%',
                  animation: 'icon-breathe 3s ease-in-out infinite 0.5s',
                }}
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />
              </div>
              <div
                className="absolute z-30 w-7 h-7 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center"
                style={{
                  right: '12%', top: '30%',
                  animation: 'icon-breathe 3.2s ease-in-out infinite 1s',
                }}
              >
                <Mail className="w-3.5 h-3.5 text-accent" />
              </div>
              <div
                className="absolute z-30 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
                style={{
                  left: '20%', top: '8%',
                  animation: 'icon-breathe 3.8s ease-in-out infinite 1.5s',
                }}
              >
                <Star className="w-3 h-3 text-primary" />
              </div>
              <div
                className="absolute z-30 w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"
                style={{
                  right: '20%', top: '8%',
                  animation: 'icon-breathe 3.5s ease-in-out infinite 2s',
                }}
              >
                <Cpu className="w-3 h-3 text-primary" />
              </div>

              {/* ── Gmail provider ── */}
              <div
                className="absolute z-20"
                style={{
                  left: '8%', bottom: '0',
                  animation: 'float-y-alt 5s ease-in-out infinite',
                }}
              >
                <div className="w-18 h-18 md:w-20 md:h-20 rounded-2xl bg-card/90 border-2 border-border/50 flex items-center justify-center shadow-lg backdrop-blur-sm" style={{ width: '5rem', height: '5rem' }}>
                  <div className="w-10 h-10 md:w-11 md:h-11">
                    <GmailIcon />
                  </div>
                </div>
                <span className="block text-xs text-muted-foreground mt-1.5 text-center font-medium">Gmail</span>
                {/* Zap badge */}
                <div
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center"
                  style={{ animation: 'icon-breathe 2.8s ease-in-out infinite 0.3s' }}
                >
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>

              {/* ── Outlook provider ── */}
              <div
                className="absolute z-20"
                style={{
                  right: '8%', bottom: '0',
                  animation: 'float-y-alt 5s ease-in-out infinite 1.2s',
                }}
              >
                <div className="w-18 h-18 md:w-20 md:h-20 rounded-2xl bg-card/90 border-2 border-border/50 flex items-center justify-center shadow-lg backdrop-blur-sm" style={{ width: '5rem', height: '5rem' }}>
                  <img src={outlookLogo} alt="Outlook" className="w-11 h-11 md:w-12 md:h-12 object-contain" />
                </div>
                <span className="block text-xs text-muted-foreground mt-1.5 text-center font-medium">Outlook</span>
                {/* Sparkle badge */}
                <div
                  className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center"
                  style={{ animation: 'icon-breathe 3s ease-in-out infinite 0.7s' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>

              {/* ── Animated connector lines ── */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 340 200" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                {/* Left connector: center → Gmail */}
                <path
                  d="M 130 84 Q 90 100 68 130"
                  fill="none"
                  stroke="hsl(170 65% 30% / 0.3)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  style={{ animation: 'dash-flow 1.2s linear infinite' }}
                />
                {/* Right connector: center → Outlook */}
                <path
                  d="M 210 84 Q 250 100 272 130"
                  fill="none"
                  stroke="hsl(170 65% 30% / 0.3)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  style={{ animation: 'dash-flow 1.2s linear infinite', animationDelay: '-0.6s' }}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
