import { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Eye, Heart, ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/utils/cn';
import { formatPrice, stockLevel } from '@/utils/format';
import { toCartItem } from '@/utils/cart';
import { artForCategory } from '@/utils/image';
import { useCartStore, selectInCart, selectIsWishlisted } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { fadeUp } from '@/animations/variants';
import ProductImage from '@/components/ui/ProductImage';
import Badge, { StockBadge } from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';

/**
 * The catalogue's workhorse card.
 *
 * Wrapped in `memo` and reading the cart through narrow selectors, so adding
 * one product re-renders that card alone — not the other forty in the grid.
 *
 * Three things were deliberately taken out of this card:
 *
 *  - **The 3D pointer tilt and the radial glare that followed it.** Forty
 *    cards that lean away from the cursor make a grid feel unstable, and the
 *    tilt moved the add button out from under the pointer on the way to it.
 *  - **The icon-only add button.** A bare `+` in a circle is guessable, not
 *    obvious, and it was the primary action on the busiest screen in the shop.
 *    It now says what it does.
 *  - **The hover-only price context.** Discount and savings are the reason
 *    someone is on this page, so they are stated on every card, always.
 */
export const ProductCard = memo(function ProductCard({ product, className, compact = false }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const qtyInCart = useCartStore(selectInCart(product.id));
  const wishlisted = useCartStore(selectIsWishlisted(product.id));
  const setQuickView = useUIStore((s) => s.setQuickView);

  const level = stockLevel(product.stock);
  const soldOut = product.stock <= 0;
  const saves = Math.max(0, product.mrp - product.price);

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
        className={cn(
          'relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-card',
          'shadow-card transition-shadow duration-300 ease-luxe hover:shadow-lift',
          soldOut && 'opacity-75',
        )}
      >
        <Link to={`/product/${product.slug}`} className="relative block overflow-hidden bg-secondary-50">
          {/* badges */}
          <div className="absolute left-2.5 top-2.5 z-10 flex flex-col items-start gap-1.5 sm:left-3 sm:top-3">
            {product.discount > 0 ? <Badge tone="flame">{product.discount}% off</Badge> : null}
            {product.isNew ? <Badge tone="gold">New</Badge> : null}
            {product.bestSeller && !product.isNew ? <Badge tone="dark">Best seller</Badge> : null}
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            aria-pressed={wishlisted}
            className={cn(
              'absolute right-2 top-2 z-10 grid h-10 w-10 place-items-center rounded-full transition-colors duration-200 sm:right-2.5 sm:top-2.5',
              'active:scale-95',
              wishlisted
                ? 'bg-berry-500 text-white shadow-soft'
                : 'bg-card text-muted shadow-soft hover:text-berry-500',
            )}
          >
            <Heart size={17} strokeWidth={2.2} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>

          <div
            className={cn(
              'relative grid place-items-center p-4 sm:p-6',
              compact ? 'aspect-[5/4]' : 'aspect-[4/3]',
            )}
          >
            <ProductImage
              source={product.images[0]}
              alt={product.name}
              fallbackType={artForCategory(product.category)}
              className="relative h-full w-full transition-transform duration-400 ease-luxe group-hover:scale-[1.06]"
            />
          </div>

          {/* Quick view sits in the corner rather than sliding up over the
              image on hover — a control that only exists while the pointer is
              inside the card is a control most people never find. */}
          <button
            type="button"
            onClick={handleQuickView}
            className="absolute bottom-2.5 right-2.5 z-10 hidden items-center gap-1.5 rounded-full bg-card/95 px-3 py-2 text-xs font-semibold text-ink shadow-soft transition-colors hover:text-primary [@media(pointer:fine)]:inline-flex"
          >
            <Eye size={14} strokeWidth={2.2} />
            Quick view
          </button>
        </Link>

        {/* body */}
        <div className="flex flex-1 flex-col gap-2 p-3.5 sm:gap-2.5 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-2xs font-semibold uppercase tracking-[.1em] text-primary-700">
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

          <p className="truncate text-2xs text-muted">{product.unit}</p>

          <div className="mt-auto pt-2.5">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-display text-xl font-semibold text-dark">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs text-muted line-through">{formatPrice(product.mrp)}</span>
              {saves > 0 ? (
                <span className="text-xs font-semibold text-mint-700">
                  Save {formatPrice(saves)}
                </span>
              ) : null}
            </div>

            <StockBadge level={level} className="mt-2" />

            <button
              type="button"
              onClick={handleAdd}
              disabled={soldOut}
              aria-label={soldOut ? 'Out of stock' : `Add ${product.name} to cart`}
              className={cn(
                'mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold',
                'transition-colors duration-200 active:scale-[.98]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                qtyInCart > 0
                  ? 'bg-mint-700 text-white hover:bg-mint-800'
                  : 'bg-flame text-dark shadow-glow hover:brightness-[1.04]',
              )}
            >
              {qtyInCart > 0 ? (
                <>
                  <Check size={16} strokeWidth={2.8} />
                  In cart ({qtyInCart})
                </>
              ) : (
                <>
                  <ShoppingCart size={16} strokeWidth={2.4} />
                  {soldOut ? 'Out of stock' : 'Add to cart'}
                </>
              )}
            </button>
          </div>
        </div>

        {soldOut ? (
          <div className="pointer-events-none absolute inset-0 z-30 grid place-items-center bg-bg/70">
            <span className="rounded-full bg-dark px-5 py-2 text-2xs font-semibold uppercase tracking-[.14em] text-bg">
              Sold out
            </span>
          </div>
        ) : null}
      </div>
    </motion.article>
  );
});

export default ProductCard;
