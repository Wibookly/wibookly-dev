import { Brain, Sparkles, Zap } from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';

export function SidebarAIHub() {
  const { logoUrl, brandName } = useBranding();

  return (
    <div className="flex flex-col items-center py-4 px-5 border-b border-border gap-2">
      {/* Mini AI Brain Hub */}
      <div className="relative w-20 h-20">
        {/* Outer rotating ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '2px solid hsl(var(--primary) / 0.15)',
            animation: 'sidebar-ring-spin 12s linear infinite',
          }}
        />
        {/* Orbiting particles */}
        {[0, 120, 240].map((angle) => (
          <div
            key={angle}
            className="absolute w-full h-full pointer-events-none"
            style={{
              animation: `sidebar-orbit 8s linear infinite`,
              animationDelay: `${-angle / 45}s`,
            }}
          >
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{
                top: '-3px',
                left: '50%',
                marginLeft: '-4px',
                background: angle === 0
                  ? 'hsl(38 92% 50%)' // orange
                  : angle === 120
                  ? 'hsl(var(--primary))' // green
                  : 'hsl(var(--accent))', // blue
                boxShadow: `0 0 6px ${
                  angle === 0
                    ? 'hsl(38 92% 50% / 0.5)'
                    : angle === 120
                    ? 'hsl(var(--primary) / 0.5)'
                    : 'hsl(var(--accent) / 0.5)'
                }`,
              }}
            />
          </div>
        ))}

        {/* Energy pulse */}
        <div
          className="absolute inset-2 rounded-full pointer-events-none"
          style={{
            border: '1px solid hsl(var(--primary) / 0.2)',
            animation: 'sidebar-pulse 3s ease-in-out infinite',
          }}
        />

        {/* Center orb */}
        <div
          className="absolute inset-3 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(160deg, hsl(178 32% 91%), hsl(195 38% 80%))',
            border: '2px solid hsl(var(--primary) / 0.25)',
            boxShadow: '0 0 20px hsl(var(--primary) / 0.15)',
            animation: 'sidebar-float 4s ease-in-out infinite',
          }}
        >
          <Brain className="w-6 h-6 text-primary" />
        </div>

        {/* Sparkle accents */}
        <Sparkles
          className="absolute -top-1 -right-1 w-3.5 h-3.5 text-warning"
          style={{ animation: 'sidebar-twinkle 2s ease-in-out infinite' }}
        />
        <Zap
          className="absolute -bottom-0.5 -left-1 w-3 h-3 text-accent"
          style={{ animation: 'sidebar-twinkle 2s ease-in-out infinite 0.7s' }}
        />
      </div>

      {/* Brand logo small */}
      <img src={logoUrl} alt={brandName} className="h-10 w-auto opacity-80" />

      {/* Animations */}
      <style>{`
        @keyframes sidebar-ring-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sidebar-orbit {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes sidebar-pulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50%      { transform: scale(1.08); opacity: 0.8; }
        }
        @keyframes sidebar-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
        @keyframes sidebar-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%      { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
