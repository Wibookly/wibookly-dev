import { type BillingInterval } from '@/lib/pricing-config';

interface BillingToggleProps {
  interval: BillingInterval;
  onChange: (interval: BillingInterval) => void;
}

export function BillingToggle({ interval, onChange }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onChange('monthly')}
        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
          interval === 'monthly'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Monthly
      </button>
      <button
        onClick={() => onChange('annual')}
        className={`relative px-5 py-2 rounded-xl text-sm font-medium transition-all ${
          interval === 'annual'
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Annual
        <span className="absolute -top-2.5 -right-3 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
          Save
        </span>
      </button>
    </div>
  );
}
