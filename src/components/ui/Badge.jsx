import { cn } from '@/utils/cn';

const TONES = {
  flame: 'bg-flame text-white shadow-[0_6px_18px_-8px_rgba(200,77,14,.8)]',
  gold: 'bg-gradient-to-r from-gold-soft to-gold text-dark',
  dark: 'bg-dark text-bg',
  soft: 'bg-secondary-50 text-primary-600 ring-1 ring-inset ring-secondary-200/70',
  outline: 'bg-white/90 text-ink ring-1 ring-inset ring-line',
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  warn: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  danger: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200',
};

export const Badge = ({ tone = 'soft', className, children, icon, ...rest }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs font-semibold uppercase tracking-[.08em]',
      TONES[tone] ?? TONES.soft,
      className,
    )}
    {...rest}
  >
    {icon}
    {children}
  </span>
);

/** Colour-coded stock pill driven by `stockLevel()`. */
export const StockBadge = ({ level, className }) => {
  const tone =
    level.key === 'out' ? 'danger' : level.key === 'low' ? 'warn' : level.key === 'medium' ? 'soft' : 'success';
  return (
    <Badge tone={tone} className={className}>
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          level.key === 'out' && 'bg-rose-500',
          level.key === 'low' && 'bg-amber-500 animate-pulse-glow',
          level.key === 'medium' && 'bg-secondary-500',
          level.key === 'high' && 'bg-emerald-500',
        )}
      />
      {level.label}
    </Badge>
  );
};

export default Badge;
