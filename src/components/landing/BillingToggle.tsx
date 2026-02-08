import { type BillingInterval } from '@/lib/pricing-config';

interface BillingToggleProps {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}

export function BillingToggle({ interval, onChange }: BillingToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 mt-8 p-1 rounded-2xl bg-muted/80 border border-border/50">
      <button
        onClick={() => onChange('monthly')}
        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
          interval === 'monthly'
            ? 'bg-card text-foreground shadow-md border border-border/50'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange('annual')}
        className={`relative px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
          interval === 'annual'
            ? 'bg-[image:var(--gradient-primary)] text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Annual
        <span className="absolute -top-3 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full leading-none shadow-sm">
          -15%
        </span>
      </button>
    </div>
  );
}
