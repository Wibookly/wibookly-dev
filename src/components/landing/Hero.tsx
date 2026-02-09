import { ArrowUpRight } from 'lucide-react';
import outlookLogo from '@/assets/outlook-logo.png';
import wibooklyLogo from '@/assets/wibookly-logo.png';

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
      <div className="blob-decoration blob-green w-96 h-96 -top-20 -left-32" />
      <div className="blob-decoration blob-blue w-80 h-80 top-20 -right-20" />

      <style>{`
        /* ── Engine animations ── */
        @keyframes hero-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes hero-spin-r { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes hero-float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50%      { transform: translate(-50%, -50%) translateY(-10px); }
        }
        @keyframes hero-card-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(5px); }
        }
        @keyframes hero-wave {
          0%   { transform: translate(-50%, -50%) scale(0.85); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        @keyframes hero-beam {
          0%   { stroke-dashoffset: 200; opacity: 0.6; }
          50%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0.6; }
        }
        @keyframes hero-icon-orbit {
          from { transform: rotate(var(--start)) translateX(var(--orbit-r)) rotate(calc(-1 * var(--start))); }
          to   { transform: rotate(calc(var(--start) + 360deg)) translateX(var(--orbit-r)) rotate(calc(-1 * (var(--start) + 360deg))); }
        }
        @keyframes hero-pulse-ring {
          0%, 100% { opacity: 0.25; }
          50%      { opacity: 0.5; }
        }
        @keyframes hero-glow {
          0%, 100% { box-shadow: 0 0 30px hsl(170 65% 30% / 0.08), 0 0 60px hsl(210 70% 45% / 0.04); }
          50%      { box-shadow: 0 0 50px hsl(170 65% 30% / 0.18), 0 0 90px hsl(210 70% 45% / 0.08); }
        }
        @keyframes hero-shimmer {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .hero-engine { position: relative; width: 100%; max-width: 680px; height: 340px; margin: 0 auto; }
        @media (max-width: 768px) { .hero-engine { height: 280px; max-width: 400px; } }
        @media (max-width: 480px) { .hero-engine { height: 240px; max-width: 340px; } }
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

          {/* ── Futuristic Engine Visual ── */}
          <div className="mt-16 flex flex-col items-center gap-4">
            <span className="text-sm text-muted-foreground font-medium tracking-widest uppercase">
              Your AI sits on top of
            </span>

            <div className="hero-engine mt-2">

              {/* ── SVG background layer: rings, beams, grid ── */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 680 340" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <defs>
                  <linearGradient id="beam-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(170 65% 30%)" stopOpacity="0" />
                    <stop offset="50%" stopColor="hsl(170 65% 30%)" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="hsl(210 70% 45%)" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id="center-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="hsl(170 65% 30%)" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="hsl(170 65% 30%)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Subtle radial grid lines */}
                {[80, 120, 160].map(r => (
                  <circle
                    key={r}
                    cx="340" cy="155"
                    r={r}
                    fill="none"
                    stroke="hsl(170 65% 30% / 0.06)"
                    strokeWidth="1"
                  />
                ))}

                {/* Center glow */}
                <circle cx="340" cy="155" r="100" fill="url(#center-glow)" />

                {/* Energy beam: center → Gmail */}
                <path
                  d="M 270 165 C 220 180, 160 190, 110 210"
                  fill="none"
                  stroke="url(#beam-grad)"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  style={{ animation: 'hero-beam 2s linear infinite' }}
                />
                {/* Energy beam: center → Outlook */}
                <path
                  d="M 410 165 C 460 180, 520 190, 570 210"
                  fill="none"
                  stroke="url(#beam-grad)"
                  strokeWidth="2.5"
                  strokeDasharray="8 6"
                  style={{ animation: 'hero-beam 2s linear infinite', animationDelay: '-1s' }}
                />
              </svg>

              {/* ── Spinning dashed orbit ring 1 ── */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: '50%', top: '45%',
                  width: '220px', height: '220px',
                  marginLeft: '-110px', marginTop: '-110px',
                  border: '2px dashed hsl(170 65% 30% / 0.15)',
                  animation: 'hero-spin 14s linear infinite',
                }}
              />
              {/* ── Spinning orbit ring 2 (reverse) ── */}
              <div
                className="absolute rounded-full pointer-events-none"
                style={{
                  left: '50%', top: '45%',
                  width: '300px', height: '300px',
                  marginLeft: '-150px', marginTop: '-150px',
                  border: '1.5px solid hsl(210 70% 45% / 0.08)',
                  animation: 'hero-spin-r 20s linear infinite, hero-pulse-ring 4s ease-in-out infinite',
                }}
              />

              {/* ── Orbiting icon nodes ── */}
              {[
                { icon: '⚡', start: 0, r: 110, dur: 12 },
                { icon: '🧠', start: 72, r: 110, dur: 12 },
                { icon: '✦', start: 144, r: 110, dur: 12 },
                { icon: '📧', start: 216, r: 110, dur: 12 },
                { icon: '⚙', start: 288, r: 110, dur: 12 },
                { icon: '✨', start: 30, r: 150, dur: 20 },
                { icon: '🔮', start: 150, r: 150, dur: 20 },
                { icon: '💡', start: 270, r: 150, dur: 20 },
              ].map((n, i) => (
                <div
                  key={i}
                  className="absolute pointer-events-none z-30"
                  style={{
                    left: '50%', top: '45%',
                    width: 0, height: 0,
                    '--start': `${n.start}deg`,
                    '--orbit-r': `${n.r}px`,
                    animation: `hero-icon-orbit ${n.dur}s linear infinite`,
                  } as React.CSSProperties}
                >
                  <div
                    className="flex items-center justify-center rounded-full bg-card/80 border border-border/40 shadow-sm backdrop-blur-sm"
                    style={{
                      width: i < 5 ? 32 : 26,
                      height: i < 5 ? 32 : 26,
                      fontSize: i < 5 ? 14 : 11,
                      transform: `translateX(${n.r}px) translateX(-50%) translateY(-50%)`,
                    }}
                  >
                    {n.icon}
                  </div>
                </div>
              ))}

              {/* ── Orbiting glow dots ── */}
              {[
                { r: 110, dur: 12, delay: 3, size: 5, hue: '170 65% 30%' },
                { r: 110, dur: 12, delay: 9, size: 4, hue: '210 70% 45%' },
                { r: 150, dur: 20, delay: 5, size: 5, hue: '155 50% 45%' },
                { r: 150, dur: 20, delay: 15, size: 4, hue: '210 70% 45%' },
              ].map((p, i) => (
                <div
                  key={`dot-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%', top: '45%',
                    width: 0, height: 0,
                    animation: `hero-spin ${p.dur}s linear infinite`,
                    animationDelay: `-${p.delay}s`,
                  }}
                >
                  <div style={{
                    width: p.size, height: p.size,
                    borderRadius: '50%',
                    background: `hsl(${p.hue})`,
                    boxShadow: `0 0 12px 2px hsl(${p.hue} / 0.5)`,
                    transform: `translateX(${p.r}px)`,
                  }} />
                </div>
              ))}

              {/* ── CENTER HUB: Wibookly ── */}
              <div
                className="absolute z-20"
                style={{
                  left: '50%', top: '45%',
                  animation: 'hero-float 5s ease-in-out infinite',
                }}
              >
                {/* Expanding energy waves */}
                {[0, 1.2, 2.4].map(d => (
                  <div
                    key={d}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      left: '50%', top: '50%',
                      width: '140px', height: '140px',
                      border: '1.5px solid hsl(170 65% 30% / 0.12)',
                      animation: `hero-wave 3.6s ease-out infinite ${d}s`,
                    }}
                  />
                ))}

                {/* Rotating shimmer ring */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: '50%', top: '50%',
                    width: '160px', height: '160px',
                    background: 'conic-gradient(from 0deg, transparent, hsl(170 65% 30% / 0.12) 30%, transparent 50%, hsl(210 70% 45% / 0.08) 80%, transparent)',
                    animation: 'hero-shimmer 5s linear infinite',
                    filter: 'blur(6px)',
                  }}
                />

                {/* Main hub */}
                <div
                  className="relative rounded-full flex items-center justify-center"
                  style={{
                    width: '10rem', height: '10rem',
                    background: 'linear-gradient(160deg, hsl(178 32% 91%) 0%, hsl(185 40% 84%) 35%, hsl(195 38% 80%) 70%, hsl(205 35% 82%) 100%)',
                    border: '3px solid hsl(170 65% 30% / 0.2)',
                    animation: 'hero-glow 3s ease-in-out infinite',
                  }}
                >
                  {/* Inner subtle ring */}
                  <div
                    className="absolute inset-2 rounded-full pointer-events-none"
                    style={{ border: '1px solid hsl(170 65% 30% / 0.08)' }}
                  />
                  <img
                    src={wibooklyLogo}
                    alt="Wibookly"
                    className="w-auto drop-shadow-lg relative z-10"
                    style={{ height: '6rem' }}
                  />
                </div>

                <span
                  className="block text-sm mt-3 text-center font-bold tracking-widest uppercase"
                  style={{ color: 'hsl(170 65% 30%)' }}
                >
                  AI-Powered
                </span>
              </div>

              {/* ── Gmail card — left ── */}
              <div
                className="absolute z-20"
                style={{
                  left: '0', bottom: '4%',
                  animation: 'hero-card-float 4.5s ease-in-out infinite',
                }}
              >
                <div
                  className="rounded-2xl bg-card/95 border-2 border-border/40 flex items-center justify-center shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105"
                  style={{ width: '6.5rem', height: '6.5rem' }}
                >
                  <div style={{ width: '3.5rem', height: '3.5rem' }}>
                    <GmailIcon />
                  </div>
                </div>
                <span className="block text-xs text-muted-foreground mt-2 text-center font-semibold tracking-wide">Gmail</span>
              </div>

              {/* ── Outlook card — right ── */}
              <div
                className="absolute z-20"
                style={{
                  right: '0', bottom: '4%',
                  animation: 'hero-card-float 4.5s ease-in-out infinite 1s',
                }}
              >
                <div
                  className="rounded-2xl bg-card/95 border-2 border-border/40 flex items-center justify-center shadow-lg backdrop-blur-md transition-transform duration-300 hover:scale-105"
                  style={{ width: '6.5rem', height: '6.5rem' }}
                >
                  <img
                    src={outlookLogo}
                    alt="Outlook"
                    className="object-contain"
                    style={{ width: '4rem', height: '4rem' }}
                  />
                </div>
                <span className="block text-xs text-muted-foreground mt-2 text-center font-semibold tracking-wide">Outlook</span>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
