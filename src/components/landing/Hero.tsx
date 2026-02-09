import { ArrowUpRight, Sparkles, Zap, Brain, Mail, Star, Cpu, Settings } from 'lucide-react';
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
        @keyframes spin-cw {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes spin-ccw {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50%      { transform: translate(-50%, -50%) translateY(-8px); }
        }
        @keyframes float-card {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(6px); }
        }
        @keyframes dash-flow {
          from { stroke-dashoffset: 16; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50%      { transform: scale(1.15); opacity: 1; }
        }
        @keyframes aura-spin {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes aura-pulse {
          0%, 100% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          50%      { opacity: 0.7; transform: translate(-50%, -50%) scale(1.06); }
        }
        @keyframes energy-wave {
          0%   { transform: translate(-50%, -50%) scale(0.9); opacity: 0.5; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        .engine-wrap {
          position: relative;
          width: 100%;
          max-width: 620px;
          height: 300px;
          margin: 0 auto;
        }
        @media (max-width: 640px) {
          .engine-wrap { height: 260px; max-width: 380px; }
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

          {/* ── Engine Visual ── */}
          <div className="mt-14 flex flex-col items-center gap-3">
            <span className="text-sm text-muted-foreground font-medium tracking-widest uppercase">
              Your AI sits on top of
            </span>

            <div className="engine-wrap mt-4">

              {/* ── Orbital rings ── */}
              <div
                className="absolute pointer-events-none rounded-full"
                style={{
                  left: '50%', top: '44%',
                  width: '260px', height: '260px',
                  marginLeft: '-130px', marginTop: '-130px',
                  border: '1.5px dashed hsl(170 65% 30% / 0.18)',
                  animation: 'spin-cw 16s linear infinite',
                }}
              />
              <div
                className="absolute pointer-events-none rounded-full"
                style={{
                  left: '50%', top: '44%',
                  width: '340px', height: '340px',
                  marginLeft: '-170px', marginTop: '-170px',
                  border: '1px dashed hsl(210 70% 45% / 0.12)',
                  animation: 'spin-ccw 24s linear infinite',
                }}
              />

              {/* ── Orbiting particles ── */}
              {[
                { r: 130, dur: 12, delay: 0, size: 6, hue: '170 65% 30%' },
                { r: 130, dur: 12, delay: 6, size: 5, hue: '210 70% 45%' },
                { r: 170, dur: 20, delay: 0, size: 4, hue: '170 65% 30%' },
                { r: 170, dur: 20, delay: 7, size: 5, hue: '210 70% 45%' },
                { r: 170, dur: 20, delay: 13, size: 3, hue: '155 50% 45%' },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute pointer-events-none"
                  style={{
                    left: '50%', top: '44%',
                    width: 0, height: 0,
                    animation: `spin-cw ${p.dur}s linear infinite`,
                    animationDelay: `-${p.delay}s`,
                  }}
                >
                  <div style={{
                    width: p.size, height: p.size,
                    borderRadius: '50%',
                    background: `hsl(${p.hue})`,
                    boxShadow: `0 0 10px hsl(${p.hue} / 0.6)`,
                    transform: `translateX(${p.r}px)`,
                  }} />
                </div>
              ))}

              {/* ── CENTER: Wibookly hub with gradient + energy aura ── */}
              <div
                className="absolute z-20"
                style={{
                  left: '50%', top: '44%',
                  animation: 'float-gentle 4.5s ease-in-out infinite',
                }}
              >
                {/* Repeating energy waves */}
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      left: '50%', top: '50%',
                      width: '160px', height: '160px',
                      border: '1.5px solid hsl(170 65% 30% / 0.15)',
                      animation: `energy-wave 3s ease-out infinite ${i}s`,
                    }}
                  />
                ))}

                {/* Rotating gradient aura */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: '50%', top: '50%',
                    width: '170px', height: '170px',
                    background: 'conic-gradient(from 0deg, hsl(170 65% 30% / 0.15), hsl(210 70% 45% / 0.08), hsl(155 50% 45% / 0.12), hsl(170 65% 30% / 0.15))',
                    animation: 'aura-spin 6s linear infinite',
                    filter: 'blur(8px)',
                  }}
                />

                {/* Soft glow */}
                <div
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: '50%', top: '50%',
                    width: '155px', height: '155px',
                    background: 'radial-gradient(circle, hsl(170 65% 30% / 0.1), hsl(210 70% 45% / 0.05) 60%, transparent 80%)',
                    animation: 'aura-pulse 3s ease-in-out infinite',
                  }}
                />

                {/* Main circle with gradient background */}
                <div
                  className="relative rounded-full flex items-center justify-center shadow-xl"
                  style={{
                    width: '9rem', height: '9rem',
                    background: 'linear-gradient(145deg, hsl(178 30% 93%) 0%, hsl(185 35% 88%) 40%, hsl(195 30% 85%) 100%)',
                    border: '3px solid hsl(170 65% 30% / 0.25)',
                    boxShadow: '0 0 30px hsl(170 65% 30% / 0.12), 0 8px 32px hsl(200 40% 20% / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.3)',
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

              {/* ── Floating superpower icons ── */}
              {[
                { Icon: Brain,    left: '50%', top: '0%',   ml: -18, size: 36, iSize: 16, dur: 2.8, delay: 0 },
                { Icon: Star,     left: '26%', top: '5%',   ml: -14, size: 28, iSize: 13, dur: 3.5, delay: 0.5 },
                { Icon: Settings, left: '74%', top: '5%',   ml: -14, size: 28, iSize: 13, dur: 3.2, delay: 1 },
                { Icon: Sparkles, left: '10%', top: '30%',  ml: -16, size: 32, iSize: 15, dur: 3,   delay: 0.3 },
                { Icon: Mail,     left: '90%', top: '30%',  ml: -16, size: 32, iSize: 15, dur: 3.4, delay: 0.8 },
                { Icon: Cpu,      left: '16%', top: '14%',  ml: -12, size: 24, iSize: 12, dur: 4,   delay: 1.5 },
              ].map(({ Icon, left, top, ml, size, iSize, dur, delay }, i) => {
                const isAccent = i === 3 || i === 4;
                return (
                  <div
                    key={i}
                    className={`absolute z-30 rounded-full flex items-center justify-center ${isAccent ? 'bg-accent/12 border border-accent/25' : 'bg-primary/12 border border-primary/25'}`}
                    style={{
                      left, top,
                      marginLeft: ml,
                      width: size, height: size,
                      animation: `breathe ${dur}s ease-in-out infinite ${delay}s`,
                    }}
                  >
                    <Icon
                      className={isAccent ? 'text-accent' : 'text-primary'}
                      style={{ width: iSize, height: iSize }}
                    />
                  </div>
                );
              })}

              {/* ── Gmail card — left ── */}
              <div
                className="absolute z-20"
                style={{
                  left: '0%', bottom: '8%',
                  animation: 'float-card 5s ease-in-out infinite',
                }}
              >
                <div
                  className="rounded-2xl bg-card/95 border-2 border-border/40 flex items-center justify-center shadow-lg backdrop-blur-md"
                  style={{ width: '6rem', height: '6rem' }}
                >
                  <div style={{ width: '3.2rem', height: '3.2rem' }}>
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

              {/* ── Outlook card — right ── */}
              <div
                className="absolute z-20"
                style={{
                  right: '0%', bottom: '8%',
                  animation: 'float-card 5s ease-in-out infinite 1.2s',
                }}
              >
                <div
                  className="rounded-2xl bg-card/95 border-2 border-border/40 flex items-center justify-center shadow-lg backdrop-blur-md"
                  style={{ width: '6rem', height: '6rem' }}
                >
                  <img
                    src={outlookLogo}
                    alt="Outlook"
                    className="object-contain"
                    style={{ width: '3.8rem', height: '3.8rem' }}
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

              {/* ── Animated connector curves ── */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 620 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                <path
                  d="M 230 140 C 180 160, 130 165, 96 185"
                  fill="none"
                  stroke="hsl(170 65% 30% / 0.22)"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  style={{ animation: 'dash-flow 1.2s linear infinite' }}
                />
                <path
                  d="M 390 140 C 440 160, 490 165, 524 185"
                  fill="none"
                  stroke="hsl(170 65% 30% / 0.22)"
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
