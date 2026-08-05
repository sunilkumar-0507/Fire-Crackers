import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  AlertTriangle,
  Check,
  Heart,
  Info,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Truck,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { findProduct, getRelated, findCategory, featuredOffers } from '@/data';
import { SAFETY_RULES, SHIPPING } from '@/constants';
import { formatPrice, stockLevel, addWorkingDays, formatDay } from '@/utils/format';
import { toCartItem } from '@/utils/cart';
import { artForCategory } from '@/utils/image';
import { useCartStore, selectInCart, selectIsWishlisted } from '@/store/cartStore';
import { fadeUp, inView, stagger } from '@/animations/variants';
import PageHeader from '@/components/ui/PageHeader';
import ProductGallery from '@/components/product/ProductGallery';
import ProductGrid from '@/components/product/ProductGrid';
import Section, { SectionHeading } from '@/components/ui/Section';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Badge, { StockBadge } from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import QtyStepper from '@/components/ui/QtyStepper';
import EmptyState from '@/components/ui/EmptyState';

/* ----------------------------- tab panels -------------------------------- */

const SpecTable = ({ specs }) => (
  <dl className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
    {Object.entries(specs).map(([key, value]) => (
      <div key={key} className="flex items-baseline justify-between gap-3 bg-white px-4 py-3.5 sm:px-5 sm:py-4">
        <dt className="text-2xs font-semibold uppercase tracking-[.14em] text-muted">{key}</dt>
        <dd className="text-right text-sm font-semibold text-dark">{value}</dd>
      </div>
    ))}
  </dl>
);

const SafetyPanel = ({ product }) => (
  <div className="space-y-5">
    <div className="flex items-start gap-4 rounded-3xl border border-amber-200 bg-amber-50/70 p-5">
      <ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-600" strokeWidth={2.2} />
      <div>
        <p className="font-display text-base font-semibold text-amber-900">
          Keep {product.specs['Safe distance'] ?? '3 metres'} between people and this item
        </p>
        <p className="mt-1.5 text-sm leading-relaxed text-amber-800/80">
          Noise band: {product.specs.Noise ?? 'Low'}. Light it in open ground, never from a balcony
          rail or a window, and never hold it in your hand unless it is a sparkler.
        </p>
      </div>
    </div>

    <ul className="grid gap-2.5 sm:grid-cols-2">
      {SAFETY_RULES.map((rule) => (
        <li key={rule} className="flex items-start gap-3 rounded-2xl bg-white/85 p-4 text-[13px] leading-relaxed text-ink/80">
          <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" strokeWidth={2.8} />
          {rule}
        </li>
      ))}
    </ul>

    <p className="flex items-start gap-3 rounded-2xl bg-rose-50 p-4 text-[13px] leading-relaxed text-rose-800">
      <AlertTriangle size={15} className="mt-0.5 shrink-0" strokeWidth={2.4} />
      If a cracker fails to light, wait ten full minutes before approaching it, then soak it in
      water before disposal. Never re-light and never inspect it up close.
    </p>
  </div>
);

