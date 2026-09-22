import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Clock,
  Info,
  Lock,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Truck,
  User,
} from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import {
  CHECKOUT_STEPS,
  DISTRICTS,
  FULFILMENT_METHODS,
  PAYMENT_METHODS,
  PAYMENTS,
  PICKUP,
  STORAGE_KEYS,
  BRAND,
} from '@/constants';
import { api } from '@/lib/api';
import { openCashfreeCheckout } from '@/lib/cashfree';
import { analytics, analyticsSession } from '@/lib/analytics';
import { whatsappHref, orderMessage } from '@/utils/whatsapp';
import { formatPrice, addWorkingDays, formatDay } from '@/utils/format';
import { cartItemHref } from '@/utils/cart';
import { useCartStore, useCartTotals } from '@/store/cartStore';
import PageHeader from '@/components/ui/PageHeader';
import CheckoutStepper from '@/components/cart/CheckoutStepper';
import ProductImage from '@/components/ui/ProductImage';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';

const inputClass =
  'h-12 w-full rounded-2xl border border-line bg-card px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-secondary-400';

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
  fulfilment: 'delivery',
  address: '',
  landmark: '',
  city: '',
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
  // A collection order has nowhere to deliver to, so there is nothing here to
  // check beyond the choice itself. The API applies the same rule.
  1: (f) => {
    const e = {};
    if (f.fulfilment === 'pickup') return e;

    if (!f.address.trim() || f.address.trim().length < 10)
      e.address = 'Door number, street and area — couriers need all three';
    if (!f.city.trim()) e.city = 'Which city or town?';
    if (!f.district) e.district = 'Pick a district';
    if (!/^\d{6}$/.test(f.pincode)) e.pincode = 'A 6-digit pincode';
    return e;
  },
  2: () => ({}),
  3: () => ({}),
};

/* ------------------------------ confirmation ------------------------------ */

const Confirmation = ({ order, totals }) => {
  const pickup = order.fulfilment === 'pickup';

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl text-center">
        {/* burst */}
        <div className="relative mx-auto grid h-40 w-40 place-items-center">
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(255,213,106,.8), transparent 70%)' }}
          />
          <span className="relative grid h-24 w-24 place-items-center rounded-full bg-emerald-500 text-white shadow-lift">
            <Check size={46} />
          </span>
        </div>

        <p className="mt-8 text-2xs font-semibold uppercase tracking-[.24em] text-emerald-600">
          Order received
        </p>

        <h1 className="mt-4 font-display text-display-sm font-semibold text-dark">
          That’s booked, {order.name.split(' ')[0]}
        </h1>

        {/* The reference number is the single most useful thing on this screen:
            it is what every later conversation with the shop hangs off. So it
            gets its own block rather than being a bold word inside a sentence. */}
        <div className="mx-auto mt-8 max-w-sm rounded-4xl border border-line bg-card px-6 py-5 shadow-card">
          <p className="text-2xs uppercase tracking-[.16em] text-muted">Your reference</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-wide text-dark">
            {order.orderId}
          </p>
          <p className="mt-2 text-2xs leading-relaxed text-muted">
            Keep this. It is how we find your order.
          </p>
        </div>

        <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-muted">
          {pickup
            ? `We will message ${order.phone} when it is packed and waiting at the counter.`
            : `We will send a despatch message to ${order.phone} when it leaves the warehouse.`}
        </p>

        <dl className="mx-auto mt-10 grid max-w-lg gap-px overflow-hidden rounded-4xl border border-line bg-line text-left sm:grid-cols-2">
          {[
            { icon: Package, label: 'Order number', value: order.orderId },
            {
              icon: pickup ? Clock : Truck,
              label: pickup ? 'Ready to collect' : 'Expected delivery',
              value: pickup
                ? formatDay(new Date(order.deliveryFrom))
                : `${formatDay(new Date(order.deliveryFrom))} – ${formatDay(new Date(order.deliveryTo))}`,
            },
            {
              icon: pickup ? Building2 : MapPin,
              label: pickup ? 'Collect from' : 'Shipping to',
              value: pickup ? 'Sivakasi counter' : `${order.district} ${order.pincode}`,
            },
            {
              icon: Lock,
              label: 'Paid by',
              value: PAYMENT_METHODS.find((p) => p.id === order.payment)?.label,
            },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 bg-card px-5 py-5">
              <Icon size={16} className="mt-0.5 shrink-0 text-primary" />
              <span>
                <dt className="text-2xs uppercase tracking-[.14em] text-muted">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-dark">{value}</dd>
              </span>
            </div>
          ))}
        </dl>

        <p className="mx-auto mt-6 max-w-lg rounded-3xl bg-amber-50 p-5 text-[13px] leading-relaxed text-amber-800">
          {pickup
            ? `Collect from ${PICKUP.address}. ${PICKUP.hours}. Bring this reference and the number you booked with.`
            : 'Store the carton somewhere cool, dry and off the floor until the night — away from the kitchen and any electrical point. The safety card is printed inside the lid.'}
        </p>

        <p className="mt-6 font-display text-xl font-semibold text-dark">
          Total {formatPrice(totals.total)}
          <span className="ml-2 text-sm font-normal text-emerald-600">
            you saved {formatPrice(totals.totalSavings)}
          </span>
        </p>

        {/* The WhatsApp send is the primary action: it gives the customer a
            copy of the confirmation in the app they already live in, and gives
            the shop its first notice of the order on the same thread. */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button
            href={whatsappHref(orderMessage(order))}
            size="lg"
            leftIcon={<MessageCircle size={17} />}
            onClick={() => analytics.whatsappClick('confirmation')}
          >
            Send confirmation on WhatsApp
          </Button>
          <Button
            to={`/track?ref=${order.orderId}`}
            size="lg"
            variant="outline"
            rightIcon={<ArrowRight size={17} />}
          >
            Track this order
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <Button to="/products" variant="ghost">
            Keep shopping
          </Button>
          <Button href={BRAND.phoneHref} variant="ghost" leftIcon={<Phone size={15} />}>
            Call about this order
          </Button>
        </div>
      </div>
    </div>
  );
};

