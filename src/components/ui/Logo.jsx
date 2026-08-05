import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { BRAND } from '@/constants';

/** Diya mark: a lit lamp inside a spark ring. */
export const LogoMark = ({ className, size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="lg-flame" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stopColor="#C84D0E" />
        <stop offset="45%" stopColor="#FF8A00" />
        <stop offset="100%" stopColor="#FFD56A" />
      </linearGradient>
      <linearGradient id="lg-bowl" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#E2762F" />
        <stop offset="100%" stopColor="#8C3A12" />
      </linearGradient>
    </defs>

    {/* spark ring */}
    <circle cx="24" cy="24" r="22" stroke="#FFD56A" strokeWidth="1.5" strokeDasharray="2 6" opacity=".75" />

    {/* flame */}
    <path
      d="M24 6 C29 13 32 18 32 22 C32 26.5 28.4 30 24 30 C19.6 30 16 26.5 16 22 C16 18 19 13 24 6 Z"
      fill="url(#lg-flame)"
    />
    <path
      d="M24 15 C26.6 19 28 21.6 28 24 C28 26.2 26.2 28 24 28 C21.8 28 20 26.2 20 24 C20 21.6 21.4 19 24 15 Z"
      fill="#FFF6DC"
      opacity=".9"
    />

    {/* bowl */}
    <path
      d="M7 31 C7 31 14 29 24 29 C34 29 41 31 41 31 C39.5 37.5 32.5 42 24 42 C15.5 42 8.5 37.5 7 31 Z"
      fill="url(#lg-bowl)"
    />
    <ellipse cx="24" cy="31" rx="17" ry="2.6" fill="#FFB44B" />
  </svg>
);

/**
 * Wordmark. `scale` lets the navbar shrink it smoothly on scroll without a
 * layout shift — it only ever changes a transform.
 */
export const Logo = ({ className, compact = false, scale = 1, onClick }) => (
  <Link
    to="/"
    onClick={onClick}
    aria-label={`${BRAND.name} — home`}
    className={cn('group inline-flex min-w-0 select-none items-center gap-2 sm:gap-3', className)}
    style={{
      transform: `scale(${scale})`,
      transformOrigin: 'left center',
      transition: 'transform .45s cubic-bezier(.22,1,.36,1)',
    }}
  >
    {/* The mark carries the brand on its own below 420px, where the wordmark
        plus three header controls will not fit on one line. */}
    <span className="relative grid shrink-0 place-items-center">
      <span className="absolute inset-0 -z-10 rounded-full bg-secondary-300/35 blur-lg transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0" />
      <LogoMark
        size={compact ? 32 : 36}
        className="transition-transform duration-700 ease-luxe group-hover:rotate-[8deg] group-hover:scale-110 sm:hidden"
      />
      <LogoMark
        size={compact ? 34 : 42}
        className="hidden transition-transform duration-700 ease-luxe group-hover:rotate-[8deg] group-hover:scale-110 sm:block"
      />
    </span>

    <span className="flex min-w-0 flex-col leading-none">
      {/* 15px is the largest size at which the full wordmark still clears the
          three header controls on a 320px screen without ellipsing. */}
      <span className="truncate font-display text-[15px] font-semibold tracking-tight text-dark xs:text-[19px] sm:text-[22px]">
        {BRAND.short}
        <span className="bg-gradient-to-r from-primary to-secondary-500 bg-clip-text text-transparent">
          {' '}
          Crackers
        </span>
      </span>
      <span className="mt-1 hidden text-[9px] font-semibold uppercase tracking-[.28em] text-muted xs:block">
        {BRAND.tagline}
      </span>
    </span>
  </Link>
);

export default Logo;
