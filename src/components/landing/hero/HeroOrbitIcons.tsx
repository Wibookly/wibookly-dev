import { Clock, Mail, Zap, Brain, Workflow, Shield, Sparkles, BarChart3 } from 'lucide-react';
import type { CSSProperties } from 'react';

const orbitItems = [
  { Icon: Clock,     label: 'Time Saving',  angle: 0 },
  { Icon: Mail,      label: 'Email AI',     angle: 45 },
  { Icon: Zap,       label: 'Automation',   angle: 90 },
  { Icon: Brain,     label: 'AI Brain',     angle: 135 },
  { Icon: Workflow,  label: 'Workflows',    angle: 180 },
  { Icon: Shield,    label: 'Security',     angle: 225 },
  { Icon: Sparkles,  label: 'Smart Draft',  angle: 270 },
  { Icon: BarChart3, label: 'Analytics',    angle: 315 },
];

interface HeroOrbitIconsProps {
  /** px radius of the orbit circle */
  radius?: number;
  /** seconds for a full revolution */
  duration?: number;
}

export function HeroOrbitIcons({ radius = 210, duration = 40 }: HeroOrbitIconsProps) {
  return (
    <>
      {orbitItems.map(({ Icon, label, angle }) => (
        <div
          key={label}
          className="absolute pointer-events-none z-30"
          style={{
            left: '50%',
            top: '50%',
            width: 0,
            height: 0,
            '--start-angle': `${angle}deg`,
            '--orbit-radius': `${radius}px`,
            animation: `hero-orbit ${duration}s linear infinite`,
          } as CSSProperties}
        >
          <div
            className="flex items-center justify-center rounded-full bg-card/90 border border-border/50 shadow-md backdrop-blur-sm"
            style={{ width: 42, height: 42, transform: `translateX(-50%) translateY(-50%)` }}
            title={label}
          >
            <Icon className="w-5 h-5 text-primary" strokeWidth={1.8} />
          </div>
        </div>
      ))}
    </>
  );
}
