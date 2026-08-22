import { useState } from 'react';
import { cn } from '@/utils/cn';
import ProductImage from '@/components/ui/ProductImage';

/**
 * Main product image plus a thumbnail strip.
 *
 * This used to run a pointer-anchored magnifier that rewrote `transform-origin`
 * from a rAF on every mouse move. It is now a plain picture: tap a thumbnail,
 * the main image swaps. Nothing moves on its own.
 */
export const ProductGallery = ({ images, alt, fallbackType, badges }) => {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-line bg-secondary-50 shadow-card">
        {badges ? (
          <div className="absolute left-3 top-3 z-20 flex flex-col items-start gap-2 sm:left-5 sm:top-5">
            {badges}
          </div>
        ) : null}

        <div className="absolute inset-0 grid place-items-center p-8 sm:p-14">
          <ProductImage
            source={images[active]}
            alt={alt}
            fallbackType={fallbackType}
            loading="eager"
            className="h-full w-full"
          />
        </div>
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
                'relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 bg-card p-2 xs:h-20 xs:w-20 sm:h-24 sm:w-24',
                index === active
                  ? 'border-primary shadow-soft'
                  : 'border-line opacity-65 hover:border-secondary-300 hover:opacity-100',
              )}
            >
              <ProductImage
                source={image}
                alt=""
                fallbackType={fallbackType}
                className="h-full w-full"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default ProductGallery;
