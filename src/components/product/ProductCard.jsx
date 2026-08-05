import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, Heart, Plus, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatPrice, stockLevel } from '@/utils/format';
import { toCartItem } from '@/utils/cart';
import { artForCategory } from '@/utils/image';
import { useCartStore, selectInCart, selectIsWishlisted } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useTilt } from '@/hooks/useTilt';
import { fadeUp } from '@/animations/variants';
import ProductImage from '@/components/ui/ProductImage';
import Badge, { StockBadge } from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';

/**
 * The catalogue's workhorse card.
 *
 * Wrapped in `memo` and reading the cart through narrow selectors, so adding
 * one product re-renders that card alone — not the other forty in the grid.
 */
export const ProductCard = memo(function ProductCard({ product, className, compact = false }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const qtyInCart = useCartStore(selectInCart(product.id));
  const wishlisted = useCartStore(selectIsWishlisted(product.id));
  const setQuickView = useUIStore((s) => s.setQuickView);

  const tilt = useTilt({ max: 6, scale: 1.012 });
  const level = stockLevel(product.stock);
  const soldOut = product.stock <= 0;

  const handleAdd = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (soldOut) return;

      const { added, capped } = addItem(toCartItem(product), 1);
      if (added > 0) {
        toast.success(`${product.name} added`, { id: `add-${product.id}` });
      } else if (capped) {
        toast(`Only ${product.stock} in stock`, { icon: '⚠️', id: `cap-${product.id}` });
      }
    },
    [addItem, product, soldOut],
  );

  const handleWishlist = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      const added = toggleWishlist(product.id);
      toast(added ? 'Saved to wishlist' : 'Removed from wishlist', {
        icon: added ? '❤️' : '🤍',
        id: `wish-${product.id}`,
      });
    },
    [toggleWishlist, product.id],
  );

  const handleQuickView = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setQuickView(product);
    },
    [setQuickView, product],
  );

  return (
    <motion.article variants={fadeUp} className={cn('group relative h-full', className)}>
      <div
        ref={tilt.ref}
        onPointerEnter={tilt.onPointerEnter}
        onPointerMove={tilt.onPointerMove}
        onPointerLeave={tilt.onPointerLeave}
        style={tilt.style}
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card',
          'shadow-card transition-shadow duration-500 ease-luxe hover:shadow-lift',
          soldOut && 'opacity-75',
        )}
      >
        {/* pointer-following glare */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(220px circle at var(--mx,50%) var(--my,50%), rgba(255,213,106,.16), transparent 60%)',
          }}
        />

        <Link
          to={`/product/${product.slug}`}
          className="relative block overflow-hidden bg-gradient-to-br from-secondary-50 via-white to-secondary-50/60"
        >
          {/* badges */}
          <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
            {product.discount >= 70 ? <Badge tone="flame">{product.discount}% off</Badge> : null}
            {product.isNew ? <Badge tone="gold">New</Badge> : null}
            {product.bestSeller && !product.isNew ? <Badge tone="dark">Best seller</Badge> : null}
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={wishlisted}
            className={cn(
              'absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full transition-all duration-300 sm:right-3 sm:top-3 sm:h-9 sm:w-9',
              'hover:scale-110 active:scale-90',
              wishlisted ? 'bg-primary text-white shadow-glow' : 'bg-white text-muted shadow-soft hover:text-primary',
            )}
          >
            <Heart size={15} strokeWidth={2.2} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          <div className={cn('relative grid place-items-center p-4 sm:p-6', compact ? 'aspect-[5/4]' : 'aspect-[4/3]')}>
            {/* Glow that blooms on hover. A radial gradient is already soft —
                a `blur-2xl` filter here cost a re-raster per card on hover. */}
            <span
              aria-hidden="true"
              className="absolute inset-0 scale-90 opacity-0 transition-all duration-700 ease-luxe group-hover:scale-100 group-hover:opacity-80"
              style={{
                background: 'radial-gradient(closest-side, rgba(255,180,70,.5), transparent 74%)',
              }}
            />
            <ProductImage
              source={product.images[0]}
              alt={product.name}
              fallbackType={artForCategory(product.category)}
              className="relative h-full w-full transition-transform duration-[900ms] ease-luxe group-hover:scale-[1.13]"
            />
          </div>

          {/* Quick view slides up on hover. Hidden on touch, where there is no
              hover to reveal it and the whole card already links through. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden translate-y-full p-3 transition-transform duration-500 ease-luxe group-hover:pointer-events-auto group-hover:translate-y-0 [@media(pointer:fine)]:block">
            <button
              type="button"
              onClick={handleQuickView}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-dark/90 py-2.5 text-xs font-semibold text-bg transition-colors hover:bg-dark"
            >
              <Eye size={14} strokeWidth={2.2} />
              Quick view
            </button>
          </div>
        </Link>

        {/* body */}
        <div className="flex flex-1 flex-col gap-2 p-3.5 sm:gap-2.5 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-[10px] font-semibold uppercase tracking-[.12em] text-primary/70 sm:text-2xs sm:tracking-[.14em]">
              {product.brand}
            </span>
            <Rating value={product.rating} size="xs" showValue={false} className="hidden xs:flex" />
          </div>

          <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-dark sm:text-[17px]">
            <Link to={`/product/${product.slug}`} className="transition-colors hover:text-primary">
              {product.name}
            </Link>
          </h3>

          {/* The blurb has nowhere to go in a half-width column — it returns
              at `sm`, where the card is wide enough to carry it. */}
          {!compact ? (
            <p className="hidden text-[13px] leading-relaxed text-muted sm:line-clamp-2">
              {product.description}
            </p>
          ) : null}

          <p className="truncate text-2xs text-muted/80">{product.unit}</p>

          <div className="mt-auto flex flex-col gap-2.5 pt-2 xs:flex-row xs:items-end xs:justify-between xs:gap-3 xs:pt-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-lg font-semibold text-dark sm:text-xl">
                  {formatPrice(product.price)}
                </span>
                <span className="text-xs text-muted line-through">{formatPrice(product.mrp)}</span>
              </div>
              <StockBadge level={level} className="mt-1.5 sm:mt-2" />
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut}
              aria-label={soldOut ? 'Out of stock' : `Add ${product.name} to cart`}
              className={cn(
                'relative grid h-10 w-full shrink-0 place-items-center overflow-hidden rounded-full transition-all duration-300 xs:h-11 xs:w-11',
                'hover:scale-110 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100',
                qtyInCart > 0
                  ? 'bg-emerald-500 text-white shadow-[0_8px_20px_-8px_rgba(16,185,129,.8)]'
                  : 'bg-flame text-white shadow-glow hover:shadow-glow-lg',
              )}
            >
              {qtyInCart > 0 ? (
                <>
                  <Check size={17} strokeWidth={2.8} />
                  <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-dark px-1 text-[10px] font-bold text-bg">
                    {qtyInCart}
                  </span>
                </>
              ) : (
                <Plus size={18} strokeWidth={2.8} />
              )}
            </button>
          </div>
        </div>

        {soldOut ? (
          <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center bg-white/65">
            <span className="rounded-full bg-dark px-5 py-2 text-2xs font-semibold uppercase tracking-[.18em] text-bg">
              Sold out
            </span>
          </div>
        ) : null}
      </div>
    </motion.article>
  );
});

export default ProductCard;
