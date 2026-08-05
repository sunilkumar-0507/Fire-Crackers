import { useEffect, useState } from 'react';

/**
 * Reports whether the page has scrolled past `threshold`.
 *
 * Uses a passive listener with an rAF gate so the navbar's shrink animation
 * never fights the scroll thread. Only flips state when the boolean actually
 * changes, so React re-renders once per crossing rather than once per frame.
 */
export const useScrolled = (threshold = 24) => {
  const [scrolled, setScrolled] = useState(
    () => typeof window !== 'undefined' && window.scrollY > threshold,
  );

  useEffect(() => {
    let ticking = false;

    const update = () => {
      ticking = false;
      setScrolled((prev) => {
        const next = window.scrollY > threshold;
        return prev === next ? prev : next;
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);

  return scrolled;
};

export default useScrolled;
