/**
 * The storefront's REST client.
 *
 * One place that knows the API's base URL and how a failure is shaped.
 * Everything above this — the data module, the checkout, the tracking page —
 * talks in plain objects and never touches `fetch` directly.
 *
 * There is deliberately nothing admin-shaped in here. The admin is its own
 * application, in its own repository, with its own client and passcode handling,
 * so the shop's bundle cannot ship the admin's credentials handling even by
 * accident, and a shopper never downloads a byte of it.
 *
 * The API returns RFC 9110 problem details on failure, so a 409 from the
 * catalogue arrives here carrying a sentence written for a shopkeeper
 * ("Sparklers still holds 30 products"). `ApiError.message` is that sentence,
 * which is why screens can render `err.message` straight into a toast.
 */

/** Vite inlines this at build time; the proxy in vite.config.js covers dev. */
const BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, { status, problem } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
    /** Field-level messages from a 400, keyed by property name. */
    this.errors = problem?.errors ?? null;
  }

  /** True when the passcode is missing or wrong, so the gate can re-prompt. */
  get unauthorised() {
    return this.status === 401;
  }
}

/* -------------------------------------------------------------------------- */
/* Request                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Turns a problem-details body into the one sentence worth showing. Field
 * errors are joined because a form that rejects three fields should say all
 * three, not just the first.
 */
const UNREACHABLE = 'Could not reach the API. Is it running?';

const messageFrom = (problem, status) => {
  // A dev-server proxy with nothing behind it answers 502/504 itself, so a
  // stopped API arrives as a gateway error rather than a failed fetch. Both
  // mean the same thing to whoever is reading the screen.
  if (status === 502 || status === 503 || status === 504) return UNREACHABLE;

  if (!problem) return `Request failed (${status})`;

  const fields = problem.errors
    ? Object.values(problem.errors).flat().filter(Boolean)
    : [];

  if (fields.length) return fields.join(' ');
  return problem.detail || problem.title || `Request failed (${status})`;
};

const request = async (path, { method = 'GET', body, signal } = {}) => {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers,
      signal,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    // A dead API and a rejected request are very different problems, and the
    // storefront handles them differently — it falls back to bundled data for
    // the first and shows the message for the second.
    if (cause?.name === 'AbortError') throw cause;
    throw new ApiError(UNREACHABLE, { status: 0 });
  }

  if (response.status === 204) return null;

  const isJson = (response.headers.get('content-type') ?? '').includes('json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(messageFrom(payload, response.status), {
      status: response.status,
      problem: payload,
    });
  }

  return payload;
};

/* -------------------------------------------------------------------------- */
/* Storefront                                                                  */
/* -------------------------------------------------------------------------- */

export const api = {
  /** The whole catalogue in one call — see BootstrapController. */
  bootstrap: (signal) => request('/bootstrap', { signal }),

  /**
   * The shop's configuration: brand, shipping, coupons, payment methods,
   * districts, safety rules, popular searches, trust points and the pickup
   * counter. Everything `src/constants/index.js` seeds and the API owns.
   */
  config: (signal) => request('/meta/config', { signal }),

  /**
   * Prices a basket without placing it.
   *
   * Send ids and quantities only — every rupee comes back re-read from the
   * catalogue, which is what makes this worth a round trip rather than a local
   * sum: it is the same code that will price the order on submit, so the
   * checkout can show the figure the customer will actually be charged.
   * `notices` explains any difference (a line capped to stock, a coupon that
   * stopped qualifying).
   */
  quote: ({ items, coupon = null, fulfilment = 'delivery' }, signal) =>
    request('/cart/quote', {
      method: 'POST',
      body: { items, coupon, fulfilment },
      signal,
    }),

  placeOrder: (payload) => request('/orders', { method: 'POST', body: payload }),

  /* ------------------------------------------------------------------------ */
  /* Payment                                                                   */
  /* ------------------------------------------------------------------------ */

  /**
   * Whether this shop can take money online at all.
   *
   * A deployment with no merchant credentials answers `enabled: false`, and the
   * checkout simply does not offer the option — which is why the shop works
   * unchanged with nothing configured.
   */
  paymentConfig: (signal) => request('/payments/config', { signal }),

  /**
   * Opens a payment against an order that has already been placed.
   *
   * The order exists first, deliberately: a customer who abandons the payment
   * page still has a booking the shop can ring them about, rather than the
   * whole thing disappearing with the tab. The phone number is the access
   * check, exactly as on the tracking page.
   */
  paymentSession: (orderId, phone) =>
    request('/payments/cashfree/session', { method: 'POST', body: { orderId, phone } }),

  /** Asks the gateway where a payment actually got to, for the return page. */
  paymentStatus: (orderId, phone, signal) =>
    request(
      `/payments/status/${encodeURIComponent(orderId.trim())}?phone=${encodeURIComponent(phone.trim())}`,
      { signal },
    ),

  /**
   * Looks up an order for the tracking page.
   *
   * The phone number is not a convenience — it is the access check. Order
   * references are short, so an endpoint that served an order from the id alone
   * would hand out the shop's address book; the API returns the same 404 for a
   * wrong number as for an unknown reference.
   */
  trackOrder: (orderId, phone, signal) =>
    request(`/orders/${encodeURIComponent(orderId.trim())}/track?phone=${encodeURIComponent(phone.trim())}`, {
      signal,
    }),

  /** Delivery and pickup, with the counter's address and hours. */
  fulfilment: (signal) => request('/meta/fulfilment', { signal }),

  subscribe: (email) => request('/newsletter/subscribe', { method: 'POST', body: { email } }),

  enquire: (payload) => request('/bulk-enquiries', { method: 'POST', body: payload }),

  contact: (payload) => request('/contact-messages', { method: 'POST', body: payload }),

  /** Fire-and-forget event batch. See lib/analytics.js for the queueing. */
  track: (events) => request('/analytics/events', { method: 'POST', body: { events } }),
};
