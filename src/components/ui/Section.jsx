import { cn } from '@/utils/cn';

/** Page section with a consistent vertical rhythm. */
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
 * Eyebrow + title block, with the description set beside the title rather than
 * under it. A section heading and its explanation then occupy one band instead
 * of two, which is what keeps the first row of cards near the top of the screen.
 *
 * `icon` is the small glyph before the eyebrow; `action` is the optional link
 * or button on the right.
 */
export const SectionHeading = ({
  eyebrow,
  icon,
  title,
  description,
  action,
  align = 'left',
  className,
  titleClassName,
}) => {
  const centred = align === 'center';

  return (
    <div
      className={cn(
        'pb-7 sm:pb-10',
        centred ? 'flex flex-col items-center text-center' : null,
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'flex items-center gap-2 text-2xs font-semibold uppercase tracking-[.18em] text-primary-700',
            centred && 'justify-center',
          )}
        >
          {icon ? <span className="shrink-0 text-secondary-600">{icon}</span> : null}
          {eyebrow}
        </p>
      ) : null}

      <div
        className={cn(
          'mt-3',
          centred
            ? 'flex flex-col items-center gap-4'
            : 'flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10',
        )}
      >
        <h2
          className={cn(
            'font-display text-display-sm font-semibold text-dark',
            centred ? 'max-w-2xl' : 'max-w-xl',
            titleClassName,
          )}
        >
          {title}
        </h2>

        {description ? (
          <p
            className={cn(
              'text-[15px] leading-relaxed text-muted sm:text-base',
              centred ? 'max-w-2xl' : 'max-w-md md:pb-1.5',
            )}
          >
            {description}
          </p>
        ) : null}

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
};

export default Section;
