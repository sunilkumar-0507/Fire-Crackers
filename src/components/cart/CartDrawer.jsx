import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ArrowRight, Tag, Trash2, Truck, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SHIPPING } from '@/constants';
import { formatPrice } from '@/utils/format';
import { cartItemHref } from '@/utils/cart';
import { useCartStore, useCartTotals } from '@/store/cartStore';
import { useUIStore } from '@/store/uiStore';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { backdrop, drawerRight, listItem } from '@/animations/variants';
import ProductImage from '@/components/ui/ProductImage';
import QtyStepper from '@/components/ui/QtyStepper';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

/* ------------------------------ line item -------------------------------- */

const CartLine = ({ item, onClose }) => {
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <motion.li
      layout
      variants={listItem}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex gap-3 rounded-3xl border border-line bg-white p-3 shadow-soft sm:gap-4"
    >
      <Link
        to={cartItemHref(item)}
        onClick={onClose}
        className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-secondary-50 to-white p-2 xs:h-20 xs:w-20"
      >
        <ProductImage source={item.image} alt={item.name} className="h-full w-full" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start gap-2">
          <Link
            to={cartItemHref(item)}
            onClick={onClose}
            className="line-clamp-2 flex-1 text-sm font-semibold leading-snug text-dark transition-colors hover:text-primary"
          >
            {item.name}
          </Link>
          <button
            type="button"
            onClick={() => {
              removeItem(item.id);
              toast('Removed from basket', { icon: '🗑️', id: `rm-${item.id}` });
            }}
            aria-label={`Remove ${item.name}`}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition-all duration-300 hover:bg-rose-50 hover:text-rose-500 active:scale-90"
          >
            <Trash2 size={14} strokeWidth={2.2} />
          </button>
        </div>

        <p className="mt-0.5 truncate text-2xs text-muted">{item.unit}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <QtyStepper
            size="sm"
            value={item.qty}
            onChange={(next) => setQty(item.id, next)}
            max={Math.max(1, item.stock ?? 99)}
          />
          <div className="text-right">
            <p className="text-sm font-semibold text-dark">{formatPrice(item.price * item.qty)}</p>
            {item.mrp > item.price ? (
              <p className="text-2xs text-muted line-through">{formatPrice(item.mrp * item.qty)}</p>
            ) : null}
          </div>
        </div>
      </div>
    </motion.li>
  );
};

/* ------------------------------- coupon ---------------------------------- */

const CouponBox = () => {
  const coupon = useCartStore((s) => s.coupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  if (coupon) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <Tag size={15} className="shrink-0 text-emerald-600" strokeWidth={2.2} />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-emerald-800">{coupon.code} applied</p>
          <p className="truncate text-2xs text-emerald-700/80">{coupon.note}</p>
        </div>
        <button
          type="button"
          onClick={() => removeCoupon()}
          className="shrink-0 text-2xs font-semibold text-emerald-700 underline underline-offset-2 hover:text-emerald-900"
        >
          Remove
        </button>
      </div>
    );
  }

  const submit = (event) => {
    event.preventDefault();
    const result = applyCoupon(code);
    if (result.ok) {
      toast.success(`${code.toUpperCase()} applied`);
      setCode('');
      setError('');
    } else {
      setError(result.message);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            placeholder="Coupon code"
            aria-label="Coupon code"
            className="h-11 w-full rounded-2xl border border-line bg-white pl-10 pr-3 text-sm uppercase tracking-wide text-ink outline-none transition-colors placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/70 focus:border-secondary-300"
          />
        </div>
        <Button type="submit" size="sm" variant="outline" className="h-11 shrink-0 px-5" onClick={submit}>
          Apply
        </Button>
      </div>
      {error ? <p className="mt-2 pl-1 text-2xs text-rose-600">{error}</p> : null}
      {!error ? (
        <p className="mt-2 pl-1 text-2xs text-muted">
          Try <button type="button" onClick={() => setCode('EARLYBIRD')} className="font-semibold text-primary underline underline-offset-2">EARLYBIRD</button> or{' '}
          <button type="button" onClick={() => setCode('COMBO500')} className="font-semibold text-primary underline underline-offset-2">COMBO500</button>
        </p>
      ) : null}
    </form>
  );
};

/* ------------------------------- drawer ---------------------------------- */

