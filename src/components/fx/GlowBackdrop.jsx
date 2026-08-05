import { memo } from 'react';
import { cn } from '@/utils/cn';

/**
 * Warm gradient wash sitting behind the whole app.
 *
 * PERF: this used to be three 62vmax divs with `blur-3xl`, plus two
 * `mix-blend-mode` overlays. Both are among the most expensive things you can
 * put on a page — a blurred layer that size costs an enormous raster, and a
 * blend mode forces the entire stacking context beneath it to be composited
 * on every frame. Together they were the single largest cause of the homepage
 * running at 7fps.
 *
 * A radial-gradient is *already* a soft blob. It needs no filter to look
 * blurred, rasterises once, and costs nothing to keep on screen. Everything
 * below is plain background-image painting on one element — no filters, no
 * blend modes, no animation.
 *
 * Pointer parallax still works: `--px` / `--py` come from `useParallax` on the
 * shell and move a single composited layer.
 */
export const GlowBackdrop = memo(function GlowBackdrop({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-bg', className)}
    >
      {/* Every blob in one painted layer — soft by gradient, not by filter. */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: 'translate3d(calc(var(--px,0) * 18px), calc(var(--py,0) * 14px), 0)',
          backgroundImage: [
            'radial-gradient(58% 42% at 12% 6%, rgba(255,196,110,.52), transparent 62%)',
            'radial-gradient(48% 38% at 92% 24%, rgba(255,138,0,.34), transparent 64%)',
            'radial-gradient(52% 40% at 34% 92%, rgba(255,213,106,.40), transparent 66%)',
            'radial-gradient(120% 78% at 50% -12%, rgba(255,231,196,.85), transparent 58%)',
          ].join(','),
        }}
      />

      {/* Light rays — a repeating gradient faded out by a mask. No blend mode. */}
      <div
        className="absolute inset-x-0 top-0 h-[62vh] opacity-[.14]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(102deg, rgba(255,255,255,.9) 0px, rgba(255,255,255,.9) 2px, transparent 2px, transparent 36px)',
          maskImage: 'radial-gradient(70% 86% at 50% -8%, #000 0%, transparent 72%)',
          WebkitMaskImage: 'radial-gradient(70% 86% at 50% -8%, #000 0%, transparent 72%)',
          transform: 'translate3d(calc(var(--px,0) * -10px), 0, 0)',
        }}
      />
    </div>
  );
});

export default GlowBackdrop;
