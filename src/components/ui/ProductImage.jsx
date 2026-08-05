import { memo } from 'react';
import { cn } from '@/utils/cn';
import { resolveImage } from '@/utils/image';
import CrackerArt from './CrackerArt';

/**
 * Renders whatever a product's `images` entry points at.
 *
 * Vector art today, `<img>` the moment the API starts returning URLs — the
 * call sites never need to know which they got.
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
    <CrackerArt
      type={resolved.type}
      variant={resolved.variant}
      title={alt}
      className={className}
    />
  );
});

export default ProductImage;
