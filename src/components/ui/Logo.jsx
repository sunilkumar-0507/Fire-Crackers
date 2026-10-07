import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { BRAND } from '@/constants';
import logoArt from '@/assets/art/logo-skv-192.jpg';

/**
 * The SKV Pyros badge: gold lettering on black.
 *
 * Imported from a 192px export rather than the 1254px master in the same
 * folder — the master is 276 KB for something drawn at 44px on every page.
 * Re-export from `Logo skv.jpeg` if the artwork changes.
 */
export const LogoMark = ({ className, size }) => (
  <img
    src={logoArt}
    width={size ?? 192}
    height={size ?? 192}
    alt=""
    decoding="async"
    className={cn('shrink-0 rounded-xl bg-black object-cover shadow-soft', className)}
    // Without `size` the caller sets the box with classes, so it can respond
    // to the breakpoint.
    style={size ? { width: size, height: size } : undefined}
  />
);

/**
 * Wordmark. It used to take a `scale` prop so the navbar could shrink it on
 * scroll; a logo that resizes as you move is a small thing that never stops
 * being distracting, and it made the header's height read as unstable.
 */
/**
 * "SKV Pyros" → ["SKV", "Pyros"]. The last word takes the accent colour, so the
 * wordmark follows the shop's name as the API serves it rather than bolting a
 * fixed word onto the end of it.
 */
const splitName = (name) => {
  const words = name.trim().split(/\s+/);
  return words.length > 1 ? [words.slice(0, -1).join(' '), words.at(-1)] : ['', words[0]];
};

export const Logo = ({ className, compact = false, onClick }) => {
  const [lead, accent] = splitName(BRAND.name);

  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${BRAND.name} — home`}
      className={cn('group inline-flex min-h-11 min-w-0 select-none items-center gap-2 sm:gap-3', className)}
    >
      <LogoMark
        className={compact ? 'h-10 w-10' : 'h-11 w-11 sm:h-[52px] sm:w-[52px]'}
      />

      <span className="flex min-w-0 flex-col leading-none">
        {/* 17px is the largest size at which the full wordmark still clears the
            Track Order and menu buttons on a 320px screen without ellipsing. */}
        {/* The accent word used to be gradient-clipped text running from
            #C84D0E to #FF8A00 — the bright half measured under 3:1 on the page. */}
        <span className="truncate font-display text-[17px] font-bold tracking-tight text-dark xs:text-[20px] sm:text-[21px]">
          {lead ? `${lead} ` : null}
          <span className="text-primary-700">{accent}</span>
        </span>
        <span className="mt-1 hidden text-2xs font-semibold uppercase tracking-[.16em] text-muted xs:block">
          {BRAND.tagline}
        </span>
      </span>
    </Link>
  );
};

export default Logo;
