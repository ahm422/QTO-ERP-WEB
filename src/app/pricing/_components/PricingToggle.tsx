'use client';

interface PricingToggleProps {
  yearly: boolean;
  onToggle: (yearly: boolean) => void;
}

export default function PricingToggle({ yearly, onToggle }: PricingToggleProps) {
  return (
    <div className='flex items-center justify-center gap-3 mb-12'>
      <span
        className={`text-sm font-medium ${
          !yearly ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        Monthly
      </span>
      <button
        onClick={() => onToggle(!yearly)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          yearly ? 'bg-accent' : 'bg-border'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card transition-transform ${
            yearly ? 'translate-x-6' : ''
          }`}
        />
      </button>
      <span
        className={`text-sm font-medium ${
          yearly ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        Yearly <span className='text-accent text-xs font-semibold'>Save 20%</span>
      </span>
    </div>
  );
}
