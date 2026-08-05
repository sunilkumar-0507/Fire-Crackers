import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  MapPin,
  Package,
  Phone,
  Truck,
  User,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { CHECKOUT_STEPS, DISTRICTS, PAYMENT_METHODS, BRAND } from '@/constants';
import { api } from '@/data';
import { formatPrice, addWorkingDays, formatDay } from '@/utils/format';
import { cartItemHref } from '@/utils/cart';
import { useCartStore, useCartTotals } from '@/store/cartStore';
import { EASE, fadeUp, stagger } from '@/animations/variants';
import PageHeader from '@/components/ui/PageHeader';
import CheckoutStepper from '@/components/cart/CheckoutStepper';
import ProductImage from '@/components/ui/ProductImage';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import CrackerArt from '@/components/ui/CrackerArt';

const inputClass =
  'h-12 w-full rounded-2xl border border-line bg-white px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-secondary-400';

const Field = ({ label, hint, error, children }) => (
  <label className="block">
    <span className="mb-2 flex items-baseline justify-between gap-3">
      <span className="text-2xs font-semibold uppercase tracking-[.14em] text-dark">{label}</span>
      {hint ? <span className="text-2xs text-muted">{hint}</span> : null}
    </span>
    {children}
    {error ? (
      <span className="mt-1.5 block text-2xs text-rose-600" role="alert">
        {error}
      </span>
    ) : null}
  </label>
);

const emptyForm = {
  name: '',
  phone: '',
  email: '',
  address: '',
  landmark: '',
  district: '',
  pincode: '',
  payment: 'upi',
};

/* Per-step validation. Returning a map keeps the caller free of branching. */
const validators = {
  0: (f) => {
    const e = {};
    if (!f.name.trim() || f.name.trim().length < 3) e.name = 'Your full name, please';
    if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\s|-/g, '')))
      e.phone = 'A 10-digit Indian mobile number';
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email)) e.email = 'That email looks wrong';
    return e;
  },
  1: (f) => {
    const e = {};
    if (!f.address.trim() || f.address.trim().length < 10)
      e.address = 'Door number, street and area — couriers need all three';
    if (!f.district) e.district = 'Pick a district';
    if (!/^\d{6}$/.test(f.pincode)) e.pincode = 'A 6-digit pincode';
    return e;
  },
  2: () => ({}),
  3: () => ({}),
};

/* ------------------------------ confirmation ------------------------------ */

const Confirmation = ({ order, totals }) => (
  <div className="container py-16">
    <motion.div
      variants={stagger(0.1)}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-2xl text-center"
    >
      {/* burst */}
      <motion.div variants={fadeUp} className="relative mx-auto grid h-40 w-40 place-items-center">
        <motion.span
          initial={{ scale: 0, opacity: 0.9 }}
          animate={{ scale: 2.6, opacity: 0 }}
          transition={{ duration: 1.3, ease: 'easeOut', repeat: 2, repeatDelay: 0.9 }}
          className="absolute inset-0 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(255,213,106,.8), transparent 70%)' }}
        />
        <motion.span
          initial={{ scale: 0.4, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16 }}
          className="relative grid h-24 w-24 place-items-center rounded-full bg-emerald-500 text-white shadow-lift"
        >
          <Check size={46} strokeWidth={3} />
        </motion.span>

        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i / 12) * Math.PI * 2;
          return (
            <motion.span
              key={i}
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: Math.cos(angle) * 90,
                y: Math.sin(angle) * 90,
                opacity: [0, 1, 0],
                scale: [0, 1, 0.4],
              }}
              transition={{ duration: 1.4, delay: 0.25 + i * 0.03, ease: 'easeOut' }}
              className="absolute h-2 w-2 rounded-full"
              style={{ background: i % 2 ? '#FF8A00' : '#FFD56A' }}
            />
          );
        })}
      </motion.div>

      <motion.p variants={fadeUp} className="mt-8 text-2xs font-semibold uppercase tracking-[.24em] text-emerald-600">
        Order confirmed
      </motion.p>

      <motion.h1 variants={fadeUp} className="mt-4 font-display text-display-sm font-semibold text-dark">
        That’s booked, {order.name.split(' ')[0]}
      </motion.h1>

      <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
        Order <strong className="font-semibold text-dark">{order.orderId}</strong> is with the
        packing team. We will send a despatch message to {order.phone} when it leaves the warehouse.
      </motion.p>

      <motion.dl
        variants={fadeUp}
        className="mx-auto mt-10 grid max-w-lg gap-px overflow-hidden rounded-4xl border border-line bg-line text-left sm:grid-cols-2"
      >
        {[
          { icon: Package, label: 'Order number', value: order.orderId },
          { icon: Truck, label: 'Expected delivery', value: `${formatDay(addWorkingDays(2))} – ${formatDay(addWorkingDays(4))}` },
          { icon: MapPin, label: 'Shipping to', value: `${order.district} ${order.pincode}` },
          { icon: Lock, label: 'Paid by', value: PAYMENT_METHODS.find((p) => p.id === order.payment)?.label },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3 bg-white px-5 py-5">
            <Icon size={16} className="mt-0.5 shrink-0 text-primary/70" strokeWidth={2.2} />
            <span>
              <dt className="text-2xs uppercase tracking-[.14em] text-muted">{label}</dt>
              <dd className="mt-1 text-sm font-semibold text-dark">{value}</dd>
            </span>
          </div>
        ))}
      </motion.dl>

      <motion.p variants={fadeUp} className="mx-auto mt-6 max-w-lg rounded-3xl bg-amber-50 p-5 text-[13px] leading-relaxed text-amber-800">
        Store the carton somewhere cool, dry and off the floor until the night — away from the
        kitchen and any electrical point. The safety card is printed inside the lid.
      </motion.p>

      <motion.p variants={fadeUp} className="mt-6 font-display text-xl font-semibold text-dark">
        Total paid {formatPrice(totals.total)}
        <span className="ml-2 text-sm font-normal text-emerald-600">
          you saved {formatPrice(totals.totalSavings)}
        </span>
      </motion.p>

      <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Button to="/products" size="lg" rightIcon={<ArrowRight size={17} />}>
          Keep shopping
        </Button>
        <Button href={BRAND.phoneHref} size="lg" variant="outline" leftIcon={<Phone size={16} />}>
          Call about this order
        </Button>
      </motion.div>
    </motion.div>
  </div>
);

