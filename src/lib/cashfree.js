/**
 * Cashfree's checkout SDK, loaded only if it is ever needed.
 *
 * Their script is a third-party request on a page that takes people's money, so
 * it is not in `index.html`: a shop with no merchant account should never fetch
 * it at all, and a shop that has one should only fetch it at the moment a
 * customer actually chooses to pay online.
 *
 * Everything here is transport. The decision to offer online payment belongs to
 * the API (`GET /api/payments/config`), and the session id comes from the API
 * too — this file never sees a credential.
 */

const SDK_URL = 'https://sdk.cashfree.com/js/v3/cashfree.js';

let loading = null;

/** Injects the script once; later calls await the same promise. */
const loadSdk = () => {
  if (window.Cashfree) return Promise.resolve(window.Cashfree);
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.onload = () =>
      window.Cashfree
        ? resolve(window.Cashfree)
        : reject(new Error('The payment library loaded but did not start.'));
    // A blocked or failed script must not leave the promise pending forever,
    // or the checkout button spins with nothing to say.
    script.onerror = () => {
      loading = null;
      reject(new Error('Could not load the payment library. Check your connection and try again.'));
    };
    document.head.appendChild(script);
  });

  return loading;
};

/**
 * Hands the customer to Cashfree's hosted payment page.
 *
 * `_self` rather than a modal: a redirect survives a phone locking mid-payment
 * and coming back, which a modal on a backgrounded tab does not. They return to
 * `/checkout/payment-return`, which asks the API what actually happened.
 *
 * @param {string} paymentSessionId from `POST /api/payments/cashfree/session`
 * @param {'sandbox'|'production'} mode
 */
export const openCashfreeCheckout = async (paymentSessionId, mode = 'sandbox') => {
  const Cashfree = await loadSdk();
  const cashfree = Cashfree({ mode });

  return cashfree.checkout({ paymentSessionId, redirectTarget: '_self' });
};

export default openCashfreeCheckout;
