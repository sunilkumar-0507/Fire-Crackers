import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { fadeUp, inView, stagger } from '@/animations/variants';

/** Page section with a consistent vertical rhythm and in-view reveal. */
export const Section = ({ className, children, id, spacing = 'md', ...rest }) => {
  const pad = {
    sm: 'py-10 sm:py-16',
    md: 'py-14 sm:py-24',
    lg: 'py-16 sm:py-32',
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
  <motion.div
    variants={stagger(0.08)}
    {...inView}
    className={cn(
      'flex flex-col gap-5 pb-8 sm:pb-14',
      align === 'center'
        ? 'items-center text-center'
        : 'md:flex-row md:items-end md:justify-between',
      className,
    )}
  >
    <div className={cn('max-w-2xl', align === 'center' && 'flex flex-col items-center')}>
      {eyebrow ? (
        <motion.div variants={fadeUp} className="mb-4 flex items-center gap-3">
          <span className="h-px w-8 origin-left bg-gradient-to-r from-primary to-transparent" />
          <span className="text-2xs font-semibold uppercase tracking-[.22em] text-primary">
            {eyebrow}
          </span>
        </motion.div>
      ) : null}

      <motion.h2
        variants={fadeUp}
        className={cn('text-display-sm font-semibold text-dark', titleClassName)}
      >
        {title}
      </motion.h2>

      {description ? (
        <motion.p
          variants={fadeUp}
          className="mt-4 text-[15px] leading-relaxed text-muted sm:text-base"
        >
          {description}
        </motion.p>
      ) : null}
    </div>

    {action ? (
      <motion.div variants={fadeUp} className="shrink-0">
        {action}
      </motion.div>
    ) : null}
  </motion.div>
);

export default Section;
