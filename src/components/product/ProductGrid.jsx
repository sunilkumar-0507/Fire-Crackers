import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { inView, stagger } from '@/animations/variants';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';

/**
 * Responsive product grid with a staggered reveal.
 *
 * The stagger is capped: past ~12 cards the per-item delay would make the
 * bottom of a long list arrive noticeably late, so the step shrinks as the
 * count grows and the whole grid still lands inside half a second.
 *
 * PERF: with `paginate`, only `pageSize` cards mount up front and the rest
 * arrive a page at a time as you scroll. Rendering the full 43-item catalogue
 * at once built ~6,200 DOM nodes in a single commit and cost a >1s long task
 * on a mid-range CPU. A sentinel below the grid pulls the next page in before
 * you reach it, so it still feels like one continuous list.
 */
export const ProductGrid = ({
  products,
  loading = false,
  skeletonCount = 8,
  // Two-up on a phone: one 360px-wide card per screen turns a 43-item
  // catalogue into a very long scroll, and the card is built to stay legible
  // at half width.
  columns = 'lg:grid-cols-3 xl:grid-cols-4',
  compact = false,
  paginate = false,
  pageSize = 12,
  className,
}) => {
  const [limit, setLimit] = useState(pageSize);
  const sentinelRef = useRef(null);

  // A new filter/sort result is a new list — start from the top again.
  useEffect(() => {
    setLimit(pageSize);
  }, [products, pageSize]);

  const hasMore = paginate && limit < products.length;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setLimit((n) => n + pageSize);
      },
      { rootMargin: '1200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, pageSize, limit]);

  if (loading) {
    return (
      <div className={cn('grid grid-cols-2 gap-3 sm:gap-5', columns, className)}>
        {Array.from({ length: skeletonCount }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const shown = paginate ? products.slice(0, limit) : products;
  const step = shown.length > 12 ? 0.03 : 0.06;

  // Placeholders for the next page occupy the space those cards will fill, so
  // swapping them for real cards does not push the footer down. Without this,
  // appending a page mid-scroll measured as a 0.34 layout shift.
  const pending = hasMore ? Math.min(products.length - limit, pageSize) : 0;

  return (
    <>
      <motion.div
        variants={stagger(step)}
        {...inView}
        className={cn('grid grid-cols-2 gap-3 sm:gap-5', columns, className)}
      >
        {shown.map((product) => (
          <ProductCard key={product.id} product={product} compact={compact} />
        ))}

        {Array.from({ length: pending }, (_, i) => (
          <ProductCardSkeleton key={`pending-${limit}-${i}`} />
        ))}
      </motion.div>

      {hasMore ? (
        <div className="flex flex-col items-center gap-4 pt-10">
          <span ref={sentinelRef} aria-hidden="true" />
          <p className="text-xs text-muted" aria-live="polite">
            Showing {shown.length} of {products.length}
          </p>
          {/* The observer normally pulls the next page in long before this is
              reached; the button covers keyboard use and absent observers. */}
          <Button variant="outline" onClick={() => setLimit((n) => n + pageSize)}>
            Load more
          </Button>
        </div>
      ) : null}
    </>
  );
};

export default ProductGrid;
