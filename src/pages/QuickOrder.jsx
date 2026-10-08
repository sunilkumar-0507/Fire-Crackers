import { memo, useDeferredValue, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, ShoppingCart, X } from '@/components/ui/icons';
import { categories, products } from '@/data';
import { cn } from '@/utils/cn';
import { availabilityOf, formatPrice, pluralize } from '@/utils/format';
import { searchProducts } from '@/utils/search';
import { toCartItem } from '@/utils/cart';
import { artForCategory } from '@/utils/image';
import { analytics } from '@/lib/analytics';
import { useCartStore, selectInCart, useCartTotals } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import PageHeader from '@/components/ui/PageHeader';
import ProductImage from '@/components/ui/ProductImage';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Quick order — the whole catalogue as one price list.
 *
 * For the customer who already knows what they want: every product, grouped
 * by category, with a quantity box on each line and a running total pinned to
 * the bottom of the screen. No card to open, no page to visit — type a number
 * or tap + and the line is in the cart.
 *
 * Quantities are read from and written straight to the cart store, so this
 * page and the cart drawer can never disagree. Each row subscribes to its own
 * line only, which keeps a tap from re-rendering the other few hundred.
 */

/** Editable −/+ box. Empty rather than "0" so an untouched list reads clean. */
const QtyBox = ({ value, onChange, disabled, name }) => (
  <div
    role="group"
    aria-label={`Quantity of ${name}`}
    className={cn(
      'inline-flex shrink-0 items-center overflow-hidden rounded-full bg-card ring-1 transition-shadow',
      value > 0 ? 'ring-primary/50 shadow-soft' : 'ring-line',
    )}
  >
    <button
      type="button"
      onClick={() => onChange(value - 1)}
      disabled={disabled || value <= 0}
      aria-label={`Decrease ${name}`}
      className="grid h-9 w-8 place-items-center text-lg font-bold text-muted min-[360px]:w-9 transition-colors hover:bg-secondary-50 hover:text-primary disabled:opacity-30 disabled:hover:bg-transparent"
    >
      −
    </button>
    <input
      type="number"
      inputMode="numeric"
      min="0"
      placeholder="0"
      value={value > 0 ? value : ''}
      disabled={disabled}
      onChange={(e) => onChange(Math.max(0, parseInt(e.target.value, 10) || 0))}
      onFocus={(e) => e.target.select()}
      aria-label={`${name} quantity`}
      className="w-9 bg-transparent text-center text-[15px] font-bold tabular-nums text-dark outline-none placeholder:text-muted/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
    <button
      type="button"
      onClick={() => onChange(value + 1)}
      disabled={disabled}
      aria-label={`Increase ${name}`}
      className="grid h-9 w-8 place-items-center text-lg font-bold text-primary min-[360px]:w-9 transition-colors hover:bg-secondary-50 active:bg-secondary-100 disabled:opacity-30"
    >
      +
    </button>
  </div>
);

const QuickRow = memo(function QuickRow({ product }) {
  const qty = useCartStore(selectInCart(product.id));
  const addItem = useCartStore((s) => s.addItem);
  const setQty = useCartStore((s) => s.setQty);
  const setQuickView = useUIStore((s) => s.setQuickView);

  const level = availabilityOf(product);
  const soldOut = !level.purchasable;
  const lineTotal = qty * product.price;

  const change = (next) => {
    if (next === qty) return;
    if (qty === 0) {
      const { added, capped } = addItem(toCartItem(product), next);
      if (added > 0) analytics.cartAdd(product, added);
      if (capped) toast(`Only ${product.stock} in stock`, { icon: '⚠️', id: `cap-${product.id}` });
      return;
    }
    if (next > (product.stock ?? 99)) {
      toast(`Only ${product.stock} in stock`, { icon: '⚠️', id: `cap-${product.id}` });
    }
    setQty(product.id, next);
  };

  // MRP sits under the price rather than beside it — beside it, a four-digit
  // MRP pushes the stepper off a 320px row.
  const price = (
    <span className="flex flex-col leading-tight">
      <span className="font-bold text-primary">{formatPrice(product.price)}</span>
      {product.mrp > product.price ? (
        <span className="text-xs text-muted line-through">{formatPrice(product.mrp)}</span>
      ) : null}
    </span>
  );

  const stepper = <QtyBox value={qty} onChange={change} disabled={soldOut} name={product.name} />;

  const subtotal = (
    <span className={cn('text-sm font-bold tabular-nums', qty > 0 ? 'text-dark' : 'text-muted/60')}>
      {qty > 0 ? formatPrice(lineTotal) : '—'}
    </span>
  );

  return (
    <li
      className={cn(
        'grid grid-cols-[56px_1fr] items-center gap-3 px-3 py-3 sm:grid-cols-[64px_1fr_120px_140px_110px] sm:px-4',
        qty > 0 && 'bg-secondary-50/60',
        soldOut && 'opacity-60',
      )}
    >
      <button
        type="button"
        onClick={() => setQuickView(product)}
        aria-label={`View ${product.name}`}
        className="h-14 w-14 overflow-hidden rounded-xl bg-secondary-50 p-1 ring-primary transition hover:ring-2 focus-visible:outline-none focus-visible:ring-2 sm:h-16 sm:w-16"
      >
        <ProductImage
          source={product.images?.[0]}
          alt={product.name}
          fallbackType={artForCategory(product.category)}
        />
      </button>

      <div className="min-w-0">
        <p className="text-sm font-semibold leading-snug text-dark">{product.name}</p>
        {soldOut ? (
          <p className="mt-0.5 text-2xs font-semibold uppercase tracking-wider text-berry-500">
            {level.label}
          </p>
        ) : null}

        {/* Phones: price, stepper and line total share one row under the name. */}
        <div className="mt-1.5 flex items-center justify-between gap-2 sm:hidden">
          <span className="min-w-0 text-sm">{price}</span>
          {stepper}
          {/* Below 360px the line total gives way; the running total covers it. */}
          <span className="w-14 shrink-0 text-right max-[359px]:hidden">{subtotal}</span>
        </div>
      </div>

      <div className="hidden text-right sm:block">{price}</div>
      <div className="hidden justify-center sm:flex">{stepper}</div>
      <div className="hidden text-right sm:block">{subtotal}</div>
    </li>
  );
});

