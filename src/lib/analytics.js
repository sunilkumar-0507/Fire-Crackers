/**
 * Storefront analytics — requirement 13.
 *
 * Events go to this shop's own API and nowhere else. There is no third-party
 * tag, no advertising pixel and no cookie, which is why there is no consent
 * banner either: an anonymous per-tab id in `sessionStorage` is not personal
 * data, and it is the only thing here that outlives a single event.
 *
 * Three rules this file exists to enforce:
 *
 *   1. **Never break the page.** Every call is wrapped; a failed flush drops
 *      the batch and moves on. A shop must not stop selling because a counter
 *      could not be incremented.
 *   2. **Never block the shopper.** Events are queued and flushed on a timer,
 *      so a product page costs one request for a whole visit rather than one
 *      per scroll.
 *   3. **Never lose the last batch.** The queue is flushed with `sendBeacon`
 *      when the tab is hidden, which is the only reliable moment on mobile —
 *      `unload` does not fire on iOS.
 */
import { api } from '@/lib/api';

const SESSION_KEY = 'gopi.analytics.session';

/** Flush when the queue reaches this, so a busy page does not sit on events. */
const BATCH_SIZE = 10;

/** …or after this long, so a quiet page still reports before the tab closes. */
const FLUSH_AFTER_MS = 4000;

/** The API caps a batch at 50. Dropping past this beats a rejected request. */
const MAX_QUEUE = 50;

let queue = [];
let timer = null;

/**
 * A random per-tab id.
 *
 * Its only job is to let the report say "this many visits started a basket"
 * rather than "this many basket events happened". It is not a user id: it dies
 * with the tab, is never sent anywhere but this API, and is not joined to a
 * name, a phone number or an order.
 */
const sessionId = (() => {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;

    const fresh =
      globalThis.crypto?.randomUUID?.() ??
      `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

    sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    // Private mode, or storage disabled. Events still record; they just cannot
    // be grouped into a visit.
    return null;
  }
})();

/**
 * Exposed so a request that the API will record on the browser's behalf can
 * hand it the same session id — an order, a bulk enquiry.
 *
 * Those events are recorded server-side rather than here on purpose: a checkout
 * that navigates away, or a browser with the request blocked, must not be able
 * to lose the one event the shop actually cares about. Sending the session with
 * the order is what lets the API attribute it to the visit anyway.
 */
export const analyticsSession = () => sessionId ?? undefined;

/* -------------------------------------------------------------------------- */
/* Flushing                                                                    */
/* -------------------------------------------------------------------------- */

const clearTimer = () => {
  if (timer === null) return;
  clearTimeout(timer);
  timer = null;
};

/**
 * Sends whatever is queued.
 *
 * `beacon` is used on the way out of the page: `fetch` is cancelled when a tab
 * is discarded, `navigator.sendBeacon` is not. It cannot report failure, which
 * is fine — there is nothing useful to do about a failed analytics write.
 */
export const flush = (beacon = false) => {
  clearTimer();
  if (queue.length === 0) return;

  const events = queue;
  queue = [];

  const body = JSON.stringify({ events });

  try {
    if (beacon && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const url = `${import.meta.env.VITE_API_URL ?? '/api'}/analytics/events`.replace(
        /([^:]\/)\/+/g,
        '$1',
      );
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
      return;
    }

    // Deliberately un-awaited and swallowed: nothing upstream should ever wait
    // on, or fail because of, a counter.
    api.track(events).catch(() => {});
  } catch {
    /* As above — analytics never surfaces an error to a shopper. */
  }
};

/* -------------------------------------------------------------------------- */
/* Recording                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Queues one event. `ref` is what it happened to (a slug, a search term), and
 * `value` is the number worth summing — rupees for an order, quantity for a
 * basket line, hit count for a search.
 */
export const track = (type, { ref, label, value = 0 } = {}) => {
  try {
    if (queue.length >= MAX_QUEUE) return;

    queue.push({
      type,
      ref: ref ? String(ref).slice(0, 160) : undefined,
      label: label ? String(label).slice(0, 160) : undefined,
      value: Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0,
      session: sessionId ?? undefined,
    });

    if (queue.length >= BATCH_SIZE) {
      flush();
      return;
    }

    if (timer === null) timer = setTimeout(() => flush(), FLUSH_AFTER_MS);
  } catch {
    /* Never throw out of a tracking call. */
  }
};

/* -------------------------------------------------------------------------- */
/* The events the storefront actually sends                                    */
/* -------------------------------------------------------------------------- */

export const analytics = {
  pageView: (path) => track('page_view', { ref: path }),

  productView: (product) =>
    track('product_view', { ref: product?.slug, label: product?.name, value: product?.price }),

  categoryView: (category) =>
    track('category_view', { ref: category?.slug, label: category?.name }),

  comboView: (combo) => track('combo_view', { ref: combo?.slug, label: combo?.name }),

  /**
   * `value` is the number of hits, which is what makes a zero meaningful: a
   * search with no results is a customer telling the shop what to stock.
   */
  search: (query, resultCount) =>
    track('search', { ref: query?.trim()?.toLowerCase(), value: resultCount }),

  cartAdd: (item, qty = 1) =>
    track('cart_add', { ref: item?.slug ?? item?.id, label: item?.name, value: qty }),

  cartRemove: (item) => track('cart_remove', { ref: item?.slug ?? item?.id, label: item?.name }),

  checkoutStart: (totals) => track('checkout_start', { value: totals?.total }),

  /*
   * `order_placed` and `enquiry` are deliberately absent. Both are recorded by
   * the API when it accepts the request — see `analyticsSession()` above — so
   * that they cannot be lost, and so they cannot be counted twice.
   */

  whatsappClick: (where) => track('whatsapp_click', { ref: where }),
};

/* -------------------------------------------------------------------------- */
/* Lifecycle                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * `visibilitychange` is the one event that fires reliably when a mobile browser
 * takes the tab away — `beforeunload` and `unload` do not on iOS. `pagehide`
 * covers the back/forward cache.
 */
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush(true);
  });

  window.addEventListener('pagehide', () => flush(true));
}

export default analytics;
