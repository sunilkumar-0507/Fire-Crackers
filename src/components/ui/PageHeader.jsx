import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from '@/components/ui/icons';
import { cn } from '@/utils/cn';

/** Breadcrumb + title block that opens every inner page. */
export const PageHeader = ({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  wash = false,
  accent = '#FF8A00',
  children,
  className,
}) => (
  <header className={cn('relative overflow-hidden pb-8 pt-8 sm:pb-14 sm:pt-14', className)}>
    {/* A warm wash in the right half, which on a phone is directly behind the
        title and description — so it only renders once there is a column free
        for it. This used to be an `art` prop naming a glyph to draw on top of
        the wash; the glyph is gone and the prop now says what it does. */}
    {wash ? (
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 max-w-lg sm:block">
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(60% 60% at 70% 45%, ${accent}2e, transparent 70%)` }}
        />
      </div>
    ) : null}

    <div className="container relative">
      <div className="max-w-2xl">
        {breadcrumbs.length ? (
          <nav aria-label="Breadcrumb" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1.5 text-2xs text-muted">
              <li>
                <Link to="/" className="inline-flex min-h-6 items-center transition-colors hover:text-primary">
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
                      <Link to={crumb.to} className="inline-flex min-h-6 items-center transition-colors hover:text-primary">
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
          </nav>
        ) : null}

        {eyebrow ? (
          <p className="mb-4 text-2xs font-semibold uppercase tracking-[.22em] text-primary">
            {eyebrow}
          </p>
        ) : null}

        {/* Optional: the product page supplies its own <h1> in the buy rail,
            and uses this header only for the breadcrumb trail. */}
        {title ? (
          <h1 className="text-display-sm font-semibold text-dark">
            {title}
          </h1>
        ) : null}

        {description ? (
          <p className="mt-4 text-[15px] leading-relaxed text-muted sm:mt-5 sm:text-base">
            {description}
          </p>
        ) : null}

        {children ? (
          <div className="mt-6 sm:mt-7">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  </header>
);

export default PageHeader;
