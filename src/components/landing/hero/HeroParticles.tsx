import type { CSSProperties } from 'react';

const particles = [
  { radius: 140, dur: 14, delay: 0, size: 5, hue: '170 65% 30%' },
  { radius: 140, dur: 14, delay: 7, size: 4, hue: '210 70% 45%' },
  { radius: 210, dur: 22, delay: 3, size: 5, hue: '155 50% 45%' },
  { radius: 210, dur: 22, delay: 14, size: 4, hue: '210 70% 45%' },
  { radius: 260, dur: 30, delay: 5, size: 3, hue: '170 65% 30%' },
  { radius: 260, dur: 30, delay: 20, size: 3, hue: '195 60% 40%' },
];

export function HeroParticles() {
  return (
    <>
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: '50%',
            top: '50%',
            width: 0,
            height: 0,
            animation: `hero-particle-orbit ${p.dur}s linear infinite`,
            animationDelay: `-${p.delay}s`,
          } as CSSProperties}
        >
          <div
            style={{
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: `hsl(${p.hue})`,
              boxShadow: `0 0 12px 3px hsl(${p.hue} / 0.5)`,
              transform: `translateX(${p.radius}px) translateY(-50%)`,
            }}
          />
        </div>
      ))}
    </>
  );
}
