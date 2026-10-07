import { cn } from '@/utils/cn';

/**
 * Every tone pairs a light fill with a dark-enough foreground to clear 4.5:1.
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

export default Badge;
