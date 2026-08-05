import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion, useHasFinePointer } from './useMediaQuery';

/**
 * Whole-page pointer parallax.
 *
 * Publishes two CSS custom properties on a container — `--px` and `--py`,
 * each in the range -1..1 — which children consume via `calc()`. One listener
 * and one rAF drives any number of parallax layers, and React never re-renders.
 */
export const useParallax = ({ smoothing = 0.08 } = {}) => {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const fine = useHasFinePointer();

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !fine) return undefined;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let raf = 0;
    let running = false;

    const tick = () => {
      currentX += (targetX - currentX) * smoothing;
      currentY += (targetY - currentY) * smoothing;
      node.style.setProperty('--px', currentX.toFixed(4));
      node.style.setProperty('--py', currentY.toFixed(4));

      // Idle out once we've effectively arrived, so a still pointer costs nothing.
      if (Math.abs(targetX - currentX) < 0.001 && Math.abs(targetY - currentY) < 0.001) {
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const onPointerMove = (event) => {
      targetX = (event.clientX / window.innerWidth) * 2 - 1;
      targetY = (event.clientY / window.innerHeight) * 2 - 1;
      start();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced, fine, smoothing]);

  return ref;
};

export default useParallax;
