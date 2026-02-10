import { useAuth } from '@/lib/auth';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function TimeIcon({ className }: { className?: string }) {
  const tod = getTimeOfDay();
  switch (tod) {
    case 'morning': return <Sunrise className={className} style={{ color: 'hsl(38 92% 50%)' }} />;
    case 'afternoon': return <Sun className={className} style={{ color: 'hsl(38 80% 55%)' }} />;
    case 'evening': return <Sunset className={className} style={{ color: 'hsl(25 90% 55%)' }} />;
    case 'night': return <Moon className={className} style={{ color: 'hsl(230 60% 65%)' }} />;
  }
}

const HEADER_PARTICLES = [
  { icon: '✉️', delay: 0, y: 20, dur: 5 },
  { icon: '📝', delay: 1.5, y: 55, dur: 6 },
  { icon: '💬', delay: 3, y: 35, dur: 4.5 },
  { icon: '📧', delay: 0.7, y: 70, dur: 5.5 },
  { icon: '🤖', delay: 2.2, y: 15, dur: 5.2 },
  { icon: '📨', delay: 4, y: 50, dur: 4.8 },
  { icon: '⚡', delay: 1, y: 80, dur: 5.8 },
  { icon: '📋', delay: 3.5, y: 40, dur: 4.2 },
  { icon: '🔔', delay: 2.8, y: 65, dur: 5.3 },
];

export function AppHeader() {
  const { profile } = useAuth();
  const firstName = profile?.full_name?.trim().split(' ')[0] || 'there';

  const getGreeting = () => {
    const tod = getTimeOfDay();
    switch (tod) {
      case 'morning': return 'Good morning';
      case 'afternoon': return 'Good afternoon';
      case 'evening': return 'Good evening';
      case 'night': return 'Good night';
    }
  };

  return (
    <header className="hidden lg:flex h-16 border-b border-border/40 bg-card/30 backdrop-blur-sm items-center sticky top-0 z-20 relative overflow-hidden">
      {/* Animated data streams across the full header */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hdr-stream-1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(170 65% 40%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(170 65% 40%)" stopOpacity="0.15" />
            <stop offset="70%" stopColor="hsl(210 80% 55%)" stopOpacity="0.15" />
            <stop offset="100%" stopColor="hsl(210 80% 55%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hdr-stream-2" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="hsl(280 70% 60%)" stopOpacity="0" />
            <stop offset="40%" stopColor="hsl(280 70% 60%)" stopOpacity="0.12" />
            <stop offset="100%" stopColor="hsl(38 92% 50%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Forward stream */}
        <line x1="0" y1="24" x2="100%" y2="28"
          stroke="url(#hdr-stream-1)" strokeWidth="1" strokeDasharray="8 6"
          style={{ animation: 'hdr-dash 4s linear infinite' }} />
        <line x1="0" y1="42" x2="100%" y2="38"
          stroke="url(#hdr-stream-2)" strokeWidth="1" strokeDasharray="6 8"
          style={{ animation: 'hdr-dash-rev 5s linear infinite' }} />
        <line x1="0" y1="56" x2="100%" y2="52"
          stroke="url(#hdr-stream-1)" strokeWidth="0.8" strokeDasharray="4 6"
          style={{ animation: 'hdr-dash 6s linear infinite', animationDelay: '-2s' }} />
      </svg>

      {/* Floating particles across header (left→right and right→left) */}
      {HEADER_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            top: `${p.y}%`,
            left: i % 2 === 0 ? '0' : 'auto',
            right: i % 2 === 1 ? '0' : 'auto',
            fontSize: '11px',
            animation: `${i % 2 === 0 ? 'hdr-fly-right' : 'hdr-fly-left'} ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            opacity: 0,
            filter: 'drop-shadow(0 0 3px hsl(var(--primary) / 0.2))',
          }}
        >
          {p.icon}
        </div>
      ))}

      {/* Left: Greeting */}
      <div className="flex items-center gap-3 px-6 relative z-10">
        <div className="p-2 rounded-xl bg-primary/10">
          <TimeIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {getGreeting()}, {firstName}
          </h2>
          <p className="text-xs text-muted-foreground">Here's what's happening with your inbox today</p>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes hdr-dash {
          0%   { stroke-dashoffset: 200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes hdr-dash-rev {
          0%   { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 200; }
        }
        @keyframes hdr-fly-right {
          0%   { transform: translateX(0) scale(0.5); opacity: 0; }
          8%   { opacity: 0.7; transform: translateX(40px) scale(0.9); }
          50%  { opacity: 0.5; transform: translateX(50vw) scale(0.8) translateY(-4px); }
          85%  { opacity: 0.2; transform: translateX(85vw) scale(0.5) translateY(2px); }
          100% { opacity: 0; transform: translateX(95vw) scale(0.3); }
        }
        @keyframes hdr-fly-left {
          0%   { transform: translateX(0) scale(0.5); opacity: 0; }
          8%   { opacity: 0.7; transform: translateX(-40px) scale(0.9); }
          50%  { opacity: 0.5; transform: translateX(-50vw) scale(0.8) translateY(4px); }
          85%  { opacity: 0.2; transform: translateX(-85vw) scale(0.5) translateY(-2px); }
          100% { opacity: 0; transform: translateX(-95vw) scale(0.3); }
        }
      `}</style>
    </header>
  );
}
