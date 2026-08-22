export const BRAND = {
  name: 'Gopi Crackers',
  short: 'Gopi',
  tagline: 'Sivakasi · Since 1994',
  phone: '+91 98420 11994',
  phoneHref: 'tel:+919842011994',
  whatsapp: '+91 98420 11994',
  email: 'orders@gopicrackers.in',
  emailHref: 'mailto:orders@gopicrackers.in',
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
    children: [
      { label: 'Sparklers', to: '/category/sparklers', hint: 'Silent, hand-held' },
      { label: 'Flower Pots', to: '/category/flower-pots', hint: 'Golden fountains' },
      { label: 'Ground Chakkars', to: '/category/ground-chakkar', hint: 'Spinning wheels' },
      { label: 'Rockets', to: '/category/rockets', hint: 'Sky shots' },
      { label: 'Aerial Shots', to: '/category/aerial-shots', hint: 'Multi-shot cakes' },
      { label: 'Sound Crackers', to: '/category/sound-crackers', hint: 'For the boom' },
      { label: 'Kids Zone', to: '/category/kids-zone', hint: 'Low noise, big fun' },
      { label: 'Gift Boxes', to: '/category/gift-boxes', hint: 'Ready to gift' },
    ],
  },
  { label: 'Offers', to: '/offers' },
  { label: 'Combo Packs', to: '/combos' },
  { label: 'Bulk Orders', to: '/bulk-orders' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

export const POPULAR_SEARCHES = [
  'Flower pots',
  'Lakshmi rocket',
  'Sparklers',
  'Ground chakkar',
  'Atom bomb',
  'Colour smoke',
  'Gift box',
];

export const QUICK_FILTERS = [
  { label: 'Silent range', tag: 'silent' },
  { label: 'Kids safe', tag: 'kids-safe' },
  { label: 'Best value', tag: 'value' },
  { label: 'Premium', tag: 'premium' },
  { label: 'Under ₹200', maxPrice: 200 },
];

export const TRUST_POINTS = [
  { title: 'Direct from Sivakasi', text: 'Our own unit, no distributor margin in the price.' },
  { title: 'PESO compliant', text: 'Every batch tested under the 125 dB legal ceiling.' },
  { title: 'Ships in 48 hours', text: 'Licensed surface transport across Tamil Nadu & Kerala.' },
  { title: '32 years running', text: 'Same family, same factory floor, since 1994.' },
];

export const SAFETY_RULES = [
  'Light in open ground, one item at a time, never indoors.',
  'Keep a bucket of sand and a bucket of water within arm’s reach.',
  'Use an agarbatti to light — never a matchstick held close.',
  'Wear cotton, tie long hair back, and keep footwear on.',
  'Respect the safe distance printed on every product page.',
  'Never return to a failed cracker for 10 minutes, then soak it.',
  'Children must be supervised on every item, including sparklers.',
  'Never light anything held in your hand except a sparkler.',
];

export const DISTRICTS = [
  'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli',
  'Tiruppur', 'Erode', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur',
  'Virudhunagar', 'Kanchipuram', 'Cuddalore', 'Nagercoil', 'Karur', 'Namakkal',
  'Sivakasi', 'Hosur', 'Other (outside Tamil Nadu)',
];

export const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', hint: 'GPay, PhonePe, Paytm, BHIM' },
  { id: 'card', label: 'Card', hint: 'Credit or debit, all major banks' },
  { id: 'netbanking', label: 'Net banking', hint: '58 banks supported' },
  { id: 'cod', label: 'Cash on delivery', hint: 'Available up to ₹5,000' },
];

export const CHECKOUT_STEPS = [
  { id: 'details', label: 'Your details', hint: 'Name and phone' },
  { id: 'address', label: 'Delivery', hint: 'Where it ships' },
  { id: 'payment', label: 'Payment', hint: 'How you pay' },
  { id: 'review', label: 'Review', hint: 'Confirm and place' },
];

/** Coupon codes the mock checkout accepts. Mirrors `offers.json`. */
export const COUPONS = {
  DIWALI75: { type: 'percentage', value: 0, minOrder: 0, note: 'Already applied to every price' },
  EARLYBIRD: { type: 'percentage', value: 10, minOrder: 1500, note: '10% off before the rush' },
  COMBO500: { type: 'flat', value: 500, minOrder: 1899, note: '₹500 off combo packs' },
  SILENT15: { type: 'percentage', value: 15, minOrder: 999, note: '15% off the silent range' },
  BULK20: { type: 'percentage', value: 20, minOrder: 25000, note: '20% off bulk orders' },
};

export const SHIPPING = {
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
      { label: 'Festival offers', to: '/offers' },
      { label: 'Gift boxes', to: '/category/gift-boxes' },
      { label: 'Silent range', to: '/products?tag=silent' },
    ],
  },
  {
    title: 'Categories',
    links: [
      { label: 'Sparklers', to: '/category/sparklers' },
      { label: 'Flower pots', to: '/category/flower-pots' },
      { label: 'Ground chakkars', to: '/category/ground-chakkar' },
      { label: 'Rockets', to: '/category/rockets' },
      { label: 'Kids zone', to: '/category/kids-zone' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Bulk orders', to: '/bulk-orders' },
      { label: 'Safety guide', to: '/about#safety' },
      { label: 'Delivery & returns', to: '/contact#delivery' },
      { label: 'FAQ', to: '/about#faq' },
      { label: 'Contact us', to: '/contact' },
    ],
  },
];

export const SOCIALS = [
  { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
  { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
  { label: 'YouTube', href: 'https://youtube.com', icon: 'youtube' },
  { label: 'WhatsApp', href: 'https://wa.me/919842011994', icon: 'whatsapp' },
];

export const STORAGE_KEYS = {
  cart: 'gopi.cart.v1',
  wishlist: 'gopi.wishlist.v1',
};
