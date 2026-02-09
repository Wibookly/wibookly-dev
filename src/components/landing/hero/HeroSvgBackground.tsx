export function HeroSvgBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 600 600"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="hero-beam-g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(170 65% 30%)" stopOpacity="0" />
          <stop offset="50%" stopColor="hsl(170 65% 30%)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="hsl(210 70% 45%)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hero-center-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="hsl(170 65% 30%)" stopOpacity="0.07" />
          <stop offset="100%" stopColor="hsl(170 65% 30%)" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Subtle radial grid */}
      {[100, 140, 210, 260].map((r) => (
        <circle
          key={r}
          cx="300"
          cy="300"
          r={r}
          fill="none"
          stroke="hsl(170 65% 30% / 0.05)"
          strokeWidth="1"
        />
      ))}

      {/* Center glow */}
      <circle cx="300" cy="300" r="120" fill="url(#hero-center-glow)" />

      {/* Energy beam → Gmail (left) */}
      <path
        d="M 230 310 C 180 340, 120 370, 60 400"
        fill="none"
        stroke="url(#hero-beam-g)"
        strokeWidth="2.5"
        strokeDasharray="8 6"
        style={{ animation: 'hero-beam-dash 2.5s linear infinite' }}
      />

      {/* Energy beam → Outlook (right) */}
      <path
        d="M 370 310 C 420 340, 480 370, 540 400"
        fill="none"
        stroke="url(#hero-beam-g)"
        strokeWidth="2.5"
        strokeDasharray="8 6"
        style={{ animation: 'hero-beam-dash 2.5s linear infinite', animationDelay: '-1.2s' }}
      />
    </svg>
  );
}
