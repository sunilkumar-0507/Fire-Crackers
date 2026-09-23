import { BRAND } from '@/constants';
import { formatPrice } from '@/utils/format';

/**
 * WhatsApp ordering and enquiry — requirement 7.
 *
 * Most of this shop's customers arrive from a WhatsApp forward and would rather
 * finish the conversation there than fill in a form. So every entry point here
 * produces a `wa.me` link with the message already written: the shopkeeper
 * receives something they can act on, and the customer sends it in one tap.
 *
 * `wa.me` is deliberate over `api.whatsapp.com` — it is the link WhatsApp's own
 * documentation gives out, it opens the installed app on a phone and WhatsApp
 * Web on a desktop, and it needs no account, no API key and no message
 * template approval.
 *
 * Nothing here is a substitute for the order actually being placed. The cart
 * message is an enquiry; the confirmation message quotes a reference number the
 * API has already issued.
 */

/** `+91 98420 11994` → `919842011994`. WhatsApp wants digits and nothing else. */
const digitsOf = (value) => (value ?? '').replace(/\D/g, '');

/**
 * Read at call time, never captured at module load: `BRAND` is a live binding
 * that `GET /api/meta/config` replaces during boot, and a number frozen here
 * would keep pointing at the seed after the API had said otherwise.
 */
export const whatsappNumber = () => digitsOf(BRAND.whatsapp);

/**
 * A `wa.me` link with the message pre-filled.
 *
 * `encodeURIComponent` rather than `URLSearchParams`, because the latter
 * encodes spaces as `+` and WhatsApp renders those literally — a message full
 * of plus signs instead of spaces.
 */
export const whatsappHref = (message) => {
  const base = `https://wa.me/${whatsappNumber()}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
};

/* -------------------------------------------------------------------------- */
/* Messages                                                                    */
/* -------------------------------------------------------------------------- */

const line = (...parts) => parts.filter(Boolean).join(' ');

/** The plain "I have a question" opener, used by the floating button. */
export const generalEnquiryMessage = () =>
  `Hello ${BRAND.name}, I have a question about your 2026 Diwali crackers.`;

/** Asked from a product page, so the shop knows which item without asking. */
export const productEnquiryMessage = (product) =>
  [
    `Hello ${BRAND.name}, I would like to ask about this item:`,
    '',
    line('•', product.name, `(${product.unit})`),
    line('• Price:', formatPrice(product.price)),
    line('• Code:', product.code),
    '',
    `${window.location.origin}/product/${product.slug}`,
  ].join('\n');

/**
 * The whole basket as an enquiry.
 *
 * Quantities and line totals are included because a shopkeeper reading this on
 * a phone should be able to price it without opening anything else.
 */
export const cartEnquiryMessage = (items, totals) =>
  [
    `Hello ${BRAND.name}, I would like to order the following:`,
    '',
    ...items.map((item) => `• ${item.qty} × ${item.name} — ${formatPrice(item.price * item.qty)}`),
    '',
    `Subtotal: ${formatPrice(totals.subtotal)}`,
    totals.couponDiscount > 0 ? `Coupon: −${formatPrice(totals.couponDiscount)}` : null,
    `Total: ${formatPrice(totals.total)}`,
    '',
    'Please confirm availability and delivery.',
  ]
    .filter((part) => part !== null)
    .join('\n');

/**
 * Sent after checkout, quoting the reference the API issued. This is the
 * customer's own copy of the confirmation and the shop's first notice of it,
 * which is why it leads with the reference number rather than the total.
 *
 * Every line is itemised with its unit price and line total, so the shopkeeper
 * can pack and bill from the chat alone. `items` are the lines the checkout
 * showed at the moment of placing: the API's re-priced lines when it had
 * quoted, the cart's own otherwise.
 */
export const orderMessage = (order, items = [], totals = order.totals) =>
  [
    `Hello ${BRAND.name}, I have just placed an order on your website.`,
    '',
    `Reference: ${order.orderId}`,
    `Name: ${order.name}`,
    order.phone ? `Phone: ${order.phone}` : null,
    '',
    ...(items.length
      ? [
          '*Items*',
          ...items.map((item, index) => {
            const lineTotal = item.lineTotal ?? item.price * item.qty;
            const unitPrice = item.price ?? lineTotal / item.qty;
            return (
              `${index + 1}. ${item.name}${item.unit ? ` (${item.unit})` : ''}\n` +
              `    ${item.qty} × ${formatPrice(unitPrice)} = ${formatPrice(lineTotal)}`
            );
          }),
          '',
        ]
      : []),
    `Subtotal: ${formatPrice(totals.subtotal)}`,
    totals.couponDiscount > 0 ? `Coupon: −${formatPrice(totals.couponDiscount)}` : null,
    totals.shipping > 0 ? `Delivery: ${formatPrice(totals.shipping)}` : null,
    `*Total: ${formatPrice(totals.total)}*`,
    '',
    order.fulfilment === 'pickup'
      ? 'Collecting from the shop.'
      : `Delivering to: ${order.address}, ${order.city} ${order.pincode}`,
    '',
    'Please confirm.',
  ]
    .filter((part) => part !== null)
    .join('\n');

/** Used by the tracking page when a customer wants to chase an order. */
export const trackingEnquiryMessage = (orderId) =>
  `Hello ${BRAND.name}, could you tell me where order ${orderId} has got to?`;

/** The bulk / institutional enquiry, from the bulk orders page. */
export const bulkEnquiryMessage = ({ name, district, quantity } = {}) =>
  [
    `Hello ${BRAND.name}, I would like a quote for a bulk order.`,
    '',
    name ? `Name: ${name}` : null,
    district ? `District: ${district}` : null,
    quantity ? `Approximate quantity: ${quantity}` : null,
  ]
    .filter((part) => part !== null)
    .join('\n');
