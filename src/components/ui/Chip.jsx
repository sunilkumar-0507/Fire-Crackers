import { cn } from '@/utils/cn';

/**
 * Pill used for popular searches, tag filters and spec pills.
 * Renders as a button when `onClick` is given, otherwise as a static span.
 */
export const Chip = ({ active = false, onClick, className, children, icon, count, ...rest }) => {
  const classes = cn(
    // `shrink-0`/`nowrap`: chips are used inside horizontal scroll strips on
    // small screens, where a flex child would otherwise compress to two lines
    // rather than let the strip scroll. `min-h-11` keeps them thumb-sized.
    'group inline-flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium',
    'transition-colors duration-200 ease-luxe',
    active
      ? 'border-transparent bg-flame text-dark shadow-soft'
      : 'border-line bg-card text-ink hover:border-primary hover:text-primary-700',
    className,
  );

  const content = (
    <>
      {icon ? <span className="shrink-0 opacity-80">{icon}</span> : null}
      {children}
      {count != null ? (
        <span
          className={cn(
            'rounded-full px-1.5 py-0.5 text-2xs font-semibold tabular-nums',
            active ? 'bg-dark/15 text-dark' : 'bg-secondary-50 text-primary-700',
          )}
        >
          {count}
        </span>
      ) : null}
    </>
  );

  if (!onClick) {
    return (
      <span className={classes} {...rest}>
        {content}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={classes}
      {...rest}
    >
      {content}
    </button>
  );
};

export default Chip;
