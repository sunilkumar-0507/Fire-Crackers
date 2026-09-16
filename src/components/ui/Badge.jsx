import { cn } from '@/utils/cn';

/**
 * Every tone pairs a light fill with a dark-enough foreground to clear 4.5:1.
 * The stock tones in particular carry meaning, so they also differ in shape
 * (via the dot in `StockBadge`) rather than in hue alone.
 */
const TONES = {
  flame: 'bg-secondary-300 text-dark',
  gold: 'bg-secondary-100 text-primary-800 ring-1 ring-inset ring-secondary-200',
  dark: 'bg-dark text-bg',
  soft: 'bg-secondary-50 text-primary-700 ring-1 ring-inset ring-secondary-200',
  outline: 'bg-card text-ink ring-1 ring-inset ring-line',
  success: 'bg-mint-100 text-mint-800 ring-1 ring-inset ring-mint-300/60',
  warn: 'bg-secondary-100 text-primary-800 ring-1 ring-inset ring-secondary-300',
  danger: 'bg-berry-100 text-berry-800 ring-1 ring-inset ring-berry-300/60',
};

export const Badge = ({ tone = 'soft', className, children, icon, ...rest }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold',
      TONES[tone] ?? TONES.soft,
      className,
    )}
    {...rest}
  >
    {icon}
    {children}
  </span>
);

/**
 * Colour-coded availability pill driven by `availabilityOf()`.
 *
 * "Out of stock" and "temporarily unavailable" are two different things to a
 * customer — one may come back this week, the other is the shop's decision —
 * so they get different words and different colours rather than sharing a
 * single grey "not available".
 */
const STOCK_TONES = {
  out: 'danger',
  unavailable: 'outline',
  low: 'warn',
  medium: 'soft',
  high: 'success',
};

const STOCK_DOTS = {
  out: 'bg-berry-500',
  unavailable: 'bg-muted',
  low: 'bg-primary-500',
  medium: 'bg-secondary-600',
  high: 'bg-mint-500',
};

export const StockBadge = ({ level, className }) => (
  <Badge tone={STOCK_TONES[level.key] ?? 'soft'} className={className}>
    <span className={cn('h-1.5 w-1.5 rounded-full', STOCK_DOTS[level.key] ?? 'bg-muted')} />
    {level.label}
  </Badge>
);

export default Badge;
