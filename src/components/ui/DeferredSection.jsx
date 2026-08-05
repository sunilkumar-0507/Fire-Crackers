import { useEffect, useRef, useState } from 'react';

/**
 * Mounts its children only once they are near the viewport.
 *
 * PERF: the homepage is eleven sections deep. Committing all of them at once
 * built 8,000+ DOM nodes in a single React pass and produced a ~4s long task
 * on a throttled CPU — the page was unresponsive before the user could
 * scroll. Deferring the below-the-fold sections cuts the first commit to the
 * hero and the strip beneath it, and each later section mounts in its own
 * small task while the user is still scrolling towards it.
 *
 * `rootMargin` is generous (800px) so a section is always mounted and
 * animated well before it can be seen. Until then a spacer of
 * `estimatedHeight` holds the scrollbar steady, so nothing jumps.
 */
export const DeferredSection = ({ children, estimatedHeight = 700, rootMargin = '800px' }) => {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || show) return undefined;

    // No IntersectionObserver (very old browser, or a test env) — just render.
    if (typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [show, rootMargin]);

  if (show) return children;

  return <div ref={ref} style={{ minHeight: estimatedHeight }} aria-hidden="true" />;
};

export default DeferredSection;
