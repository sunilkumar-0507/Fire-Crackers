/**
 * Mock data service.
 *
 * This is the ONLY module that knows where data comes from. Every component
 * reads through these functions, so swapping the JSON imports for `fetch()`
 * calls against a real REST API is a change confined to this file — the
 * signatures below already return promises for exactly that reason.
 *
 *   export const getProducts = async (params) => {
 *     const res = await fetch(`${API_URL}/products?${qs(params)}`);
 *     return res.json();
 *   };
 */
import categoriesJson from './categories.json';
import productsJson from './products.json';
import offersJson from './offers.json';
import bannersJson from './banners.json';
import combosJson from './combos.json';
import testimonialsJson from './testimonials.json';
import faqJson from './faq.json';

/** Set above 0 to simulate network latency while developing skeleton states. */
export const MOCK_LATENCY = 0;

const settle = (value) =>
  MOCK_LATENCY > 0
    ? new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY))
    : Promise.resolve(value);

/* -------------------------------------------------------------------------- */
/* Synchronous selectors — used for instant, render-time reads                 */
/* -------------------------------------------------------------------------- */

export const categories = categoriesJson;
export const products = productsJson;
export const offers = offersJson;
export const banners = bannersJson;
export const combos = combosJson;
export const testimonials = testimonialsJson;
export const faqs = faqJson;

/**
 * Count and cover photo derived from the catalogue so the three can never
 * drift. The cover is the featured product's lead photo — a category can
 * therefore never front a product we have stopped stocking.
 */
export const categoriesWithCounts = categories.map((c) => {
  const inCategory = products.filter((p) => p.category === c.slug);
  const cover = inCategory.find((p) => p.featured) ?? inCategory[0];
  return { ...c, productCount: inCategory.length, cover: cover?.images[0] };
});

const bySlug = new Map(products.map((p) => [p.slug, p]));
const byId = new Map(products.map((p) => [p.id, p]));
const categoryBySlug = new Map(categoriesWithCounts.map((c) => [c.slug, c]));
const comboBySlug = new Map(combos.map((c) => [c.slug, c]));

export const findProduct = (slugOrId) => bySlug.get(slugOrId) ?? byId.get(slugOrId) ?? null;
export const findCategory = (slug) => categoryBySlug.get(slug) ?? null;
export const findCombo = (slug) => comboBySlug.get(slug) ?? null;

export const featuredProducts = products.filter((p) => p.featured);
export const bestSellers = products.filter((p) => p.bestSeller);
export const newArrivals = products.filter((p) => p.isNew);
export const featuredCombos = combos.filter((c) => c.featured);
export const featuredOffers = offers.filter((o) => o.featured);

/** Every distinct tag in the catalogue, with usage counts, most used first. */
export const allTags = (() => {
  const counts = new Map();
  for (const p of products) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
})();

export const priceBounds = products.reduce(
  (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
  { min: Infinity, max: 0 },
);

/** Same category first, then anything sharing a tag. Never returns the input. */
export const getRelated = (product, limit = 4) => {
  if (!product) return [];
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  if (sameCategory.length >= limit) return sameCategory.slice(0, limit);

  const tagged = products.filter(
    (p) =>
      p.id !== product.id &&
      p.category !== product.category &&
      p.tags.some((t) => product.tags.includes(t)),
  );
  return [...sameCategory, ...tagged].slice(0, limit);
};

/* -------------------------------------------------------------------------- */
/* Async API surface — mirrors the shape a REST client would expose            */
/* -------------------------------------------------------------------------- */

export const api = {
  getCategories: () => settle(categoriesWithCounts),
  getProducts: () => settle(products),
  getProduct: (slug) => settle(findProduct(slug)),
  getOffers: () => settle(offers),
  getBanners: () => settle(banners),
  getCombos: () => settle(combos),
  getCombo: (slug) => settle(findCombo(slug)),
  getTestimonials: () => settle(testimonials),
  getFaqs: () => settle(faqs),

  /**
   * Order placement is the one call that deliberately takes time — the
   * checkout stepper has a real "placing your order" state to show.
   */
  placeOrder: (payload) =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            ok: true,
            orderId: `AC${Date.now().toString().slice(-8)}`,
            placedAt: new Date().toISOString(),
            ...payload,
          }),
        1400,
      ),
    ),

  subscribe: (email) =>
    new Promise((resolve) => setTimeout(() => resolve({ ok: true, email }), 900)),
};
