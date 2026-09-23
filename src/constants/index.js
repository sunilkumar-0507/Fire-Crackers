export let BRAND = {
  name: 'SKV Pyros',
  short: 'SKV Pyros',
  tagline: 'Sivakasi · Since 1994',
  // `phone` is the one every Call button on the site dials, and the one
  // WhatsApp messages are addressed to. `phoneAlt` is the second line at the
  // shop: it is listed wherever we print the full set of ways to reach us, but
  // it is never a button target, because a customer offered two Call buttons
  // has to make a decision we should be making for them.
  phone: '+91 94874 79000',
  phoneHref: 'tel:+919487479000',
  phoneAlt: '+91 89393 89000',
  phoneAltHref: 'tel:+918939389000',
  whatsapp: '+91 94874 79000',
  email: 'skvpyros@gmail.com',
  emailHref: 'mailto:skvpyros@gmail.com',
  address: '14/3 Sattur Main Road, Sivakasi, Virudhunagar District, Tamil Nadu 626123',
  licence: 'PESO Licence No. E/HQ/TN/22/1994 (S)',
  gstin: '33AABCA1994K1Z8',
  hours: 'Mon–Sat, 9:00 AM – 8:00 PM IST',
};

/** The one line in the strip under the navbar. Keep it to a single sentence. */
export const ANNOUNCEMENT =
  'Diwali 2026 booking is open · Free delivery over ₹2,000 across Tamil Nadu & Kerala';

/** Primary navigation. `children` renders a dropdown panel. */
export const NAV_LINKS = [
  { label: 'Home', to: '/' },
  {
    label: 'Categories',
    to: '/products',
    // Filled from the live catalogue by `buildNavLinks` in utils/nav.js. The
    // twelve entries that used to be written out here went stale the moment
    // anyone renamed, added or removed a category in the admin.
    dynamic: 'categories',
  },
  { label: 'Combo Packs', to: '/combos' },
  { label: 'Bulk Orders', to: '/bulk-orders' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export let POPULAR_SEARCHES = [
  'Flower pots',
  'Lakshmi',
  'Sparklers',
  'Ground chakkar',
  'Atom bomb',
  'Colour smoke',
  'Gift box',
  '100 Wala',
];

export const QUICK_FILTERS = [
  { label: 'Silent range', tag: 'silent' },
  { label: 'Kids safe', tag: 'kids-safe' },
  { label: 'New for 2026', tag: 'new-2026' },
  { label: 'Best value', tag: 'value' },
  { label: 'Premium', tag: 'premium' },
  { label: 'Under ₹200', maxPrice: 200 },
];

export let TRUST_POINTS = [
  { title: 'Direct from Sivakasi', text: 'Our own unit, no distributor margin in the price.' },
  { title: 'PESO compliant', text: 'Every batch tested under the 125 dB legal ceiling.' },
  { title: 'Ships in 48 hours', text: 'Licensed surface transport across Tamil Nadu & Kerala.' },
  { title: '32 years running', text: 'Same family, same factory floor, since 1994.' },
];

export let SAFETY_RULES = [
  'Light in open ground, one item at a time, never indoors.',
  'Keep a bucket of sand and a bucket of water within arm’s reach.',
  'Use an agarbatti to light — never a matchstick held close.',
  'Wear cotton, tie long hair back, and keep footwear on.',
  'Respect the safe distance printed on every product page.',
  'Never return to a failed cracker for 10 minutes, then soak it.',
  'Children must be supervised on every item, including sparklers.',
  'Never light anything held in your hand except a sparkler.',
];

export let DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
  'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur',
  'Virudhunagar', 'Kanchipuram', 'Cuddalore', 'Nagercoil', 'Karur', 'Namakkal',
  'Sivakasi', 'Hosur', 'Other (outside Tamil Nadu)',
];

export let PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm, BHIM' },
  { id: 'card', label: 'Card', hint: 'Credit or debit, all major banks' },
  { id: 'netbanking', label: 'Net banking', hint: '58 banks supported' },
  { id: 'cod', label: 'Cash on delivery', hint: 'Available up to ₹5,000' },
];

