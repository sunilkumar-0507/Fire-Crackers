import { cn } from '@/utils/cn';

/**
 * Pill used for popular searches, tag filters and spec pills.
 * Renders as a button when `onClick` is given, otherwise as a static span.
 */
export const Chip = ({ active = false, onClick, className, children, icon, count, ...rest }) => {
  const classes = cn(
    // `shrink-0`/`nowrap`: chips are used inside horizontal scroll strips on
    // small screens, where a flex child would otherwise compress to two lines
    // rather than let the strip scroll.
    'group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium',
    'transition-all duration-300 ease-luxe',
    active
      ? 'border-transparent bg-flame text-white shadow-[0_8px_22px_-10px_rgba(200,77,14,.9)]'
      : 'border-line bg-white/85 text-ink/80 hover:-translate-y-0.5 hover:border-secondary-300 hover:bg-white hover:text-primary hover:shadow-soft',
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
            active ? 'bg-white/25 text-white' : 'bg-secondary-50 text-primary-600',
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
