import { memo } from 'react';
import { cn } from '@/utils/cn';
import { resolveImage } from '@/utils/image';

/**
 * Renders whatever a product's `images` entry points at.
 *
 * Every catalogue item ships real photography, so the `<img>` branch is what
 * actually draws. A row naming a photo we do not have gets a plain tinted
 * panel — never a stand-in picture that could be mistaken for the product, and
 * no longer a cartoon glyph of the category either. `fallbackType` still
 * classifies the miss for `resolveImage`; nothing draws it any more.
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
      className={cn('block h-full w-full bg-secondary-50/60', className)}
    />
  );
});

export default ProductImage;
