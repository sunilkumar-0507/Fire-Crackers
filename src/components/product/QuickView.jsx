import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { formatPrice, stockLevel } from '@/utils/format';
import { toCartItem } from '@/utils/cart';
import { artForCategory } from '@/utils/image';
import { useCartStore } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Badge, { StockBadge } from '@/components/ui/Badge';
import Rating from '@/components/ui/Rating';
import QtyStepper from '@/components/ui/QtyStepper';
import ProductImage from '@/components/ui/ProductImage';

/**
 * Quick view. Everything needed to decide and add, without leaving the grid —
 * gallery, price, stock, key specs — with the full detail page one click away.
 */
export const QuickView = () => {
  const product = useUIStore((s) => s.quickView);
  const close = useUIStore((s) => s.closeQuickView);
  const addItem = useCartStore((s) => s.addItem);

  const [qty, setQty] = useState(1);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setQty(1);
    setActive(0);
  }, [product?.id]);

  if (!product) return <Modal open={false} onClose={close} />;

  const level = stockLevel(product.stock);
  const soldOut = product.stock <= 0;
  const fallback = artForCategory(product.category);

  const add = () => {
    const { added, capped } = addItem(toCartItem(product), qty);
    if (added > 0) toast.success(`${added} × ${product.name} added`);
    else if (capped) toast(`Only ${product.stock} in stock`, { icon: '⚠️' });
    close();
  };

  return (
    <Modal open onClose={close} label={product.name} className="max-w-4xl">
      <div className="grid gap-0 md:grid-cols-2">
        {/* gallery — the square is capped on a phone so the panel does not open
            with the whole viewport taken up by an illustration. */}
        <div className="relative bg-gradient-to-br from-secondary-50 via-white to-secondary-50/50 p-4 sm:p-8">
          <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-1.5 sm:left-6 sm:top-6">
            <Badge tone="flame">{product.discount}% off</Badge>
            {product.isNew ? <Badge tone="gold">New</Badge> : null}
          </div>

          <div className="mx-auto grid aspect-square w-full max-w-[240px] place-items-center sm:max-w-none">
            <ProductImage
              source={product.images[active]}
              alt={product.name}
              fallbackType={fallback}
              className="h-full w-full"
            />
          </div>

          <div className="hide-scrollbar mt-4 flex justify-center gap-2 overflow-x-auto sm:gap-2.5">
            {product.images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1}`}
                aria-current={index === active}
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 bg-white/70 p-1.5 transition-all duration-300 sm:h-16 sm:w-16 ${
                  index === active
                    ? 'border-primary shadow-soft'
                    : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <ProductImage source={image} alt="" fallbackType={fallback} className="h-full w-full" />
              </button>
            ))}
          </div>
        </div>

        {/* details */}
        <div className="flex flex-col gap-4 p-5 sm:p-8">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[.18em] text-primary/70">
              {product.brand}
            </p>
            <h2 className="mt-2 max-w-[calc(100%-2.5rem)] font-display text-xl font-semibold leading-tight text-dark sm:max-w-none sm:text-[28px]">
              {product.name}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Rating value={product.rating} reviews={product.reviews} />
              <StockBadge level={level} />
            </div>
          </div>

          <p className="line-clamp-4 text-[15px] leading-relaxed text-muted">{product.description}</p>

          <div className="flex flex-wrap items-end gap-x-3 gap-y-1 rounded-2xl bg-secondary-50/70 px-4 py-4 sm:px-5">
            <span className="font-display text-2xl font-semibold text-dark sm:text-3xl">
              {formatPrice(product.price)}
            </span>
            <span className="pb-1 text-sm text-muted line-through">{formatPrice(product.mrp)}</span>
            <span className="ml-auto pb-1 text-xs font-semibold text-emerald-600">
              Save {formatPrice(product.mrp - product.price)}
            </span>
          </div>

          <ul className="grid gap-2">
            {product.highlights.slice(0, 3).map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-[13px] text-ink/80">
                <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" strokeWidth={2.6} />
                {line}
              </li>
            ))}
          </ul>

          <div className="mt-auto space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <QtyStepper value={qty} onChange={setQty} max={Math.max(1, product.stock)} />
              <Button onClick={add} disabled={soldOut} className="min-w-0 flex-1 px-4 sm:px-6">
                {soldOut ? 'Out of stock' : `Add — ${formatPrice(product.price * qty)}`}
              </Button>
            </div>

            <Link
              to={`/product/${product.slug}`}
              onClick={close}
              className="group flex items-center justify-center gap-2 text-sm font-semibold text-primary"
            >
              Full details, specs and safety notes
              <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>

            <p className="flex items-center justify-center gap-2 text-2xs text-muted">
              <ShieldCheck size={13} className="text-emerald-500" />
              PESO-tested batch · ships in 48 hours
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuickView;