export const CartDrawer = () => {
  const open = useUIStore((s) => s.cartOpen);
  const close = useUIStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const totals = useCartTotals();

  useLockBodyScroll(open);

  const shippingProgress = Math.min(
    100,
    ((SHIPPING.freeAbove - totals.freeShippingGap) / SHIPPING.freeAbove) * 100,
  );

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            variants={backdrop}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={close}
            className="absolute inset-0 bg-dark/45 backdrop-blur-md"
          />

          <motion.aside
            variants={drawerRight}
            initial="hidden"
            animate="show"
            exit="exit"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping basket"
            className="absolute inset-y-0 right-0 flex w-[min(94vw,470px)] flex-col bg-bg shadow-lift"
          >
            {/* header */}
            <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6 sm:py-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-dark">Your basket</h2>
                <p className="mt-0.5 text-2xs text-muted">
                  {totals.count} item{totals.count === 1 ? '' : 's'}
                  {totals.totalSavings > 0 ? ` · saving ${formatPrice(totals.totalSavings)}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close basket"
                className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink shadow-soft transition-transform duration-300 hover:rotate-90 hover:text-primary"
              >
                <X size={18} strokeWidth={2.4} />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 items-center justify-center">
                <EmptyState
                  illustration="cart"
                  title="Your basket is empty"
                  description="Forty-three kinds of light, colour and noise are waiting. Start with a combo pack if you want it decided for you."
                  action={
                    <Button to="/products" onClick={close} rightIcon={<ArrowRight size={16} />}>
                      Browse crackers
                    </Button>
                  }
                  secondaryAction={
                    <Button to="/combos" onClick={close} variant="outline">
                      See combos
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                {/* free shipping progress */}
                <div className="border-b border-line bg-white/60 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-2.5 text-xs">
                    <Truck size={15} className="shrink-0 text-primary" strokeWidth={2.2} />
                    {totals.freeShippingGap > 0 ? (
                      <span className="text-ink/80">
                        Add <strong className="font-semibold text-primary">{formatPrice(totals.freeShippingGap)}</strong> for free delivery
                      </span>
                    ) : (
                      <span className="font-semibold text-emerald-600">
                        Free delivery unlocked
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary-100">
                    <motion.div
                      initial={false}
                      animate={{ width: `${shippingProgress}%` }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className={cn(
                        'h-full rounded-full',
                        totals.freeShippingGap > 0 ? 'bg-flame' : 'bg-emerald-500',
                      )}
                    />
                  </div>
                </div>

                {/* lines */}
                <div className="hide-scrollbar flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                  <motion.ul layout className="flex flex-col gap-3">
                    <AnimatePresence initial={false} mode="popLayout">
                      {items.map((item) => (
                        <CartLine key={item.id} item={item} onClose={close} />
                      ))}
                    </AnimatePresence>
                  </motion.ul>

                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      toast('Basket cleared', { icon: '🧹' });
                    }}
                    className="mx-auto mt-5 block text-2xs font-semibold text-muted underline underline-offset-4 transition-colors hover:text-rose-500"
                  >
                    Clear basket
                  </button>
                </div>

                {/* summary */}
                <footer className="space-y-4 border-t border-line bg-white/70 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-6">
                  <CouponBox />

                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between text-muted">
                      <dt>Subtotal</dt>
                      <dd className="tabular-nums text-ink">{formatPrice(totals.subtotal)}</dd>
                    </div>
                    {totals.couponDiscount > 0 ? (
                      <div className="flex justify-between text-emerald-600">
                        <dt>Coupon discount</dt>
                        <dd className="tabular-nums">−{formatPrice(totals.couponDiscount)}</dd>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-muted">
                      <dt>Delivery</dt>
                      <dd className="tabular-nums">
                        {totals.shipping === 0 ? (
                          <span className="font-semibold text-emerald-600">Free</span>
                        ) : (
                          formatPrice(totals.shipping)
                        )}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between border-t border-line pt-3">
                      <dt className="font-display text-lg font-semibold text-dark">Total</dt>
                      <dd className="font-display text-2xl font-semibold text-dark tabular-nums">
                        {formatPrice(totals.total)}
                      </dd>
                    </div>
                  </dl>

                  <Button
                    to="/checkout"
                    onClick={close}
                    size="lg"
                    className="w-full"
                    rightIcon={<ArrowRight size={17} />}
                  >
                    Checkout
                  </Button>

                  <p className="text-center text-2xs text-muted">
                    Licensed surface transport · delivered in 48–72 hours
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};

export default CartDrawer;
