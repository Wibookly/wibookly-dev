import wibooklyLogo from '@/assets/wibookly-logo.png';

export function HeroCenterHub() {
  return (
    <div
      className="absolute z-20"
      style={{
        left: '50%',
        top: '50%',
        animation: 'hero-hub-float 5s ease-in-out infinite',
      }}
    >
      {/* Energy explosion waves */}
      {[0, 1.2, 2.4].map((delay) => (
        <div
          key={delay}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            width: '200px',
            height: '200px',
            border: '2px solid hsl(170 65% 30% / 0.15)',
            animation: `hero-energy-burst 3s ease-out infinite ${delay}s`,
          }}
        />
      ))}

      {/* Rotating shimmer ring */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          left: '50%',
          top: '50%',
          width: '220px',
          height: '220px',
          background:
            'conic-gradient(from 0deg, transparent, hsl(170 65% 30% / 0.15) 25%, transparent 40%, hsl(210 70% 45% / 0.1) 75%, transparent)',
          animation: 'hero-shimmer-rotate 6s linear infinite',
          filter: 'blur(8px)',
        }}
      />

      {/* Main hub orb */}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: '10rem',
          height: '10rem',
          background:
            'linear-gradient(160deg, hsl(178 32% 91%) 0%, hsl(185 40% 84%) 35%, hsl(195 38% 80%) 70%, hsl(205 35% 82%) 100%)',
          border: '3px solid hsl(170 65% 30% / 0.2)',
          animation: 'hero-hub-glow 3s ease-in-out infinite',
        }}
      >
        {/* Inner ring */}
        <div
          className="absolute inset-2 rounded-full pointer-events-none"
          style={{ border: '1px solid hsl(170 65% 30% / 0.1)' }}
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
  );
}
