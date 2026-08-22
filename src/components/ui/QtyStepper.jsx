import { Minus, Plus } from '@/components/ui/icons';
import { cn } from '@/utils/cn';

const SIZES = {
  sm: { wrap: 'h-9 gap-0.5 p-0.5', btn: 'h-8 w-8', value: 'w-7 text-sm', icon: 14 },
  md: { wrap: 'h-11 gap-1 p-1', btn: 'h-9 w-9', value: 'w-9 text-[15px]', icon: 16 },
  lg: { wrap: 'h-14 gap-1 p-1.5', btn: 'h-11 w-11', value: 'w-12 text-lg', icon: 18 },
};

/** Quantity control used in the cart drawer and on the product page. */
export const QtyStepper = ({
  value,
  onChange,
  min = 1,
  max = 99,
  size = 'md',
  className,
  label = 'Quantity',
}) => {
  const s = SIZES[size] ?? SIZES.md;
  const clamp = (n) => Math.max(min, Math.min(max, n));

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border border-line bg-card shadow-soft',
        s.wrap,
        className,
      )}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className={cn(
          'grid shrink-0 place-items-center rounded-full text-primary transition-all duration-200',
          'hover:bg-secondary-50 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent',
          s.btn,
        )}
      >
        <Minus size={s.icon} />
      </button>

      <span
        className={cn('text-center font-semibold tabular-nums text-dark', s.value)}
        aria-live="polite"
      >
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Increase quantity"
        className={cn(
          'grid shrink-0 place-items-center rounded-full text-primary transition-all duration-200',
          'hover:bg-secondary-50 active:scale-90 disabled:opacity-30 disabled:hover:bg-transparent',
          s.btn,
        )}
      >
        <Plus size={s.icon} />
      </button>
    </div>
  );
};

export default QtyStepper;
