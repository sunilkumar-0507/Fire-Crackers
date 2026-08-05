import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

/**
 * Scroll behaviour on navigation.
 *
 * A new route jumps to the top instantly — smooth-scrolling a page change
 * reads as lag, not polish. Hash links (`/about#faq`) still glide, because
 * there the movement is the feedback that something happened.
 */
export const ScrollManager = () => {
  const { pathname, hash, key } = useLocation();
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (hash) {
      // Wait a frame for the target section to exist after a route change.
      const raf = requestAnimationFrame(() => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
          return;
        }
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
      return () => cancelAnimationFrame(raf);
    }

    window.scrollTo({ top: 0, behavior: 'auto' });
    return undefined;
  }, [pathname, hash, key, reduced]);

  return null;
};

export default ScrollManager;