/* --------------------------------- page ---------------------------------- */

export const Checkout = () => {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const clearCart = useCartStore((s) => s.clearCart);
  const cartTotals = useCartTotals();

  const [step, setStep] = useState(0);
  const [furthest, setFurthest] = useState(0);
  // Default to a method the shop can actually take. With no gateway configured
  // the online options are filtered out below, and a form still holding `upi`
  // would place an order nobody ever charged.
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    payment: PAYMENTS.enabled ? emptyForm.payment : 'cod',
  }));
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [order, setOrder] = useState(null);
  // Frozen at the moment of placing, so the receipt survives clearing the cart.
  const [placedTotals, setPlacedTotals] = useState(null);
  // The API's price for this basket. Null until the first quote lands, and
  // again whenever one fails — both mean "show the local sum instead".
  const [quote, setQuote] = useState(null);

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

  const pickup = form.fulfilment === 'pickup';

  /**
   * Collection is free, and the cart store has no idea which the customer
   * picked — it prices a basket, not a fulfilment. Rather than thread state
   * through the store for something only this page cares about, the delivery
   * line is dropped here. The API re-prices the whole basket on submit anyway,
   * so this figure is a preview of its answer, never the source of it.
   */
  const localTotals = useMemo(
    () =>
      pickup
        ? {
            ...cartTotals,
            shipping: 0,
            total: cartTotals.total - cartTotals.shipping,
            freeShippingGap: 0,
          }
        : cartTotals,
    [cartTotals, pickup],
  );

  /**
   * Re-price the basket through the API whenever it, the coupon or the
   * fulfilment changes.
   *
   * The same service prices `POST /api/orders`, so this is a preview of the
   * real answer rather than a second implementation of it — a line quietly
   * capped to stock, or a coupon that stopped qualifying, now shows on the
   * summary before the customer commits instead of surprising them on the
   * receipt. A failure is not fatal: the local sum is a good enough preview,
   * and the API is still the authority at the moment of placing.
   */
  useEffect(() => {
    if (!items.length) {
      setQuote(null);
      return undefined;
    }

    const controller = new AbortController();

    api
      .quote(
        {
          items: items.map((line) => ({ id: line.id, qty: line.qty })),
          coupon: coupon?.code ?? null,
          fulfilment: form.fulfilment,
        },
        controller.signal,
      )
      .then(setQuote)
      .catch((error) => {
        if (error?.name !== 'AbortError') setQuote(null);
      });

    return () => controller.abort();
  }, [items, coupon?.code, form.fulfilment]);

  /** The API's figures when we have them, the local sum until then. */
  const totals = quote?.totals ?? localTotals;

  /** What the API changed about the basket, if anything, in its own words. */
  const notices = quote?.notices ?? [];

  /**
   * The methods this shop can actually take money through.
   *
   * With no payment gateway configured, every online method would be a promise
   * the shop cannot keep — the order would be placed and nothing charged, and
   * the customer would believe they had paid. Cash on delivery is the honest
   * remainder, and it is what the shop has always run on.
   */
  const payableMethods = useMemo(
    () => (PAYMENTS.enabled ? PAYMENT_METHODS : PAYMENT_METHODS.filter((m) => m.id === 'cod')),
    [],
  );

  /**
   * The lines to show on the summary. The API's when we have them — they carry
   * the quantity it will actually charge for — so a capped row cannot read
   * "Qty 200 · ₹2,000" above a ₹740 subtotal.
   */
  const lines = quote?.items ?? items;

  // One event per visit to the checkout, not one per step.
  useEffect(() => {
    analytics.checkoutStart(cartTotals);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const place = async () => {
    setPlacing(true);
    setPlacedTotals(totals);


    try {
      const result = await api.placeOrder({
        name: form.name,
        phone: form.phone,
        // An untouched optional field is an empty string in the DOM, and the
        // API validates `email` as an address whenever one is present. Send
        // null so "left blank" reads as absent rather than as a bad address.
        email: form.email.trim() || null,
        fulfilment: form.fulfilment,
        // A collection order has no delivery address. Sending the half-typed
        // remains of one would be worse than sending nothing: the API would
        // validate it, and the customer would be held up by a pincode for an
        // address nothing is going to.
        address: pickup ? null : form.address,
        city: pickup ? null : form.city,
        district: pickup ? null : form.district,
        pincode: pickup ? null : form.pincode,
        payment: form.payment,
        // The API prices the basket itself from ids and quantities, so the
        // confirmation total is its own rather than one the browser sent.
        items: items.map((line) => ({ id: line.id, qty: line.qty })),
        notes: !pickup && form.landmark ? `Landmark: ${form.landmark}` : null,
        coupon: coupon?.code ?? null,
        // The API records the order_placed event itself, so it cannot be lost
        // to a closed tab or a blocked request. Sending the session id is what
        // lets it attribute the order to this visit in the funnel.
        session: analyticsSession(),
      });

      // Cash on delivery is settled at the door, and a shop with no merchant
      // account has no other option — either way the receipt is the next thing
      // the customer sees, exactly as before.
      const payOnline = PAYMENTS.enabled && form.payment !== 'cod';

      if (payOnline) {
        // The order is real and saved before any of this. If the payment page
        // fails to open, or the customer closes it, the shop still has a
        // booking to chase rather than a lost sale.
        try {
          sessionStorage.setItem(STORAGE_KEYS.paymentPhone, form.phone.trim());
        } catch {
          /* Private mode — the return page will ask for the number instead. */
        }

        const session = await api.paymentSession(result.orderId, form.phone.trim());
        clearCart();
        await openCashfreeCheckout(session.paymentSessionId, session.mode);
        return;
      }

      setOrder(result);
      clearCart();
      toast.success('Order placed');
    } catch (error) {
      setPlacedTotals(null);
      toast.error(error.message);
    } finally {
      setPlacing(false);
    }
  };

  const deliveryWindow = useMemo(
    () => `${formatDay(addWorkingDays(2))} – ${formatDay(addWorkingDays(4))}`,
    [],
  );

  // The API's own totals are authoritative — it re-priced the basket and may
  // legitimately disagree with the preview (a line capped to stock, a coupon
  // that stopped qualifying). Fall back to the frozen local copy only if the
  // response somehow arrived without them.
  if (order) return <Confirmation order={order} totals={order.totals ?? placedTotals ?? totals} />;

  if (!items.length) {
    return (
      <div className="container py-24">
        <EmptyState
          as="h1"
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
        description={
          PAYMENTS.enabled
            ? 'Four short steps. Payment is taken on the provider’s own secure page — no card details ever reach this site.'
            : 'Four short steps. This shop settles on delivery or at the counter, so no payment details are collected here.'
        }
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
              className="mb-8 rounded-4xl border border-line bg-card p-4 shadow-soft sm:mb-10 sm:p-7"
            />

            <div className="rounded-4xl border border-line bg-card p-5 shadow-card sm:p-9">
              {/* ---------------- step 0: details ---------------- */}
              {step === 0 ? (
                <div className="grid gap-5">
                  <header className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-50 text-primary">
                      <User size={18} />
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
                      placeholder="Your full name"
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

              {/* ------------- step 1: delivery or collection ------------- */}
              {step === 1 ? (
                <div className="grid gap-5">
                  <header className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-50 text-primary">
                      <Truck size={18} />
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-semibold text-dark">
                        How would you like it?
                      </h2>
                      <p className="text-2xs text-muted">
                        {pickup ? 'Collect from Sivakasi' : `Arrives ${deliveryWindow}`}
                      </p>
                    </div>
                  </header>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {FULFILMENT_METHODS.map((method) => {
                      const selected = form.fulfilment === method.id;
                      const Icon = method.id === 'pickup' ? Building2 : Truck;

                      return (
                        <label
                          key={method.id}
                          className={cn(
                            'flex cursor-pointer items-start gap-3.5 rounded-3xl border p-4 transition-all duration-300 sm:p-5',
                            selected
                              ? 'border-primary bg-secondary-50/70 shadow-soft'
                              : 'border-line bg-card hover:border-secondary-300',
                          )}
                        >
                          <input
                            type="radio"
                            name="fulfilment"
                            value={method.id}
                            checked={selected}
                            onChange={set('fulfilment')}
                            className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 text-sm font-semibold text-dark">
                              <Icon size={15} className="shrink-0 text-primary" />
                              {method.label}
                            </span>
                            <span className="mt-1 block text-2xs leading-relaxed text-muted">
                              {method.hint}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {pickup ? (
                    <div className="rounded-3xl border border-line bg-secondary-50/50 p-5">
                      <p className="flex items-center gap-2 text-sm font-semibold text-dark">
                        <Building2 size={15} className="shrink-0 text-primary" />
                        {PICKUP.name}
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-muted">{PICKUP.address}</p>
                      <p className="mt-1 text-2xs text-muted">{PICKUP.hours}</p>

                      <ul className="mt-4 grid gap-2">
                        {PICKUP.notes.map((note) => (
                          <li key={note} className="flex items-start gap-2 text-2xs leading-relaxed text-muted">
                            <Check size={13} className="mt-0.5 shrink-0 text-primary" />
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {/* A collection order stops here. Rendering a disabled
                      address form beside "collect from the shop" would only
                      invite someone to fill it in. */}
                  {!pickup ? (
                    <>
                      <Field label="Address" hint="Door no, street, area" error={errors.address}>
                        <textarea
                          value={form.address}
                          onChange={set('address')}
                          rows={3}
                          placeholder="12/4 Ganapathy Nagar, 2nd Street, Adambakkam"
                          autoComplete="street-address"
                          className={cn(
                            'w-full resize-none rounded-2xl border border-line bg-card p-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-secondary-400',
                            errors.address && 'border-rose-300',
                          )}
                        />
                      </Field>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field label="City or town" error={errors.city}>
                          <input
                            value={form.city}
                            onChange={set('city')}
                            placeholder="Sivakasi"
                            autoComplete="address-level2"
                            className={cn(inputClass, errors.city && 'border-rose-300')}
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
                      </div>

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
                    </>
                  ) : null}
                </div>
              ) : null}

              {/* ---------------- step 2: payment ---------------- */}
              {step === 2 ? (
                <div className="grid gap-5">
                  <header className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary-50 text-primary">
                      <Lock size={18} />
                    </span>
                    <div>
                      <h2 className="font-display text-xl font-semibold text-dark">Payment method</h2>
                      <p className="text-2xs text-muted">Nothing is charged — this is a demo</p>
                    </div>
                  </header>

                  <div className="grid gap-3">
                    {payableMethods.map((method) => {
                      const disabled = method.id === 'cod' && totals.total > 5000;
                      const selected = form.payment === method.id;

                      return (
                        <label
                          key={method.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3.5 rounded-3xl border p-4 transition-all duration-300 sm:gap-4 sm:p-5',
                            selected
                              ? 'border-primary bg-secondary-50/70 shadow-soft'
                              : 'border-line bg-card hover:border-secondary-300',
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
                          {selected ? <Check size={17} className="shrink-0 text-primary" /> : null}
                        </label>
                      );
                    })}
                  </div>

                  <p className="flex items-start gap-3 rounded-2xl bg-secondary-50/70 p-4 text-2xs leading-relaxed text-muted">
                    <Lock size={14} className="mt-0.5 shrink-0 text-primary" />
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
                      <Package size={18} />
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
                      [
                        'Fulfilment',
                        FULFILMENT_METHODS.find((m) => m.id === form.fulfilment)?.label,
                      ],
                      ...(pickup
                        ? [
                            ['Collect from', PICKUP.address],
                            ['Counter hours', PICKUP.hours],
                          ]
                        : [
                            ['Address', `${form.address}${form.landmark ? `, ${form.landmark}` : ''}`],
                            ['City', form.city],
                            ['District', `${form.district} — ${form.pincode}`],
                            ['Delivery', deliveryWindow],
                          ]),
                      ['Payment', PAYMENT_METHODS.find((p) => p.id === form.payment)?.label],
                    ].map(([label, value]) => (
                      <div key={label} className="bg-card px-4 py-3.5 sm:px-5 sm:py-4">
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
                      {pickup ? 'Change to delivery' : 'Edit address'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                      Change payment
                    </Button>
                  </div>
                </div>
              ) : null}

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
            <div className="overflow-hidden rounded-4xl border border-line bg-card shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6 sm:py-5">
                <h2 className="font-display text-lg font-semibold text-dark">Order summary</h2>
                <span className="rounded-full bg-secondary-50 px-3 py-1 text-2xs font-semibold text-primary">
                  {totals.count} item{totals.count === 1 ? '' : 's'}
                </span>
              </div>

              <ul className="hide-scrollbar max-h-[320px] divide-y divide-line overflow-y-auto">
                {lines.map((item) => (
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
                      {formatPrice(item.lineTotal ?? item.price * item.qty)}
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
                  <dt>{pickup ? 'Collection' : 'Delivery'}</dt>
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

              {/* What the API changed about the basket when it re-priced it —
                  a line cut back to what is on the shelf, a coupon that no
                  longer qualifies. Shown here so it is read before the order is
                  placed rather than discovered on the receipt. */}
              {notices.length ? (
                <ul className="space-y-1.5 border-t border-line bg-amber-50/70 px-5 py-4 sm:px-6">
                  {notices.map((notice) => (
                    <li key={notice} className="flex items-start gap-2 text-2xs leading-relaxed text-amber-900">
                      <Info size={13} className="mt-0.5 shrink-0" />
                      {notice}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="border-t border-line bg-secondary-50/50 px-5 py-4 sm:px-6">
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
              {pickup ? (
                <>
                  <Building2 size={14} className="mt-0.5 shrink-0 text-primary" />
                  Collect from {PICKUP.address}. {PICKUP.hours}.
                </>
              ) : (
                <>
                  <Truck size={14} className="mt-0.5 shrink-0 text-primary" />
                  Fireworks travel by licensed surface transport only. Arrives {deliveryWindow}.
                </>
              )}
            </p>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Checkout;