export const CHECKOUT_STEPS = [
  { id: 'details', label: 'Your details', hint: 'Name and phone' },
  { id: 'fulfilment', label: 'Delivery', hint: 'Deliver or collect' },
  { id: 'payment', label: 'Payment', hint: 'How you pay' },
  { id: 'review', label: 'Review', hint: 'Confirm and place' },
];

/**
 * Delivery or collection — requirement 8.
 *
 * The ids are the API's (`delivery`, `pickup`); the copy is what a customer
 * reads. Mirrors `GET /api/meta/fulfilment`, which is the authority — this is
 * the seed the page renders with before that call has landed.
 */
export let FULFILMENT_METHODS = [
  {
    id: 'delivery',
    label: 'Deliver to me',
    hint: 'Licensed surface transport across Tamil Nadu & Kerala',
    icon: 'truck',
  },
  {
    id: 'pickup',
    label: 'Collect from the shop',
    hint: 'No delivery charge — ready the next working day',
    icon: 'store',
  },
];

/** Where a collection order is picked up from, and what to bring. */
export let PICKUP = {
  name: 'SKV Pyros factory counter',
  address: '14/3 Sattur Main Road, Sivakasi, Virudhunagar District, Tamil Nadu 626123',
  hours: 'Mon–Sat, 9:00 AM – 8:00 PM IST',
  notes: [
    'Bring your order reference and the mobile number you booked with.',
    'Orders are held at the counter for seven days.',
    'Collection is free — no delivery charge is added.',
  ],
};

/** Coupon codes the checkout accepts. Entered at checkout — there is no page listing them. */
export let COUPONS = {
  DIWALI75: { type: 'percentage', value: 0, minOrder: 0, note: 'Already applied to every price' },
  EARLYBIRD: { type: 'percentage', value: 10, minOrder: 1500, note: '10% off before the rush' },
  COMBO500: { type: 'flat', value: 500, minOrder: 1899, note: '₹500 off combo packs' },
  SILENT15: { type: 'percentage', value: 15, minOrder: 999, note: '15% off the silent range' },
  BULK20: { type: 'percentage', value: 20, minOrder: 25000, note: '20% off bulk orders' },
};

export let SHIPPING = {
  freeAbove: 2000,
  localFee: 149,
  outstationFee: 249,
};

