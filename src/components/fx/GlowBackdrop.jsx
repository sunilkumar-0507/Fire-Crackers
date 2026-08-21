import { memo } from 'react';
import { cn } from '@/utils/cn';

/**
 * The page ground: a warm cream wash with one soft sunrise at the top.
 *
 * This was previously four saturated orange blobs that tracked the pointer,
 * plus a repeating light-ray gradient, sitting under a canvas of drifting
 * embers and periodic fireworks. Two problems, in order of importance:
 *
 *  1. Every surface above it was translucent, so body text sat on a *moving*
 *     coloured field. Contrast changed as you moved the mouse.
 *  2. It never held still, which makes long product lists tiring to read.
 *
 * What is left is a single static paint. It still reads as warm and festive —
 * the colour is doing that, not the motion.
 */
export const GlowBackdrop = memo(function GlowBackdrop({ className }) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none fixed inset-0 -z-20 bg-bg', className)}
      style={{
        backgroundImage: [
          'radial-gradient(120% 55% at 50% -10%, rgba(255,203,112,.34), transparent 62%)',
          'radial-gradient(70% 40% at 100% 0%, rgba(255,178,56,.16), transparent 70%)',
        ].join(','),
      }}
    />
  );
});

export default GlowBackdrop;
