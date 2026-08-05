import { useSyncExternalStore } from 'react';

const subscribe = (query) => (onChange) => {
  const mql = window.matchMedia(query);
  mql.addEventListener('change', onChange);
  return () => mql.removeEventListener('change', onChange);
};

/**
 * SSR-safe media query hook built on useSyncExternalStore, so it never causes
 * a hydration flash and never runs a layout effect on every render.
 */
export const useMediaQuery = (query) =>
  useSyncExternalStore(
    subscribe(query),
    () => window.matchMedia(query).matches,
    () => false,
  );

export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');

/** True when the visitor has asked the OS for reduced motion. */
export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)');

/** Fine pointer = mouse/trackpad. Gates the custom cursor and hover-only FX. */
export const useHasFinePointer = () => useMediaQuery('(pointer: fine)');

export default useMediaQuery;
