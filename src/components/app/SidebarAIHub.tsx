import { useBranding } from '@/contexts/BrandingContext';

/**
 * Futuristic email-flow animation hub for the sidebar.
 * A central Wibookly logo emits animated email/message/note icons
 * that travel rightward across the component and loop back.
 */

const PARTICLE_ITEMS = [
  // icon path, color, delay, y-offset, speed
  { icon: '✉️', delay: 0, y: 18, dur: 4.5 },
  { icon: '📝', delay: 1.2, y: 42, dur: 5 },
  { icon: '💬', delay: 2.4, y: 30, dur: 4 },
  { icon: '📧', delay: 0.8, y: 55, dur: 5.5 },
  { icon: '🤖', delay: 3.2, y: 10, dur: 4.8 },
  { icon: '📨', delay: 1.8, y: 65, dur: 4.2 },
  { icon: '⚡', delay: 2.8, y: 38, dur: 3.8 },
];

export function SidebarAIHub() {
  const { logoUrl, brandName } = useBranding();

  return (
    <div className="relative overflow-hidden border-b border-border" style={{ height: '120px' }}>
      {/* Background gradient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 80% at 30% 50%, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Animated flowing lines (data streams) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="stream-g1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(170 65% 40%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(170 65% 40%)" stopOpacity="0.3" />
            <stop offset="70%" stopColor="hsl(210 80% 55%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(210 80% 55%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="stream-g2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(280 70% 60%)" stopOpacity="0" />
            <stop offset="40%" stopColor="hsl(280 70% 60%)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Stream line 1 */}
        <path
          d="M 80 40 C 140 35, 180 55, 320 45"
          fill="none"
          stroke="url(#stream-g1)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          style={{ animation: 'ai-stream-dash 3s linear infinite' }}
        />
        {/* Stream line 2 */}
        <path
          d="M 80 65 C 150 70, 200 50, 320 60"
          fill="none"
          stroke="url(#stream-g2)"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          style={{ animation: 'ai-stream-dash 3.5s linear infinite', animationDelay: '-1.5s' }}
        />
        {/* Stream line 3 */}
        <path
          d="M 80 85 C 130 78, 210 90, 320 80"
          fill="none"
          stroke="url(#stream-g1)"
          strokeWidth="1"
          strokeDasharray="4 6"
          style={{ animation: 'ai-stream-dash 4s linear infinite', animationDelay: '-0.8s' }}
        />
      </svg>

      {/* Floating email/message particles traveling right and looping */}
      {PARTICLE_ITEMS.map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            top: `${p.y}%`,
            left: '70px',
            fontSize: '14px',
            animation: `ai-particle-fly ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0,
            filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.3))',
          }}
        >
          {p.icon}
        </div>
      ))}

      {/* Central Wibookly Logo Hub */}
      <div
        className="absolute flex items-center justify-center"
        style={{
          left: '12px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '72px',
          height: '72px',
        }}
      >
        {/* Pulsing glow ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '2px solid hsl(var(--primary) / 0.15)',
            animation: 'ai-hub-pulse 3s ease-in-out infinite',
          }}
        />
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: '-6px',
            border: '1px solid hsl(var(--primary) / 0.08)',
            animation: 'ai-hub-pulse 3s ease-in-out infinite 1.5s',
          }}
        />

        {/* Logo orb */}
        <div
          className="relative rounded-full flex items-center justify-center overflow-hidden"
          style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(160deg, hsl(178 32% 93%), hsl(195 38% 85%))',
            border: '2px solid hsl(var(--primary) / 0.2)',
            boxShadow: '0 0 20px hsl(var(--primary) / 0.12)',
            animation: 'ai-hub-float 4s ease-in-out infinite',
          }}
        >
          <img src={logoUrl} alt={brandName} className="w-10 h-10 object-contain" />
        </div>
      </div>

      {/* "AI Email Platform" text */}
      <div
        className="absolute"
        style={{ left: '92px', top: '50%', transform: 'translateY(-50%)' }}
      >
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ color: 'hsl(var(--primary))' }}
        >
          AI Email
        </span>
        <br />
        <span className="text-[10px] text-muted-foreground tracking-wider">
          Smart Inbox
        </span>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes ai-stream-dash {
          0%   { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ai-particle-fly {
          0%   { transform: translateX(0) scale(0.6); opacity: 0; }
          10%  { opacity: 0.9; transform: translateX(20px) scale(1); }
          50%  { opacity: 0.7; transform: translateX(140px) scale(0.9) translateY(-8px); }
          80%  { opacity: 0.3; transform: translateX(220px) scale(0.6) translateY(4px); }
          100% { opacity: 0; transform: translateX(260px) scale(0.4); }
        }
        @keyframes ai-hub-pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50%      { transform: scale(1.08); opacity: 0.7; }
        }
        @keyframes ai-hub-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-3px); }
        }
      `}</style>
    </div>
  );
}
