import { useCallback, useRef } from 'react';
import { usePrefersReducedMotion, useHasFinePointer } from './useMediaQuery';

/**
 * Mouse-follow 3D tilt for cards.
 *
 * Two rules keep a grid of forty of these cheap:
 *
 *  1. **No React state.** Transforms are written straight to the node inside a
 *     rAF. A tilting card must never re-render, or the grid drops frames the
 *     moment the pointer moves.
 *  2. **No layout read on move.** `getBoundingClientRect()` forces a synchronous
 *     layout; calling it on every pointermove made scrolling over a grid stall.
 *     The rect is measured once on pointer enter and reused, which is correct
 *     because the card cannot move while the pointer is inside it.
 *
 * Returns props to spread onto the element you want to tilt.
 */
export const useTilt = ({ max = 8, scale = 1.015, glare = true } = {}) => {
  const ref = useRef(null);
  const rect = useRef(null);
  const frame = useRef(0);
  const reduced = usePrefersReducedMotion();
  const fine = useHasFinePointer();
  const enabled = !reduced && fine;

  const onPointerEnter = useCallback(() => {
    if (!enabled || !ref.current) return;
    rect.current = ref.current.getBoundingClientRect();
  }, [enabled]);

  const onPointerMove = useCallback(
    (event) => {
      if (!enabled || !ref.current) return;
      const node = ref.current;
      if (!rect.current) rect.current = node.getBoundingClientRect();
      const box = rect.current;
      const { clientX, clientY } = event;

      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const px = (clientX - box.left) / box.width;
        const py = (clientY - box.top) / box.height;

        node.style.transform =
          `perspective(900px) rotateX(${(0.5 - py) * max}deg) ` +
          `rotateY(${(px - 0.5) * max}deg) scale(${scale})`;

        if (glare) {
          node.style.setProperty('--mx', `${px * 100}%`);
          node.style.setProperty('--my', `${py * 100}%`);
        }
      });
    },
    [enabled, max, scale, glare],
  );

  const onPointerLeave = useCallback(() => {
    rect.current = null;
    if (!ref.current) return;
    cancelAnimationFrame(frame.current);
    ref.current.style.transform = '';
  }, []);

  return {
    ref,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    style: { transition: 'transform .5s cubic-bezier(.22,1,.36,1)', transformStyle: 'preserve-3d' },
  };
};

export default useTilt;
