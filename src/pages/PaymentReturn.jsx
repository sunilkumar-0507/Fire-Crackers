import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Check, Clock } from '@/components/ui/icons';
import { api } from '@/lib/api';
import { BRAND } from '@/constants';
import { formatPrice } from '@/utils/format';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';

/**
 * Where the payment provider sends the customer back to.
 *
 * The webhook is what actually marks an order paid, but it is a server-to-server
 * call that can easily arrive after the customer's browser does. So this page
 * asks the API, which asks the gateway directly — a receipt that said "pending"
 * for a payment that had gone through would cost the shop a phone call.
 *
 * It never decides anything itself. Everything on screen comes from the API,
 * because a page that read "paid" out of its own query string would be a page
 * anyone could forge by typing a URL.
 */

const STATES = {
  paid: {
    tone: 'emerald',
    icon: Check,
    title: 'Payment received',
    line: 'Thank you — the money is in and your order is confirmed.',
  },
  processing: {
    tone: 'amber',
    icon: Clock,
    title: 'Payment still going through',
    line: 'Your bank has not finished confirming this yet. It usually takes a minute or two.',
  },
  pending: {
    tone: 'amber',
    icon: Clock,
    title: 'Payment not completed',
    line: 'Nothing has been taken. Your order is held, so you can pay again or settle on delivery.',
  },
  failed: {
    tone: 'rose',
    icon: AlertTriangle,
    title: 'Payment did not go through',
    line: 'Nothing has been taken from your account. Your order is still held for you.',
  },
  refunded: {
    tone: 'slate',
    icon: AlertTriangle,
    title: 'Payment refunded',
    line: 'This payment has been returned to your account.',
  },
};

const TONES = {
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-800',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-secondary-50 text-muted',
};

export const PaymentReturn = () => {
  const [params] = useSearchParams();
  const orderId = params.get('order_id') ?? params.get('orderId') ?? '';

  // Cashfree does not hand the phone number back, and the status endpoint needs
  // it as its access check. The checkout stores it when it opens the payment,
  // so the ordinary path never has to ask twice.
  const [phone, setPhone] = useState(() => {
    try {
      return sessionStorage.getItem('gopi.payment.phone') ?? '';
    } catch {
      return '';
    }
  });

  const [typed, setTyped] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!orderId || !phone) return undefined;

    const controller = new AbortController();
    setChecking(true);

    api
      .paymentStatus(orderId, phone, controller.signal)
      .then((data) => {
        setResult(data);
        setError('');
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') setError(err.message);
      })
      .finally(() => setChecking(false));

    return () => controller.abort();
  }, [orderId, phone]);

  if (!orderId) {
    return (
      <>
        <PageHeader
          eyebrow="Payment"
          title="Nothing to show here"
          breadcrumbs={[{ label: 'Payment' }]}
          art="giftbox"
        />
        <div className="container pb-16">
          <p className="max-w-prose text-sm leading-relaxed text-muted">
            This page is where the payment provider returns you after a payment, and it
            needs an order reference to look anything up. If you have just paid, the
            confirmation is on your tracking page.
          </p>
          <Button to="/track" className="mt-6" rightIcon={<ArrowRight size={16} />}>
            Track an order
          </Button>
        </div>
      </>
    );
  }

  // No stored number — the customer has landed here in a different browser, or
  // opened the link later. Ask, rather than showing them nothing.
  if (!phone) {
    return (
      <>
        <PageHeader
          eyebrow="Payment"
          title="Confirm it is you"
          breadcrumbs={[{ label: 'Payment' }]}
          art="giftbox"
        />
        <div className="container pb-16">
          <p className="max-w-prose text-sm leading-relaxed text-muted">
            Order <strong className="font-semibold text-dark">{orderId}</strong>. Enter the
            mobile number you booked with and we will look up the payment.
          </p>
          <form
            className="mt-5 flex max-w-sm flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setPhone(typed.trim());
            }}
          >
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              inputMode="numeric"
              autoComplete="tel"
              placeholder="10-digit mobile number"
              className="h-12 min-w-0 flex-1 rounded-2xl border border-line bg-card px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-secondary-400"
            />
            <Button type="submit" disabled={typed.trim().length < 10}>
              Check
            </Button>
          </form>
        </div>
      </>
    );
  }

  const status = result?.paymentStatus ?? 'processing';
  const state = STATES[status] ?? STATES.processing;
  const Icon = state.icon;

  return (
    <>
      <PageHeader
        eyebrow="Payment"
        title={checking && !result ? 'Checking your payment…' : state.title}
        breadcrumbs={[{ label: 'Payment' }]}
        art="giftbox"
      />

      <div className="container pb-16">
        {error ? (
          <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
            <p className="text-sm text-muted">{error}</p>
            <Button to="/track" className="mt-5" variant="outline">
              Track your order instead
            </Button>
          </div>
        ) : (
          <div className="max-w-xl rounded-4xl border border-line bg-card p-6 shadow-card sm:p-8">
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${TONES[state.tone]}`}
            >
              <Icon size={13} />
              {state.title}
            </span>

            <p className="mt-4 text-sm leading-relaxed text-muted">{state.line}</p>

            <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Order</dt>
                <dd className="font-semibold text-dark">{orderId}</dd>
              </div>
              {result?.totals ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Amount</dt>
                  <dd className="tabular-nums font-semibold text-dark">
                    {formatPrice(result.totals.total)}
                  </dd>
                </div>
              ) : null}
              {result?.paymentReference ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Reference</dt>
                  <dd className="break-all text-right text-xs text-muted">
                    {result.paymentReference}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button to={`/track?order=${encodeURIComponent(orderId)}`} rightIcon={<ArrowRight size={16} />}>
                Track this order
              </Button>
              <Button to="/products" variant="outline">
                Keep shopping
              </Button>
            </div>

            {status !== 'paid' ? (
              <p className="mt-5 text-2xs leading-relaxed text-muted">
                Nothing is lost either way — your order is held. Call{' '}
                <Link to="/contact" className="font-semibold text-primary-700 underline underline-offset-2">
                  {BRAND.phone}
                </Link>{' '}
                and we will settle it however suits you.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentReturn;
