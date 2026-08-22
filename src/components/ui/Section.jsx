import { cn } from '@/utils/cn';

/** Page section with a consistent vertical rhythm and in-view reveal. */
export const Section = ({ className, children, id, spacing = 'md', ...rest }) => {
  // Was up to py-32. Eight sections of that on the homepage put roughly two
  // full screens of empty cream between the shelves.
  const pad = {
    sm: 'py-8 sm:py-12',
    md: 'py-10 sm:py-16',
    lg: 'py-12 sm:py-20',
  }[spacing];

  return (
    <section id={id} className={cn('relative', pad, className)} {...rest}>
      {children}
    </section>
  );
};

/**
 * Eyebrow + title + description block, optionally with an action on the right.
 * Staggers its own children in as it enters the viewport.
 */
export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action,
  align = 'left',
  className,
  titleClassName,
}) => (
  <div
    className={cn(
      'flex flex-col gap-4 pb-7 sm:pb-10',
      align === 'center'
        ? 'items-center text-center'
        : 'md:flex-row md:items-end md:justify-between',
      className,
    )}
  >
    <div className={cn('max-w-2xl', align === 'center' && 'flex flex-col items-center')}>
      {eyebrow ? (
        <div className="mb-3 flex items-center gap-2.5">
          <span className="h-4 w-1 rounded-full bg-secondary-500" />
          <span className="text-2xs font-semibold uppercase tracking-[.12em] text-primary-700">
            {eyebrow}
          </span>
        </div>
      ) : null}

      <h2 className={cn('text-display-sm font-semibold text-dark', titleClassName)}>
        {title}
      </h2>

      {description ? (
        <p className="mt-3 text-[15px] leading-relaxed text-muted sm:text-base">
          {description}
        </p>
      ) : null}
    </div>

    {action ? (
      <div className="shrink-0">
        {action}
      </div>
    ) : null}
  </div>
);

export default Section;
