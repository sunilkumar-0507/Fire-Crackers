import { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ZoomIn } from 'lucide-react';
import { cn } from '@/utils/cn';
import { EASE } from '@/animations/variants';
import { useHasFinePointer } from '@/hooks/useMediaQuery';
import ProductImage from '@/components/ui/ProductImage';

/**
 * Gallery with pointer-anchored zoom.
 *
 * The zoom writes `transform-origin` directly on the node from a rAF, so the
 * image tracks the pointer at frame rate without a re-render per move. Zoom is
 * disabled for coarse pointers, where a magnifier is only ever in the way.
 */
export const ProductGallery = ({ images, alt, fallbackType, badges }) => {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const imageRef = useRef(null);
  const frame = useRef(0);
  const fine = useHasFinePointer();

  const onPointerMove = useCallback(
    (event) => {
      if (!fine || !imageRef.current) return;
      const node = imageRef.current;
      const { clientX, clientY } = event;

      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        node.style.transformOrigin = `${x}% ${y}%`;
      });
    },
    [fine],
  );

  return (
    <div className="flex flex-col gap-4">
      <div
        onPointerMove={onPointerMove}
        onPointerEnter={() => fine && setZoomed(true)}
        onPointerLeave={() => {
          cancelAnimationFrame(frame.current);
          setZoomed(false);
        }}
        className="group relative aspect-square overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-secondary-50 via-white to-secondary-50/60 shadow-card"
      >
        {badges ? (
          <div className="absolute left-3 top-3 z-20 flex flex-col items-start gap-2 sm:left-5 sm:top-5">
            {badges}
          </div>
        ) : null}

        {fine ? (
          <span className="absolute right-5 top-5 z-20 flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-2xs font-semibold text-muted opacity-0 shadow-soft backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
            <ZoomIn size={12} strokeWidth={2.4} />
            Hover to zoom
          </span>
        ) : null}

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{ background: 'radial-gradient(60% 60% at 50% 45%, rgba(255,213,106,.28), transparent 72%)' }}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            ref={imageRef}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: zoomed ? 1.75 : 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: zoomed ? 0.45 : 0.4, ease: EASE }}
            className="absolute inset-0 grid place-items-center p-8 sm:p-14"
          >
            <ProductImage
              source={images[active]}
              alt={alt}
              fallbackType={fallbackType}
              loading="eager"
              className="h-full w-full"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 ? (
        // Thumbnails are fixed-size and `shrink-0`, so four of them are wider
        // than a phone. Scroll the strip rather than let it push the page.
        <div className="hide-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:gap-3 sm:px-0">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${images.length}`}
              aria-current={index === active}
              className={cn(
                'group/thumb relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 bg-white p-2 transition-all duration-400 ease-luxe xs:h-20 xs:w-20 sm:h-24 sm:w-24',
                index === active
                  ? 'border-primary shadow-soft'
                  : 'border-line opacity-65 hover:-translate-y-1 hover:border-secondary-300 hover:opacity-100',
              )}
            >
              <ProductImage
                source={image}
                alt=""
                fallbackType={fallbackType}
                className="h-full w-full transition-transform duration-500 group-hover/thumb:scale-110"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ProductGallery;
