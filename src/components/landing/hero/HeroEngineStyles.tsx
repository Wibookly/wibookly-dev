export function HeroEngineStyles() {
  return (
    <style>{`
      /* ── Hero Engine Container ── */
      .hero-engine {
        position: relative;
        width: 100%;
        max-width: 600px;
        height: 600px;
        margin: 0 auto;
      }
      @media (max-width: 768px) {
        .hero-engine { height: 440px; max-width: 440px; }
      }
      @media (max-width: 480px) {
        .hero-engine { height: 360px; max-width: 340px; }
      }

      /* ── Orbit for icons ── */
      @keyframes hero-orbit {
        from { transform: rotate(var(--start-angle)) translateX(var(--orbit-radius)) rotate(calc(-1 * var(--start-angle))); }
        to   { transform: rotate(calc(var(--start-angle) + 360deg)) translateX(var(--orbit-radius)) rotate(calc(-1 * (var(--start-angle) + 360deg))); }
      }

      /* ── Hub float ── */
      @keyframes hero-hub-float {
        0%, 100% { transform: translate(-50%, -50%) translateY(0); }
        50%      { transform: translate(-50%, -50%) translateY(-8px); }
      }

      /* ── Energy explosion waves ── */
      @keyframes hero-energy-burst {
        0%   { transform: translate(-50%, -50%) scale(0.8); opacity: 0.5; }
        100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
      }

      /* ── Rotating shimmer ── */
      @keyframes hero-shimmer-rotate {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to   { transform: translate(-50%, -50%) rotate(360deg); }
      }

      /* ── Glow pulse on hub ── */
      @keyframes hero-hub-glow {
        0%, 100% { box-shadow: 0 0 30px hsl(170 65% 30% / 0.1), 0 0 60px hsl(210 70% 45% / 0.05); }
        50%      { box-shadow: 0 0 50px hsl(170 65% 30% / 0.25), 0 0 100px hsl(210 70% 45% / 0.12); }
      }

      /* ── Orbit ring spin ── */
      @keyframes hero-ring-spin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to   { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes hero-ring-spin-r {
        from { transform: translate(-50%, -50%) rotate(360deg); }
        to   { transform: translate(-50%, -50%) rotate(0deg); }
      }

      /* ── Provider card float ── */
      @keyframes hero-provider-float {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(6px); }
      }

      /* ── SVG beam dash ── */
      @keyframes hero-beam-dash {
        0%   { stroke-dashoffset: 200; opacity: 0.5; }
        50%  { opacity: 1; }
        100% { stroke-dashoffset: 0; opacity: 0.5; }
      }

      /* ── Particle glow ── */
      @keyframes hero-particle-orbit {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to   { transform: translate(-50%, -50%) rotate(360deg); }
      }
    `}</style>
  );
}
