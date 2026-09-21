import { memo } from 'react';
import { cn } from '@/utils/cn';
import { resolveImage } from '@/utils/image';
import ArtIcon from './ArtIcon';

/**
 * Renders whatever a product's `images` entry points at.
 *
 * Every catalogue item ships real photography, so the `<img>` branch is what
 * actually draws. The glyph below is the honest fallback for a row that names a
 * photo we do not have — a rocket outline in a tinted box, never a stand-in
 * picture that could be mistaken for the product itself.
 */
export const ProductImage = memo(function ProductImage({
  source,
  alt,
  fallbackType = 'rocket',
  className,
  imgClassName,
  loading = 'lazy',
}) {
  const resolved = resolveImage(source, fallbackType);

  if (resolved.kind === 'url') {
    return (
      <img
        src={resolved.src}
        alt={alt}
        loading={loading}
        decoding="async"
        className={cn('h-full w-full object-contain', imgClassName, className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className={cn('grid h-full w-full place-items-center bg-secondary-50/60', className)}
    >
      <ArtIcon art={resolved.type} className="h-1/2 w-1/2 text-primary-700/70" />
    </span>
  );
});

export default ProductImage;
