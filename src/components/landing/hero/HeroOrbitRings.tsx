export function HeroOrbitRings() {
  return (
    <>
      {/* Inner dashed orbit ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          width: '280px',
          height: '280px',
          border: '2px dashed hsl(170 65% 30% / 0.12)',
          animation: 'hero-ring-spin 18s linear infinite',
        }}
      />
      {/* Outer orbit ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          width: '420px',
          height: '420px',
          border: '1.5px solid hsl(210 70% 45% / 0.08)',
          animation: 'hero-ring-spin-r 28s linear infinite',
        }}
      />
      {/* Outermost subtle ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          width: '520px',
          height: '520px',
          border: '1px solid hsl(170 65% 30% / 0.05)',
          animation: 'hero-ring-spin 35s linear infinite',
        }}
      />
    </>
  );
}