const DeliveryPanel = () => {
  const from = addWorkingDays(2);
  const to = addWorkingDays(4);

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4 rounded-3xl border border-line bg-white p-5">
        <Truck size={20} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.2} />
        <div>
          <p className="font-display text-base font-semibold text-dark">
            Arrives {formatDay(from)} – {formatDay(to)}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">
            Despatched from Sivakasi by licensed surface transport. Fireworks cannot legally travel
            by air, so there is no express option at any price.
          </p>
        </div>
      </div>

      <ul className="grid gap-2.5 text-[13px] text-ink/80 sm:grid-cols-2">
        {[
          `Free delivery above ${formatPrice(SHIPPING.freeAbove)} in Tamil Nadu & Kerala`,
          `${formatPrice(SHIPPING.localFee)} below that, ${formatPrice(SHIPPING.outstationFee)} for other states`,
          'Amend or cancel free until the consignment leaves the warehouse',
          'Damaged items replaced or refunded — photograph the carton first',
        ].map((line) => (
          <li key={line} className="flex items-start gap-3 rounded-2xl bg-white/85 p-4">
            <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" strokeWidth={2.8} />
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
};

/* ------------------------------- page ------------------------------------ */

export const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = findProduct(slug);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useCartStore((s) => s.toggleWishlist);
  const inCart = useCartStore(selectInCart(product?.id ?? ''));
  const wishlisted = useCartStore(selectIsWishlisted(product?.id ?? ''));

  const [qty, setQty] = useState(1);

  useEffect(() => setQty(1), [slug]);

  const related = useMemo(() => getRelated(product, 4), [product]);
  const category = product ? findCategory(product.category) : null;

  if (!product) {
    return (
      <div className="container py-24">
        <EmptyState
          illustration="dud"
          title="We could not find that cracker"
          description="It may have sold out and been retired for the season, or the link may be mistyped."
          action={<Button to="/products">Browse the catalogue</Button>}
          secondaryAction={<Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>}
        />
      </div>
    );
  }

  const level = stockLevel(product.stock);
  const soldOut = product.stock <= 0;
  const fallback = artForCategory(product.category);
  const saving = product.mrp - product.price;

  const add = () => {
    const { added, capped } = addItem(toCartItem(product), qty);
    if (added > 0) toast.success(`${added} × ${product.name} added`);
    else if (capped) toast(`Only ${product.stock} in stock`, { icon: '⚠️' });
  };

  const buyNow = () => {
    addItem(toCartItem(product), qty);
    navigate('/checkout');
  };

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Products', to: '/products' },
          { label: category?.name ?? 'Category', to: `/category/${product.category}` },
          { label: product.name },
        ]}
        className="pb-0 pt-8 sm:pb-0"
      />

      <div className="container pb-12 sm:pb-16">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)] lg:gap-14">
          {/* gallery */}
          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <ProductGallery
              images={product.images}
              alt={product.name}
              fallbackType={fallback}
              badges={
                <>
                  <Badge tone="flame">{product.discount}% off</Badge>
                  {product.isNew ? <Badge tone="gold">New</Badge> : null}
                  {product.bestSeller ? <Badge tone="dark">Best seller</Badge> : null}
                </>
              }
            />
          </motion.div>

          {/* purchase rail */}
          <motion.div
            variants={stagger(0.06)}
            initial="hidden"
            animate="show"
            className="lg:sticky lg:top-28 lg:self-start"
          >
            <motion.div variants={fadeUp}>
              <p className="text-2xs font-semibold uppercase tracking-[.2em] text-primary/70">
                {product.brand} · {category?.name}
              </p>
              <h1 className="mt-3 font-display text-display-sm font-semibold leading-[1.1] text-dark">
                {product.name}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Rating value={product.rating} reviews={product.reviews} size="md" />
                <StockBadge level={level} />
              </div>
            </motion.div>

            <motion.p variants={fadeUp} className="mt-5 text-[15px] leading-[1.75] text-muted">
              {product.description}
            </motion.p>

            {/* price block */}
            <motion.div
              variants={fadeUp}
              className="mt-7 rounded-4xl border border-line bg-white/90 p-5 shadow-card sm:p-6"
            >
              <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                <span className="font-display text-3xl font-semibold text-dark sm:text-4xl">
                  {formatPrice(product.price)}
                </span>
                <span className="pb-1.5 text-base text-muted line-through">
                  {formatPrice(product.mrp)}
                </span>
                <Badge tone="success" className="mb-2">
                  Save {formatPrice(saving)}
                </Badge>
              </div>
              <p className="mt-1.5 text-xs text-muted">
                {product.unit} · inclusive of all taxes
              </p>

              {/* The stepper is ~150px wide; below `xs` there is not enough
                  room left for a priced Add button beside it, so it takes the
                  next line at full width instead of wrapping mid-label. */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <QtyStepper
                  size="lg"
                  value={qty}
                  onChange={setQty}
                  max={Math.max(1, product.stock)}
                />
                <Button
                  onClick={add}
                  disabled={soldOut}
                  size="lg"
                  className="w-full flex-1 px-4 xs:w-auto xs:min-w-[170px] sm:px-8"
                  leftIcon={<ShoppingBag size={18} />}
                >
                  {soldOut ? 'Out of stock' : `Add — ${formatPrice(product.price * qty)}`}
                </Button>
              </div>

              <div className="mt-3 flex gap-3">
                <Button
                  onClick={buyNow}
                  disabled={soldOut}
                  variant="dark"
                  size="lg"
                  className="min-w-0 flex-1"
                >
                  Buy it now
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    const added = toggleWishlist(product.id);
                    toast(added ? 'Saved to wishlist' : 'Removed from wishlist', {
                      icon: added ? '❤️' : '🤍',
                    });
                  }}
                  aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                  aria-pressed={wishlisted}
                  className={cn(
                    'grid h-14 w-14 shrink-0 place-items-center rounded-full border transition-all duration-300 hover:scale-105 active:scale-95',
                    wishlisted
                      ? 'border-transparent bg-primary text-white shadow-glow'
                      : 'border-line bg-white text-muted hover:border-secondary-300 hover:text-primary',
                  )}
                >
                  <Heart size={19} strokeWidth={2.2} fill={wishlisted ? 'currentColor' : 'none'} />
                </button>
              </div>

              {inCart > 0 ? (
                <p className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-2.5 text-xs font-semibold text-emerald-700">
                  <Check size={14} strokeWidth={2.8} />
                  {inCart} already in your basket
                </p>
              ) : null}
            </motion.div>

            {/* highlights */}
            <motion.ul variants={fadeUp} className="mt-6 grid gap-2.5">
              {product.highlights.map((line) => (
                <li key={line} className="flex items-start gap-3 text-[14px] leading-relaxed text-ink/80">
                  <Sparkles size={15} className="mt-0.5 shrink-0 text-secondary-500" strokeWidth={2.2} />
                  {line}
                </li>
              ))}
            </motion.ul>

            {/* live offer */}
            {featuredOffers[1] ? (
              <motion.div
                variants={fadeUp}
                className="mt-6 flex items-start gap-3 rounded-3xl border border-dashed border-secondary-300 bg-secondary-50/60 p-5"
              >
                <Info size={17} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.2} />
                <p className="text-[13px] leading-relaxed text-ink/80">
                  <strong className="font-semibold text-dark">{featuredOffers[1].code}</strong> —{' '}
                  {featuredOffers[1].title.toLowerCase()} on orders above{' '}
                  {formatPrice(featuredOffers[1].minOrder)}.{' '}
                  <Link to="/offers" className="font-semibold text-primary underline underline-offset-2">
                    See all offers
                  </Link>
                </p>
              </motion.div>
            ) : null}
          </motion.div>
        </div>

        {/* tabs */}
        <motion.div variants={fadeUp} {...inView} className="mt-12 max-w-4xl sm:mt-16">
          <Tabs
            tabs={[
              {
                id: 'about',
                label: 'About this cracker',
                content: (
                  <div className="space-y-5">
                    <p className="text-[15px] leading-[1.8] text-ink/80">{product.description}</p>
                    <ul className="grid gap-2.5 sm:grid-cols-2">
                      {product.highlights.map((line) => (
                        <li key={line} className="flex items-start gap-3 rounded-2xl bg-white/85 p-4 text-[13px] leading-relaxed text-ink/80">
                          <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" strokeWidth={2.8} />
                          {line}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {product.tags.map((tag) => (
                        <Badge key={tag} tone="soft">
                          {tag.replace(/-/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ),
              },
              { id: 'specs', label: 'Specifications', content: <SpecTable specs={product.specs} /> },
              { id: 'safety', label: 'Safety', content: <SafetyPanel product={product} /> },
              { id: 'delivery', label: 'Delivery', content: <DeliveryPanel /> },
            ]}
          />
        </motion.div>
      </div>

      {/* related */}
      {related.length ? (
        <Section spacing="sm" className="bg-gradient-to-b from-transparent via-white/50 to-transparent">
          <div className="container">
            <SectionHeading
              eyebrow="Goes well with"
              title="People usually add these too"
              className="pb-8"
            />
            <ProductGrid products={related} compact />
          </div>
        </Section>
      ) : null}
    </>
  );
};

export default ProductDetail;