export const FOOTER_LINKS = [
  {
    title: 'Shop',
    links: [
      { label: 'All crackers', to: '/products' },
      { label: 'Combo packs', to: '/combos' },
      { label: 'Gift boxes', to: '/category/gift-boxes' },
      { label: 'Family packs', to: '/category/family-packs' },
      { label: 'Silent range', to: '/products?tag=silent' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'Sparklers', to: '/category/sparklers' },
      { label: 'Flower pots', to: '/category/flower-pots' },
      { label: 'Aerial shots', to: '/category/aerial-shots' },
      { label: 'Ground chakkars', to: '/category/ground-chakkar' },
      { label: 'Garland crackers', to: '/category/garland-crackers' },
      { label: 'Kids zone', to: '/category/kids-zone' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Track your order', to: '/track' },
      { label: 'Bulk orders', to: '/bulk-orders' },
      { label: 'Safety guide', to: '/about#safety' },
      { label: 'FAQ', to: '/about#faq' },
      { label: 'Contact us', to: '/contact' },
    ],
  },
  {
    title: 'Information',
    links: [
      { label: 'Delivery & collection', to: '/policies/delivery' },
      { label: 'Cancellation & refunds', to: '/policies/cancellation-refund' },
      { label: 'Customer information', to: '/policies/customer-information' },
      { label: 'Terms & conditions', to: '/policies/terms' },
      { label: 'Privacy', to: '/policies/privacy' },
    ],
  },
];

export const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
  { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' },
  // Read off `BRAND` at access time rather than written out again. This entry
  // held a literal `wa.me/919842011994` and was missed when the shop's number
  // changed, because nothing about a bare string of digits says which shop it
  // belongs to. A getter also survives hydration: consumers touch `.href` when
  // they render, by which point the API's number has landed.
  {
    label: 'WhatsApp',
    get href() {
      return `https://wa.me/${(BRAND.whatsapp ?? '').replace(/\D/g, '')}`;
    },
    icon: 'whatsapp',
  },
];

export const STORAGE_KEYS = {
  cart: 'gopi.cart.v1',
  wishlist: 'gopi.wishlist.v1',
  /** The phone the payment was opened with, so the return page can look it up. */
  paymentPhone: 'gopi.payment.phone',
};

/**
 * Whether this shop can take money online.
 *
 * Off until the API says otherwise, which is the safe direction: a checkout
 * that offered a card and could not charge it would be worse than one that only
 * offers cash on delivery. Replaced by `hydratePayments` during boot.
 */
export let PAYMENTS = { enabled: false, provider: 'none', mode: 'off' };

/* -------------------------------------------------------------------------- */
/* Hydration                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * The API is the authority on everything above that it also serves.
 *
 * `GET /api/meta/config` returns the shop's brand, shipping thresholds, coupon
 * codes, payment methods, districts, safety rules, popular searches, trust
 * points and pickup counter in one call. The values declared above are the seed
 * the app renders with before that call lands — and the catalogue it falls back
 * to when the API is unreachable, which is what lets `npm run dev` work on its
 * own with the API stopped.
 *
 * These are ES module *live bindings*, exactly like the catalogue in
 * `src/data/index.js`, so swapping them here updates every importer on its next
 * render without a single component needing a loading state.
 *
 * Each field is only taken if the API actually sent it, so a partial response
 * degrades to the seed for the missing part rather than blanking a form.
 */

/**
 * `tel:` and `mailto:` are derived here — the API sends the plain values.
 *
 * Both are optional, and an absent one yields a null href rather than a
 * half-built `tel:` or `mailto:` — a link with nothing after the colon opens
 * an empty draft or a blank dialler, which reads as a bug and loses the
 * enquiry. Consumers check the value before rendering the row at all.
 */
const tel = (number) => (number ? `tel:${number.replace(/[^\d+]/g, '')}` : null);

const hrefs = (brand) => ({
  ...brand,
  phoneHref: tel(brand.phone) ?? 'tel:',
  phoneAltHref: tel(brand.phoneAlt),
  emailHref: brand.email ? `mailto:${brand.email}` : null,
});

/** The delivery/pickup hints the API writes, keeping the icons declared here. */
const ICON_BY_FULFILMENT = { delivery: 'truck', pickup: 'store' };

export const hydrateConfig = (config) => {
  if (!config) return false;

  // Merged, not replaced. Every other line in this function already falls back
  // to the built-in value when the API omits a key; brand now behaves the same
  // way one level down. It has to: the second shop number lives only here until
  // the API's brand payload grows a `phoneAlt`, and a wholesale replace would
  // drop it on every boot. Keys the API does send still win, including an
  // explicit null — that is how a detail gets cleared, rather than by removing
  // the key and quietly inheriting whatever is written below.
  if (config.brand) BRAND = hrefs({ ...BRAND, ...config.brand });
  if (config.shipping) SHIPPING = config.shipping;
  if (config.coupons) COUPONS = config.coupons;
  if (config.paymentMethods?.length) PAYMENT_METHODS = config.paymentMethods;
  if (config.districts?.length) DISTRICTS = config.districts;
  if (config.safetyRules?.length) SAFETY_RULES = config.safetyRules;
  if (config.popularSearches?.length) POPULAR_SEARCHES = config.popularSearches;
  if (config.trustPoints?.length) TRUST_POINTS = config.trustPoints;
  if (config.pickup) PICKUP = { ...PICKUP, ...config.pickup };

  return true;
};

/**
 * Applies `GET /api/meta/fulfilment`, which words the delivery and pickup
 * options with the live shipping thresholds in them ("Free above ₹2,000").
 * Kept apart from the config above because it is its own endpoint, and because
 * an unavailable method has to disappear from the checkout rather than be
 * offered and then refused.
 */
/** Applies `GET /api/payments/config`. */
export const hydratePayments = (config) => {
  if (!config) return false;
  PAYMENTS = config;
  return true;
};

export const hydrateFulfilment = (payload) => {
  if (!payload?.methods?.length) return false;

  FULFILMENT_METHODS = payload.methods
    .filter((m) => m.available !== false)
    .map((m) => ({
      id: m.id,
      label: m.label,
      hint: m.hint,
      icon: ICON_BY_FULFILMENT[m.id] ?? 'truck',
    }));

  if (payload.pickup) PICKUP = { ...PICKUP, ...payload.pickup };

  return true;
};
