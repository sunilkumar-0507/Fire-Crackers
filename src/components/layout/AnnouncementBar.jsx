import { memo } from 'react';
import { Phone, ShieldCheck, Truck } from '@/components/ui/icons';
import { BRAND } from '@/constants';

/**
 * Top utility strip.
 *
 * This was a marquee: four messages on a 32-second loop, translated
 * continuously across the full width of the page. Scrolling text can only be
 * read at the speed it happens to be moving, it pulls the eye away from
 * whatever you were actually reading, and WCAG 2.2.2 treats any auto-moving
 * content over five seconds as something a visitor must be able to stop.
 *
 * The two facts that mattered are now simply printed, and the phone number —
 * which most orders here still come through — is a tap target rather than
 * something you had to wait for the loop to bring back around.
 */
export const AnnouncementBar = memo(function AnnouncementBar() {
  return (
    <div className="bg-dark text-bg">
      <div className="container flex h-9 items-center justify-between gap-4 text-2xs font-medium">
        <p className="flex items-center gap-2 truncate">
          <Truck size={13} className="shrink-0 text-gold" aria-hidden="true" />
          Free delivery over ₹2,000 across Tamil Nadu &amp; Kerala
        </p>

        <p className="hidden shrink-0 items-center gap-2 md:flex">
          <ShieldCheck size={13} className="shrink-0 text-gold" aria-hidden="true" />
          PESO-tested under the 125 dB limit
        </p>

        <a
          href={BRAND.phoneHref}
          className="flex shrink-0 items-center gap-2 font-semibold transition-colors hover:text-gold"
        >
          <Phone size={13} className="shrink-0 text-gold" aria-hidden="true" />
          <span className="hidden xs:inline">{BRAND.phone}</span>
          <span className="xs:hidden">Call us</span>
        </a>
      </div>
    </div>
  );
});

export default AnnouncementBar;
