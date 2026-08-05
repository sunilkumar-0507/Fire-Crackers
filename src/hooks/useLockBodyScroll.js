import { useLayoutEffect } from 'react';

let lockCount = 0;
let previousOverflow = '';
let previousPadding = '';

/**
 * Locks page scroll while an overlay is open, compensating for the scrollbar
 * width so the layout behind the overlay does not shift sideways.
 *
 * Reference-counted: several overlays can request a lock and the page only
 * unlocks when the last one releases.
 */
export const useLockBodyScroll = (locked) => {
  useLayoutEffect(() => {
    if (!locked) return undefined;

    if (lockCount === 0) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      previousOverflow = document.body.style.overflow;
      previousPadding = document.body.style.paddingRight;
      document.body.style.overflow = 'hidden';
      if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    }
    lockCount += 1;

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPadding;
      }
    };
  }, [locked]);
};

export default useLockBodyScroll;