const CategoryBlock = ({ category, items }) => (
  <section aria-labelledby={`qo-${category.slug}`}>
    <h2
      id={`qo-${category.slug}`}
      className="mb-3 flex items-center gap-2 font-display text-lg font-semibold text-dark"
    >
      <span
        aria-hidden="true"
        className="h-5 w-1.5 rounded-full bg-primary"
        style={category.accent ? { backgroundColor: category.accent } : undefined}
      />
      {category.name}
      <span className="text-sm font-medium text-muted">({items.length})</span>
    </h2>

    <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-card">
      <div className="hidden grid-cols-[64px_1fr_120px_140px_110px] gap-3 border-b border-line bg-secondary-50 px-4 py-2.5 text-2xs font-bold uppercase tracking-wider text-muted sm:grid">
        <span>Image</span>
        <span>Product</span>
        <span className="text-right">Price</span>
        <span className="text-center">Qty</span>
        <span className="text-right">Sub-total</span>
      </div>
      <ul className="divide-y divide-line">
        {items.map((product) => (
          <QuickRow key={product.id} product={product} />
        ))}
      </ul>
    </div>
  </section>
);

const TotalsBar = () => {
  const { subtotal, count, catalogueSavings, freeShippingGap } = useCartTotals();
  const openCart = useUIStore((s) => s.openCart);
  const empty = count === 0;

  return (
    // Sticky, not fixed: it rides the bottom of the screen while the list is
    // in view and then scrolls away with it, so it never covers the footer.
    // On a phone it sits flush on the tab bar (same height formula as the
    // bar's own padding, less a pixel so nothing shows through the seam).
    <div className="sticky bottom-[calc(3.75rem+max(0.25rem,env(safe-area-inset-bottom)))] z-30 -mx-4 mt-8 sm:mx-0 lg:bottom-4">
      <div className="rounded-t-2xl border-t border-line bg-card/95 px-4 py-3 shadow-lift backdrop-blur-md sm:rounded-2xl sm:border">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-2xs font-semibold uppercase tracking-wider text-muted">
              Total · {pluralize(count, 'item')}
            </p>
            <p className="font-display text-2xl font-semibold leading-tight text-primary">
              {formatPrice(subtotal)}
            </p>
          </div>
          <button
            type="button"
            onClick={openCart}
            disabled={empty}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-flame px-5 text-sm font-semibold text-dark shadow-glow transition active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            <ShoppingCart size={16} />
            View cart
          </button>
        </div>
        {!empty ? (
          <p className="mt-2 truncate rounded-full bg-secondary-50 px-3 py-1.5 text-center text-xs font-semibold text-primary-700">
            {freeShippingGap > 0
              ? `Add ${formatPrice(freeShippingGap)} more for free delivery`
              : 'Free delivery unlocked'}
            {catalogueSavings > 0 ? ` · You save ${formatPrice(catalogueSavings)}` : ''}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export const QuickOrder = () => {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const groups = useMemo(() => {
    const q = deferredQuery.trim();
    const pool = q ? new Set(searchProducts(q)) : null;
    const visible = pool ? products.filter((p) => pool.has(p)) : products;

    const byCategory = new Map();
    for (const p of visible) {
      if (!byCategory.has(p.category)) byCategory.set(p.category, []);
      byCategory.get(p.category).push(p);
    }

    // Shop's category order first; anything filed under a category the shop
    // has not listed still shows rather than silently vanishing.
    const known = categories
      .filter((c) => byCategory.has(c.slug))
      .map((c) => ({ category: c, items: byCategory.get(c.slug) }));
    const listed = new Set(categories.map((c) => c.slug));
    const rest = [...byCategory.entries()]
      .filter(([slug]) => !listed.has(slug))
      .map(([slug, items]) => ({ category: { slug, name: 'More crackers' }, items }));

    return [...known, ...rest];
  }, [deferredQuery]);

  return (
    <>
      <PageHeader
        eyebrow="Quick order"
        title="Price list"
        description="Every product on one page. Type a quantity or tap + and it goes straight into your cart."
        breadcrumbs={[{ label: 'Quick order' }]}
        className="!pb-4 !pt-6 sm:!pb-8 sm:!pt-10"
      />

      <div className="container pb-10">
        <div className="sticky top-[5.75rem] z-20 -mx-4 mb-6 bg-bg/90 px-4 py-3 backdrop-blur-md sm:top-[6.25rem]">
          <label className="relative block">
            <span className="sr-only">Search the price list</span>
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search crackers…"
              className="w-full rounded-full border border-line bg-card py-3 pl-11 pr-11 text-sm text-dark shadow-card outline-none ring-primary focus:ring-2 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-dark"
              >
                <X size={14} />
              </button>
            ) : null}
          </label>
        </div>

        {groups.length ? (
          <div className="space-y-8">
            {groups.map(({ category, items }) => (
              <CategoryBlock key={category.slug} category={category} items={items} />
            ))}
          </div>
        ) : (
          <EmptyState
            illustration="search"
            title="Nothing matches that"
            description={`No crackers found for “${query}”. Try a shorter word.`}
          />
        )}

        <TotalsBar />
      </div>
    </>
  );
};

export default QuickOrder;
