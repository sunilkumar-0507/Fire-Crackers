import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Check,
  Clock,
  MessageCircle,
  Package,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  X,
} from '@/components/ui/icons';
import { cn } from '@/utils/cn';
import { BRAND } from '@/constants';
import { api } from '@/lib/api';
import { analytics } from '@/lib/analytics';
import { whatsappHref, trackingEnquiryMessage } from '@/utils/whatsapp';
import { formatPrice, formatDate, formatDay } from '@/utils/format';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import ProductImage from '@/components/ui/ProductImage';

/**
 * Order tracking — requirement 9, the customer's half.
 *
 * The reference number alone is not enough to see an order. References are
 * short and guessable, so the API requires the mobile number the order was
 * placed with and returns the same 404 for a wrong number as for an unknown
 * reference. This page therefore asks for both, and never reveals which half
 * was wrong — a "that reference exists but the number is wrong" message would
 * quietly turn the form into an order-book enumerator.
 */

/*
 * One icon per step, and only the last one is a tick. Giving "Confirmed" a tick
 * too makes a step that has not happened yet look like one that has, however
 * pale it is drawn.
 */
const STEP_ICONS = {
  pending: Clock,
  confirmed: ShieldCheck,
  processing: Package,
  ready: Truck,
  completed: Check,
};

const STEP_LABELS = {
  pending: 'Received',
  confirmed: 'Confirmed',
  processing: 'Packed',
  ready: 'Ready',
  completed: 'Completed',
};

const inputClass =
  'h-12 w-full rounded-2xl border border-line bg-card px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-secondary-400';

/* ------------------------------- progress -------------------------------- */

