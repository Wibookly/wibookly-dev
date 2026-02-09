import { ArrowUpRight, Sparkles, Zap, Brain, Mail, Star, Cpu, Settings } from 'lucide-react';
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
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spin-ccw {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes float-alt {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(6px); }
        }
        @keyframes energy-ring {
          0%, 100% { opacity: 0.12; transform: scale(1); }
          50%      { opacity: 0.3; transform: scale(1.08); }
        }
        @keyframes dash-flow {
          from { stroke-dashoffset: 16; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50%      { transform: scale(1.12); opacity: 1; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px hsl(170 65% 30% / 0.1), 0 0 60px hsl(170 65% 30% / 0.05); }
          50%      { box-shadow: 0 0 30px hsl(170 65% 30% / 0.2), 0 0 80px hsl(170 65% 30% / 0.1); }
        }
        .engine-container { position: relative; width: 100%; max-width: 560px; height: 280px; margin: 0 auto; }
        @media (max-width: 640px) { .engine-container { height: 240px; max-width: 360px; } }
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

          {/* ── Engine visual ── */}
          <div className="mt-14 flex flex-col items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium tracking-widest uppercase">
              Your AI sits on top of
            </span>

            <div className="engine-container mt-4">

              {/* ── Orbital rings around center ── */}
              <div
                className="absolute pointer-events-none rounded-full"
                style={{
                  left: '50%', top: '45%',
                  width: '240px', height: '240px',
                  marginLeft: '-120px', marginTop: '-120px',
                  border: '1.5px dashed hsl(170 65% 30% / 0.18)',
                  animation: 'spin-cw 15s linear infinite',
                }}
              />
              <div
                className="absolute pointer-events-none rounded-full"
                style={{
                  left: '50%', top: '45%',
                  width: '310px', height: '310px',
                  marginLeft: '-155px', marginTop: '-155px',
                  border: '1px dashed hsl(210 70% 45% / 0.12)',
                  animation: 'spin-ccw 22s linear infinite',
                }}
              />

              {/* ── Orbiting particles ── */}
              {[
                { radius: 120, dur: 10, delay: 0, size: 6, hue: '170 65% 30%' },
                { radius: 120, dur: 10, delay: 5, size: 5, hue: '210 70% 45%' },
                { radius: 155, dur: 18, delay: 0, size: 4, hue: '170 65% 30%' },
                { radius: 155, dur: 18, delay: 6, size: 5, hue: '210 70% 45%' },
                { radius: 155, dur: 18, delay: 12, size: 3, hue: '155 50% 45%' },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%', top: '45%',
                    width: 0, height: 0,
                    animation: `spin-cw ${p.dur}s linear infinite`,
                    animationDelay: `-${p.delay}s`,
                  }}
                >
                  <div
                    style={{
                      width: p.size, height: p.size,
                      borderRadius: '50%',
                      background: `hsl(${p.hue})`,
                      boxShadow: `0 0 10px hsl(${p.hue} / 0.6)`,
                      transform: `translateX(${p.radius}px)`,
                    }}
                  />
                </div>
              ))}

              {/* ── Energy pulse behind center ── */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: '50%', top: '45%',
                  width: '180px', height: '180px',
                  marginLeft: '-90px', marginTop: '-90px',
                  background: 'radial-gradient(circle, hsl(170 65% 30% / 0.12), transparent 70%)',
                  animation: 'energy-ring 3s ease-in-out infinite',
                }}
              />

              {/* ── Floating superpower icons around the arc ── */}
              {[
                { Icon: Brain, x: '50%', y: '2%', ml: -16, size: 'w-9 h-9', iconSize: 'w-4.5 h-4.5', dur: 2.8, delay: 0, accent: false },
                { Icon: Star, x: '25%', y: '6%', ml: -12, size: 'w-7 h-7', iconSize: 'w-3 h-3', dur: 3.5, delay: 0.5, accent: false },
                { Icon: Settings, x: '75%', y: '6%', ml: -12, size: 'w-7 h-7', iconSize: 'w-3 h-3', dur: 3.2, delay: 1, accent: false },
                { Icon: Sparkles, x: '12%', y: '28%', ml: -14, size: 'w-8 h-8', iconSize: 'w-3.5 h-3.5', dur: 3, delay: 0.3, accent: true },
                { Icon: Mail, x: '88%', y: '28%', ml: -14, size: 'w-8 h-8', iconSize: 'w-3.5 h-3.5', dur: 3.4, delay: 0.8, accent: true },
                { Icon: Cpu, x: '18%', y: '14%', ml: -11, size: 'w-6 h-6', iconSize: 'w-3 h-3', dur: 4, delay: 1.5, accent: false },
              ].map(({ Icon, x, y, ml, size, iconSize, dur, delay, accent }, i) => (
                <div
                  key={i}
                  className={`absolute z-30 ${size} rounded-full ${accent ? 'bg-accent/12 border border-accent/25' : 'bg-primary/12 border border-primary/25'} flex items-center justify-center`}
                  style={{
                    left: x, top: y,
                    marginLeft: ml,
                    animation: `breathe ${dur}s ease-in-out infinite ${delay}s`,
                  }}
                >
                  <Icon className={`${iconSize} ${accent ? 'text-accent' : 'text-primary'}`} style={{ width: 16, height: 16 }} />
                </div>
              ))}

              {/* ── Gmail card — left side ── */}
              <div
                className="absolute z-20"
                style={{
                  left: '2%', bottom: '10%',
                  animation: 'float-alt 5s ease-in-out infinite',
                }}
              >
                <div
                  className="rounded-2xl bg-card/95 border-2 border-border/40 flex items-center justify-center shadow-lg backdrop-blur-md"
                  style={{ width: '5.5rem', height: '5.5rem' }}
                >
                  <div style={{ width: '3rem', height: '3rem' }}>
                    <GmailIcon />
                  </div>
                </div>
                <span className="block text-xs text-muted-foreground mt-2 text-center font-semibold">Gmail</span>
                <div
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center"
                  style={{ animation: 'breathe 2.5s ease-in-out infinite 0.3s' }}
                >
                  <Zap className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>

              {/* ── Wibookly center hub ── */}
              <div
                className="absolute z-20"
                style={{
                  left: '50%', top: '45%',
                  transform: 'translate(-50%, -50%)',
                  animation: 'float-gentle 4s ease-in-out infinite',
                }}
              >
                <div
                  className="rounded-full bg-card border-[3px] border-primary/30 flex items-center justify-center backdrop-blur-md"
                  style={{
                    width: '8.5rem', height: '8.5rem',
                    animation: 'glow-pulse 3s ease-in-out infinite',
                  }}
                >
                  <img
                    src={wibooklyLogo}
                    alt="Wibookly"
                    className="w-auto drop-shadow-md"
                    style={{ height: '5.5rem' }}
                  />
                </div>
                <span className="block text-sm text-primary mt-2 text-center font-bold tracking-wide">AI-Powered</span>
              </div>

              {/* ── Outlook card — right side ── */}
              <div
                className="absolute z-20"
                style={{
                  right: '2%', bottom: '10%',
                  animation: 'float-alt 5s ease-in-out infinite 1.2s',
                }}
              >
                <div
                  className="rounded-2xl bg-card/95 border-2 border-border/40 flex items-center justify-center shadow-lg backdrop-blur-md"
                  style={{ width: '5.5rem', height: '5.5rem' }}
                >
                  <img
                    src={outlookLogo}
                    alt="Outlook"
                    className="object-contain"
                    style={{ width: '3.5rem', height: '3.5rem' }}
                  />
                </div>
                <span className="block text-xs text-muted-foreground mt-2 text-center font-semibold">Outlook</span>
                <div
                  className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center"
                  style={{ animation: 'breathe 3s ease-in-out infinite 0.7s' }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>

              {/* ── Animated connector lines (curves) ── */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 560 280" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                {/* Left curve: center → Gmail */}
                <path
                  d="M 220 130 C 180 145, 130 150, 95 170"
                  fill="none"
                  stroke="hsl(170 65% 30% / 0.25)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  style={{ animation: 'dash-flow 1.2s linear infinite' }}
                />
                {/* Right curve: center → Outlook */}
                <path
                  d="M 340 130 C 380 145, 430 150, 465 170"
                  fill="none"
                  stroke="hsl(170 65% 30% / 0.25)"
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