/* --------------------------------- page ---------------------------------- */

export const Checkout = () => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const clearCart = useCartStore((s) => s.clearCart);
  const totals = useCartTotals();

  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  // Frozen at the moment of placing, so the receipt survives clearing the cart.
  const [placedTotals, setPlacedTotals] = useState(null);

  const set = useCallback(
    (key) => (event) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const next = () => {
    const found = validators[step](form);
    if (Object.keys(found).length) {
      setErrors(found);
      toast.error('Please fix the highlighted fields');
      return;
    }
    const target = Math.min(step + 1, CHECKOUT_STEPS.length - 1);
    setStep(target);
    setFurthest((f) => Math.max(f, target));
  };

  const place = async () => {
    setPlacing(true);
    setPlacedTotals(totals);
    const result = await api.placeOrder({ ...form, items, coupon: coupon?.code ?? null });
    setOrder(result);
    clearCart();
    setPlacing(false);
    toast.success('Order placed');
  };

  const deliveryWindow = useMemo(
    () => `${formatDay(addWorkingDays(2))} – ${formatDay(addWorkingDays(4))}`,
    [],
  );

  if (order) return <Confirmation order={order} totals={placedTotals ?? totals} />;

  if (!items.length) {
    return (
      <div className="container py-24">
        <EmptyState
          illustration="cart"
          title="There is nothing to check out"
          description="Your basket is empty. Pick a few crackers — or start from a combo box and be done in one click."
          action={<Button to="/products">Browse crackers</Button>}
          secondaryAction={
            <Button to="/combos" variant="outline">
              See combo packs
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Checkout"
        title="Nearly there"
        description="Four short steps. Nothing is charged in this demo — no payment details are collected or sent anywhere."
        breadcrumbs={[{ label: 'Checkout' }]}
      />

      <div className="container pb-16 sm:pb-20">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:gap-14">
          {/* form column */}
          <div>
            <CheckoutStepper
              current={step}
              furthest={furthest}
              onJump={setStep}
              className="mb-8 rounded-4xl border border-line bg-white/85 p-4 shadow-soft sm:mb-10 sm:p-7"
            />

            <div className="rounded-4xl border border-line bg-white/85 p-5 shadow-card sm:p-9">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.32, ease: EASE }}
                >
                  {/* ---------------- step 0: details ---------------- */}
                  {step === 0 ? (
                    <div className="grid gap-5">
                      <header className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-50 text-primary">
                          <User size={18} strokeWidth={2.2} />
                        </span>
                        <div>
                          <h2 className="font-display text-xl font-semibold text-dark">Your details</h2>
                          <p className="text-2xs text-muted">So the delivery person can find you</p>
                        </div>
                      </header>

                      <Field label="Full name" error={errors.name}>
                        <input
                          value={form.name}
                          onChange={set('name')}
                          placeholder="Meenakshi Raghavan"
                          autoComplete="name"
                          className={cn(inputClass, errors.name && 'border-rose-300')}
                        />
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="Phone" hint="For despatch updates" error={errors.phone}>
                          <input
                            value={form.phone}
                            onChange={set('phone')}
                            placeholder="98420 11994"
                            inputMode="tel"
                            autoComplete="tel"
                            className={cn(inputClass, errors.phone && 'border-rose-300')}
                          />
                        </Field>

                        <Field label="Email" hint="Optional" error={errors.email}>
                          <input
                            value={form.email}
                            onChange={set('email')}
                            placeholder="you@example.com"
                            inputMode="email"
                            autoComplete="email"
                            className={cn(inputClass, errors.email && 'border-rose-300')}
                          />
                        </Field>
                      </div>
                    </div>
                  ) : null}

                  {/* ---------------- step 1: address ---------------- */}
                  {step === 1 ? (
                    <div className="grid gap-5">
                      <header className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-50 text-primary">
                          <MapPin size={18} strokeWidth={2.2} />
                        </span>
                        <div>
                          <h2 className="font-display text-xl font-semibold text-dark">Delivery address</h2>
                          <p className="text-2xs text-muted">Arrives {deliveryWindow}</p>
                        </div>
                      </header>

                      <Field label="Address" hint="Door no, street, area" error={errors.address}>
                        <textarea
                          value={form.address}
                          onChange={set('address')}
                          rows={3}
                          placeholder="12/4 Ganapathy Nagar, 2nd Street, Adambakkam"
                          autoComplete="street-address"
                          className={cn(
                            'w-full resize-none rounded-2xl border border-line bg-white p-4 text-sm text-ink outline-none transition-colors placeholder:text-muted/60 focus:border-secondary-400',
                            errors.address && 'border-rose-300',
                          )}
                        />
                      </Field>

                      <Field label="Landmark" hint="Optional">
                        <input
                          value={form.landmark}
                          onChange={set('landmark')}
                          placeholder="Opposite the temple"
                          className={inputClass}
                        />
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="District" error={errors.district}>
                          <select
                            value={form.district}
                            onChange={set('district')}
                            className={cn(inputClass, 'cursor-pointer', errors.district && 'border-rose-300')}
                          >
                            <option value="">Select a district</option>
                            {DISTRICTS.map((district) => (
                              <option key={district} value={district}>
                                {district}
                              </option>
                            ))}
                          </select>
                        </Field>

                        <Field label="Pincode" error={errors.pincode}>
                          <input
                            value={form.pincode}
                            onChange={set('pincode')}
                            placeholder="600088"
                            inputMode="numeric"
                            maxLength={6}
                            autoComplete="postal-code"
                            className={cn(inputClass, errors.pincode && 'border-rose-300')}
                          />
                        </Field>
                      </div>
                    </div>
                  ) : null}

                  {/* ---------------- step 2: payment ---------------- */}
                  {step === 2 ? (
                    <div className="grid gap-5">
                      <header className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-50 text-primary">
                          <Lock size={18} strokeWidth={2.2} />
                        </span>
                        <div>
                          <h2 className="font-display text-xl font-semibold text-dark">Payment method</h2>
                          <p className="text-2xs text-muted">Nothing is charged — this is a demo</p>
                        </div>
                      </header>

                      <div className="grid gap-3">
                        {PAYMENT_METHODS.map((method) => {
                          const disabled = method.id === 'cod' && totals.total > 5000;
                          const selected = form.payment === method.id;

                          return (
                            <label
                              key={method.id}
                              className={cn(
                                'flex cursor-pointer items-center gap-3.5 rounded-3xl border p-4 transition-all duration-300 sm:gap-4 sm:p-5',
                                selected
                                  ? 'border-primary bg-secondary-50/70 shadow-soft'
                                  : 'border-line bg-white hover:border-secondary-300',
                                disabled && 'cursor-not-allowed opacity-45',
                              )}
                            >
                              <input
                                type="radio"
                                name="payment"
                                value={method.id}
                                checked={selected}
                                disabled={disabled}
                                onChange={set('payment')}
                                className="h-4 w-4 shrink-0 accent-primary"
                              />
                              <span className="flex-1">
                                <span className="block text-sm font-semibold text-dark">{method.label}</span>
                                <span className="mt-0.5 block text-2xs text-muted">
                                  {disabled ? 'Not available above ₹5,000' : method.hint}
                                </span>
                              </span>
                              {selected ? <Check size={17} className="shrink-0 text-primary" strokeWidth={2.8} /> : null}
                            </label>
                          );
                        })}
                      </div>

                      <p className="flex items-start gap-3 rounded-2xl bg-secondary-50/70 p-4 text-2xs leading-relaxed text-muted">
                        <Lock size={14} className="mt-0.5 shrink-0 text-primary" strokeWidth={2.2} />
                        This is a frontend demonstration. No card, UPI or bank detail is requested,
                        stored or transmitted anywhere.
                      </p>
                    </div>
                  ) : null}

                  {/* ---------------- step 3: review ---------------- */}
                  {step === 3 ? (
                    <div className="grid gap-6">
                      <header className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-50 text-primary">
                          <Package size={18} strokeWidth={2.2} />
                        </span>
                        <div>
                          <h2 className="font-display text-xl font-semibold text-dark">Review and place</h2>
                          <p className="text-2xs text-muted">Last look before it goes to packing</p>
                        </div>
                      </header>

                      <dl className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2">
                        {[
                          ['Name', form.name],
                          ['Phone', form.phone],
                          ['Address', `${form.address}${form.landmark ? `, ${form.landmark}` : ''}`],
                          ['District', `${form.district} — ${form.pincode}`],
                          ['Payment', PAYMENT_METHODS.find((p) => p.id === form.payment)?.label],
                          ['Delivery', deliveryWindow],
                        ].map(([label, value]) => (
                          <div key={label} className="bg-white px-4 py-3.5 sm:px-5 sm:py-4">
                            <dt className="text-2xs uppercase tracking-[.14em] text-muted">{label}</dt>
                            <dd className="mt-1 break-words text-sm font-medium text-dark">{value}</dd>
                          </div>
                        ))}
                      </dl>

                      <div className="flex flex-wrap gap-3">
                        <Button variant="ghost" size="sm" onClick={() => setStep(0)}>
                          Edit details
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                          Edit address
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                          Change payment
                        </Button>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>

              {/* Nav. Stacked on a phone — "Back" plus a 220px priced
                  "Place order" is wider than a 360px screen side by side, and
                  the primary action belongs above the thumb, not beside it. */}
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:mt-9 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-7">
                <Button
                  variant="ghost"
                  onClick={() => (step === 0 ? navigate(-1) : setStep(step - 1))}
                  leftIcon={<ArrowLeft size={16} />}
                >
                  {step === 0 ? 'Back to shop' : 'Back'}
                </Button>

                {step < CHECKOUT_STEPS.length - 1 ? (
                  <Button
                    onClick={next}
                    size="lg"
                    className="w-full sm:w-auto"
                    rightIcon={<ArrowRight size={17} />}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    onClick={place}
                    size="lg"
                    loading={placing}
                    className="w-full px-5 sm:w-auto sm:min-w-[220px] sm:px-8"
                  >
                    {placing ? 'Placing your order…' : `Place order — ${formatPrice(totals.total)}`}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* summary rail */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-4xl border border-line bg-white/90 shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6 sm:py-5">
                <h2 className="font-display text-lg font-semibold text-dark">Order summary</h2>
                <span className="rounded-full bg-secondary-50 px-3 py-1 text-2xs font-semibold text-primary">
                  {totals.count} item{totals.count === 1 ? '' : 's'}
                </span>
              </div>

              <ul className="hide-scrollbar max-h-[320px] divide-y divide-line overflow-y-auto">
                {items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3.5 px-5 py-4 sm:px-6">
                    <Link
                      to={cartItemHref(item)}
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-secondary-50 to-white p-1.5"
                    >
                      <ProductImage source={item.image} alt={item.name} className="h-full w-full" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium text-dark">{item.name}</p>
                      <p className="mt-0.5 text-2xs text-muted">Qty {item.qty}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-dark">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="space-y-2.5 border-t border-line px-5 py-5 text-sm sm:px-6">
                <div className="flex justify-between text-muted">
                  <dt>Subtotal</dt>
                  <dd className="tabular-nums text-ink">{formatPrice(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <dt>Catalogue discount</dt>
                  <dd className="tabular-nums">−{formatPrice(totals.catalogueSavings)}</dd>
                </div>
                {totals.couponDiscount > 0 ? (
                  <div className="flex justify-between text-emerald-600">
                    <dt>Coupon {coupon?.code}</dt>
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
                <div className="flex items-baseline justify-between border-t border-line pt-3.5">
                  <dt className="font-display text-lg font-semibold text-dark">Total</dt>
                  <dd className="font-display text-2xl font-semibold text-dark tabular-nums">
                    {formatPrice(totals.total)}
                  </dd>
                </div>
              </dl>

              <div className="flex items-center gap-3 border-t border-line bg-secondary-50/50 px-5 py-4 sm:px-6">
                <CrackerArt type="giftbox" variant={1} className="h-10 w-10 shrink-0" />
                <p className="text-2xs leading-relaxed text-muted">
                  You are saving{' '}
                  <strong className="font-semibold text-emerald-600">
                    {formatPrice(totals.totalSavings)}
                  </strong>{' '}
                  against printed MRP on this order.
                </p>
              </div>
            </div>

            <p className="mt-5 flex items-start gap-2.5 px-2 text-2xs leading-relaxed text-muted">
              <Truck size={14} className="mt-0.5 shrink-0 text-primary/70" strokeWidth={2.2} />
              Fireworks travel by licensed surface transport only. Arrives {deliveryWindow}.
            </p>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Checkout;
