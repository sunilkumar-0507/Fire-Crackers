import { memo } from 'react';
import { ANNOUNCEMENT } from '@/constants';

/**
 * Booking strip, directly under the navbar.
 *
 * It sat above the navbar until now, which put the darkest band on the page at
 * the very top edge and pushed the logo down. Below the bar it reads as a
 * notice attached to the header rather than as a second, competing header.
 *
 * One centred sentence, no marquee. Scrolling text can only be read at the
 * speed it happens to be moving, and WCAG 2.2.2 treats any auto-moving content
 * over five seconds as something a visitor must be able to stop.
 */
export const AnnouncementBar = memo(function AnnouncementBar() {
  return (
    <div className="bg-dark text-gold">
      <div className="container flex h-9 items-center justify-center">
        <p className="truncate text-center text-2xs font-semibold tracking-wide">
          {ANNOUNCEMENT}
        </p>
      </div>
    </div>
  );
});

export default AnnouncementBar;
