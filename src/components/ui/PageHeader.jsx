import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';
import { fadeUp, stagger } from '@/animations/variants';
import CrackerArt from '@/components/ui/CrackerArt';

/** Breadcrumb + title block that opens every inner page. */
export const PageHeader = ({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  art,
  artVariant = 1,
  accent = '#FF8A00',
  children,
  className,
}) => (
  <header className={cn('relative overflow-hidden pb-8 pt-8 sm:pb-14 sm:pt-14', className)}>
    {/* The art sits in the right half of the header, which on a phone is
        directly behind the title and description — so it only renders once
        there is a column free for it. */}
    {art ? (
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 max-w-lg sm:block">
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(60% 60% at 70% 45%, ${accent}2e, transparent 70%)` }}
        />
        <div className="absolute right-[8%] top-1/2 h-40 w-40 -translate-y-1/2 opacity-70 sm:h-56 sm:w-56">
          <div className="h-full w-full animate-float-slow">
            <CrackerArt type={art} variant={artVariant} className="h-full w-full" />
          </div>
        </div>
      </div>
    ) : null}

    <div className="container relative">
      <motion.div variants={stagger(0.07)} initial="hidden" animate="show" className="max-w-2xl">
        {breadcrumbs.length ? (
          <motion.nav variants={fadeUp} aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-2xs text-muted">
              <li>
                <Link to="/" className="transition-colors hover:text-primary">
                  Home
                </Link>
              </li>
              {breadcrumbs.map((crumb, i) => (
                <Fragment key={crumb.label}>
                  <li aria-hidden="true">
                    <ChevronRight size={12} className="text-muted" />
                  </li>
                  <li>
                    {crumb.to && i < breadcrumbs.length - 1 ? (
                      <Link to={crumb.to} className="transition-colors hover:text-primary">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-ink" aria-current="page">
                        {crumb.label}
                      </span>
                    )}
                  </li>
                </Fragment>
              ))}
            </ol>
          </motion.nav>
        ) : null}

        {eyebrow ? (
          <motion.p
            variants={fadeUp}
            className="mb-4 text-2xs font-semibold uppercase tracking-[.22em] text-primary"
          >
            {eyebrow}
          </motion.p>
        ) : null}

        {/* Optional: the product page supplies its own <h1> in the buy rail,
            and uses this header only for the breadcrumb trail. */}
        {title ? (
          <motion.h1 variants={fadeUp} className="text-display-sm font-semibold text-dark">
            {title}
          </motion.h1>
        ) : null}

        {description ? (
          <motion.p variants={fadeUp} className="mt-4 text-[15px] leading-relaxed text-muted sm:mt-5 sm:text-base">
            {description}
          </motion.p>
        ) : null}

        {children ? (
          <motion.div variants={fadeUp} className="mt-6 sm:mt-7">
            {children}
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  </header>
);

export default PageHeader;