const Progress = ({ order }) => {
  const cancelled = order.status === 'cancelled';
  const reached = order.steps.indexOf(order.status);

  if (cancelled) {
    return (
      <div className="flex items-center gap-3 rounded-3xl bg-berry-100 px-5 py-4 text-berry-800">
        <X size={18} className="shrink-0" />
        <p className="text-sm font-semibold">This order was cancelled.</p>
      </div>
    );
  }

  return (
    <ol className="grid gap-1 sm:grid-cols-5 sm:gap-2">
      {order.steps.map((step, index) => {
        const done = index <= reached;
        const current = index === reached;
        const Icon = STEP_ICONS[step] ?? Clock;

        return (
          <li key={step} className="flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
            <span
              className={cn(
                'grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors',
                done ? 'bg-primary text-white' : 'bg-secondary-50 text-muted',
                current && 'ring-4 ring-secondary-100',
              )}
            >
              <Icon size={16} />
            </span>

            {/* The connector is a sibling on desktop only; on a phone the list
                reads top to bottom and a horizontal rule between rows would be
                pointing the wrong way. */}
            <span
              className={cn(
                'text-2xs font-semibold uppercase tracking-[.12em]',
                done ? 'text-dark' : 'text-muted',
              )}
            >
              {STEP_LABELS[step] ?? step}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

/* ------------------------------- the order ------------------------------- */

const Result = ({ order, onClear }) => {
  const pickup = order.fulfilment === 'pickup';

  return (
    <div className="grid gap-6">
      <div className="rounded-4xl border border-line bg-card p-5 shadow-card sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-2xs font-semibold uppercase tracking-[.2em] text-primary">
              {order.orderId}
            </p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-dark">
              {order.statusLabel}
            </h2>
            <p className="mt-1.5 text-2xs text-muted">
              Placed {formatDate(order.placedAt)} · {order.name} · {order.maskedPhone}
            </p>
          </div>

          <Button size="sm" variant="ghost" onClick={onClear}>
            Track another
          </Button>
        </div>

        <div className="mt-8">
          <Progress order={order} />
        </div>

        {order.status !== 'cancelled' ? (
          <p className="mt-8 flex items-start gap-2.5 rounded-2xl bg-secondary-50/70 p-4 text-2xs leading-relaxed text-muted">
            <Truck size={14} className="mt-0.5 shrink-0 text-primary" />
            {pickup
              ? `Ready to collect from ${formatDay(new Date(order.deliveryFrom))} at ${BRAND.address}. Bring this reference.`
              : `Expected ${formatDay(new Date(order.deliveryFrom))} – ${formatDay(new Date(order.deliveryTo))}, by licensed surface transport.`}
          </p>
        ) : null}
      </div>

      {/* timeline */}
      <div className="rounded-4xl border border-line bg-card p-5 shadow-card sm:p-8">
        <h3 className="font-display text-lg font-semibold text-dark">History</h3>

        <ol className="mt-5 grid gap-5">
          {[...order.history].reverse().map((event, index) => (
            <li key={`${event.status}-${event.at}`} className="flex gap-4">
              <span
                className={cn(
                  'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
                  index === 0 ? 'bg-primary' : 'bg-secondary-200',
                )}
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-dark">
                  {STEP_LABELS[event.status] ?? event.status}
                </p>
                <p className="mt-0.5 text-2xs text-muted">{formatDate(event.at)}</p>
                {event.note ? (
                  <p className="mt-1.5 text-xs leading-relaxed text-ink">{event.note}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* what is in it */}
      <div className="overflow-hidden rounded-4xl border border-line bg-card shadow-card">
        <div className="border-b border-line px-5 py-4 sm:px-8 sm:py-5">
          <h3 className="font-display text-lg font-semibold text-dark">
            {order.totals.count} item{order.totals.count === 1 ? '' : 's'}
          </h3>
        </div>

        <ul className="divide-y divide-line">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-3.5 px-5 py-4 sm:px-8">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-secondary-50 to-white p-1.5">
                <ProductImage source={item.image} alt={item.name} className="h-full w-full" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium text-dark">{item.name}</p>
                <p className="mt-0.5 text-2xs text-muted">Qty {item.qty}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-dark">
                {formatPrice(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>

        <div className="flex items-baseline justify-between border-t border-line px-5 py-5 sm:px-8">
          <span className="font-display text-lg font-semibold text-dark">Total</span>
          <span className="font-display text-2xl font-semibold text-dark tabular-nums">
            {formatPrice(order.totals.total)}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          href={whatsappHref(trackingEnquiryMessage(order.orderId))}
          variant="outline"
          leftIcon={<MessageCircle size={16} />}
          onClick={() => analytics.whatsappClick('track')}
        >
          Ask about this on WhatsApp
        </Button>
        <Button href={BRAND.phoneHref} variant="ghost" leftIcon={<Phone size={15} />}>
          Call the shop
        </Button>
      </div>
    </div>
  );
};

/* --------------------------------- page ---------------------------------- */

export const TrackOrder = () => {
  const [params, setParams] = useSearchParams();

  const [form, setForm] = useState({
    orderId: params.get('ref') ?? '',
    phone: '',
  });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analytics.pageView('/track');
  }, []);

  const set = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
    setError(null);
  };

  const submit = useCallback(
    async (event) => {
      event.preventDefault();

      const orderId = form.orderId.trim();
      const phone = form.phone.replace(/\s|-/g, '');

      if (!orderId) {
        setError('Your order reference, like AC12345678.');
        return;
      }
      if (!/^[6-9]\d{9}$/.test(phone)) {
        setError('The 10-digit mobile number the order was placed with.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const found = await api.trackOrder(orderId, phone);
        setOrder(found);

        // Deep-linkable, but only the reference goes in the URL — a phone
        // number in a shareable link is a phone number in somebody's history.
        const next = new URLSearchParams(params);
        next.set('ref', found.orderId);
        setParams(next, { replace: true, preventScrollReset: true });
      } catch (caught) {
        setOrder(null);
        setError(
          caught.status === 404
            ? 'We could not find an order with that reference and mobile number. Check both — they have to match.'
            : caught.message,
        );
        toast.error('Order not found');
      } finally {
        setLoading(false);
      }
    },
    [form, params, setParams],
  );

  const clear = () => {
    setOrder(null);
    setForm({ orderId: '', phone: '' });
    const next = new URLSearchParams(params);
    next.delete('ref');
    setParams(next, { replace: true, preventScrollReset: true });
  };

  return (
    <>
      <PageHeader
        eyebrow="Order status"
        title="Where is my order?"
        description="Your reference number and the mobile number you booked with. We ask for both because a reference on its own would let anyone read anyone else's order."
        breadcrumbs={[{ label: 'Track order' }]}
        art="rocket"
      />

      <div className="container pb-16 sm:pb-20">
        <div className="mx-auto max-w-3xl">
          {order ? (
            <Result order={order} onClear={clear} />
          ) : (
            <form
              onSubmit={submit}
              className="rounded-4xl border border-line bg-card p-5 shadow-card sm:p-9"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-2xs font-semibold uppercase tracking-[.14em] text-dark">
                    Order reference
                  </span>
                  <input
                    value={form.orderId}
                    onChange={set('orderId')}
                    placeholder="AC12345678"
                    autoComplete="off"
                    spellCheck={false}
                    className={cn(inputClass, 'uppercase', error && 'border-rose-300')}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-2xs font-semibold uppercase tracking-[.14em] text-dark">
                    Mobile number
                  </span>
                  <input
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="98420 11994"
                    inputMode="tel"
                    autoComplete="tel"
                    className={cn(inputClass, error && 'border-rose-300')}
                  />
                </label>
              </div>

              {error ? (
                <p className="mt-4 text-xs leading-relaxed text-rose-600" role="alert">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="mt-7 w-full sm:w-auto"
                leftIcon={<Search size={16} />}
              >
                {loading ? 'Looking…' : 'Find my order'}
              </Button>

              <p className="mt-7 border-t border-line pt-6 text-2xs leading-relaxed text-muted">
                Lost the reference? It is in the message we sent when you ordered. If you cannot
                find it, call {BRAND.phone} with the name and number you used and we will look it
                up.
              </p>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default TrackOrder;
