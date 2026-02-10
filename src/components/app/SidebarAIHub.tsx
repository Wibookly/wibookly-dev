import { Sparkles, Zap, Star } from 'lucide-react';
import { useBranding } from '@/contexts/BrandingContext';

export function SidebarAIHub() {
  const { logoUrl, brandName } = useBranding();

  return (
    <div className="flex flex-col items-center py-5 px-5 border-b border-border gap-1">
      {/* AI Energy Hub with Logo in Center */}
      <div className="relative w-24 h-24">
        {/* Outer rotating ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: '2px solid hsl(var(--primary) / 0.12)',
            animation: 'sidebar-ring-spin 14s linear infinite',
          }}
        />
        {/* Second ring */}
        <div
          className="absolute inset-1.5 rounded-full pointer-events-none"
          style={{
            border: '1.5px solid hsl(var(--primary) / 0.08)',
            animation: 'sidebar-ring-spin 10s linear infinite reverse',
          }}
        />

        {/* Orbiting particles */}
        {[
          { angle: 0, color: 'hsl(38 92% 50%)', shadow: 'hsl(38 92% 50% / 0.5)' },
          { angle: 90, color: 'hsl(var(--primary))', shadow: 'hsl(var(--primary) / 0.5)' },
          { angle: 180, color: 'hsl(210 80% 55%)', shadow: 'hsl(210 80% 55% / 0.5)' },
          { angle: 270, color: 'hsl(280 70% 60%)', shadow: 'hsl(280 70% 60% / 0.5)' },
        ].map(({ angle, color, shadow }) => (
          <div
            key={angle}
            className="absolute w-full h-full pointer-events-none"
            style={{
              animation: `sidebar-orbit 10s linear infinite`,
              animationDelay: `${-angle / 36}s`,
            }}
          >
            <div
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                top: '-4px',
                left: '50%',
                marginLeft: '-5px',
                background: color,
                boxShadow: `0 0 8px ${shadow}`,
              }}
            />
          </div>
        ))}

        {/* Energy pulse */}
        <div
          className="absolute inset-3 rounded-full pointer-events-none"
          style={{
            border: '1px solid hsl(var(--primary) / 0.15)',
            animation: 'sidebar-pulse 3s ease-in-out infinite',
          }}
        />

        {/* Center orb with Wibookly logo */}
        <div
          className="absolute inset-4 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, hsl(178 32% 93%), hsl(195 38% 85%))',
            border: '2px solid hsl(var(--primary) / 0.2)',
            boxShadow: '0 0 24px hsl(var(--primary) / 0.12)',
            animation: 'sidebar-float 4s ease-in-out infinite',
          }}
        >
          <img src={logoUrl} alt={brandName} className="w-10 h-10 object-contain" />
        </div>

        {/* Sparkle accents */}
        <Sparkles
          className="absolute -top-1 -right-0.5 w-4 h-4"
          style={{ color: 'hsl(38 92% 50%)', animation: 'sidebar-twinkle 2s ease-in-out infinite' }}
        />
        <Star
          className="absolute -bottom-0.5 -right-1 w-3 h-3"
          style={{ color: 'hsl(280 70% 60%)', animation: 'sidebar-twinkle 2s ease-in-out infinite 1s' }}
        />
        <Zap
          className="absolute -bottom-0.5 -left-1 w-3.5 h-3.5"
          style={{ color: 'hsl(210 80% 55%)', animation: 'sidebar-twinkle 2s ease-in-out infinite 0.5s' }}
        />
      </div>

      {/* Logo only - no text */}

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
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50%      { transform: scale(1.06); opacity: 0.7; }
        }
        @keyframes sidebar-float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-2px); }
        }
        @keyframes sidebar-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%      { opacity: 1; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
