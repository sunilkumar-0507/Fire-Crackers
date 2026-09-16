/**
 * The catalogue.
 *
 * This is the ONLY module that knows where data comes from. Every component
 * reads through the bindings below at render time, synchronously — no awaiting,
 * no loading states scattered through thirty files.
 *
 * That stays true now the data is live. `hydrate()` swaps the whole catalogue in
 * one go, and because these are ES module *live bindings*, every importer sees
 * the new arrays on its next render. `bootstrap()` runs once in main.jsx before
 * React mounts, so the first paint already has real data — the JSON imported
 * below is the seed the app falls back to when the API is unreachable, which is
 * what lets `npm run dev` work on its own with the API stopped.
 *
 * After an admin save, call `refresh()` to pull the catalogue again.
 */
import categoriesJson from './categories.json';
import productsJson from './products.json';
import offersJson from './offers.json';
import bannersJson from './banners.json';
import combosJson from './combos.json';
import testimonialsJson from './testimonials.json';
import faqJson from './faq.json';
import { api } from '@/lib/api';

/* -------------------------------------------------------------------------- */
/* Live bindings                                                               */
/* -------------------------------------------------------------------------- */

export let categories = categoriesJson;
export let products = productsJson;
export let offers = offersJson;
export let banners = bannersJson;
export let combos = combosJson;
export let testimonials = testimonialsJson;
export let faqs = faqJson;

/**
 * Count and cover photo derived from the catalogue so the three can never
 * drift. The cover is the featured product's lead photo — a category can
 * therefore never front a product we have stopped stocking.
 */
export let categoriesWithCounts = [];

export let featuredProducts = [];
export let bestSellers = [];
export let newArrivals = [];
export let featuredCombos = [];
export let featuredOffers = [];

/** Every distinct tag in the catalogue, with usage counts, most used first. */
export let allTags = [];

export let priceBounds = { min: 0, max: 0 };

/**
 * Bumped on every hydrate. The router keys off it, so a catalogue that changed
 * under a mounted tree forces a clean remount rather than leaving half the page
 * showing the previous prices.
 */
export let catalogVersion = 0;

/** True once the API has answered. False means these are the bundled seeds. */
export let live = false;

let bySlug = new Map();
let byId = new Map();
let categoryBySlug = new Map();
let comboBySlug = new Map();

export const findProduct = (slugOrId) => bySlug.get(slugOrId) ?? byId.get(slugOrId) ?? null;
export const findCategory = (slug) => categoryBySlug.get(slug) ?? null;
export const findCombo = (slug) => comboBySlug.get(slug) ?? null;

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
/* Hydration                                                                   */
/* -------------------------------------------------------------------------- */

/** Recomputes every derived collection and lookup from the seven raw lists. */
const recompute = () => {
  categoriesWithCounts = categories.map((c) => {
    const inCategory = products.filter((p) => p.category === c.slug);
    const cover = inCategory.find((p) => p.featured) ?? inCategory[0];
    return { ...c, productCount: inCategory.length, cover: cover?.images?.[0] };
  });

  bySlug = new Map(products.map((p) => [p.slug, p]));
  byId = new Map(products.map((p) => [p.id, p]));
  categoryBySlug = new Map(categoriesWithCounts.map((c) => [c.slug, c]));
  comboBySlug = new Map(combos.map((c) => [c.slug, c]));

  featuredProducts = products.filter((p) => p.featured);
  bestSellers = products.filter((p) => p.bestSeller);
  newArrivals = products.filter((p) => p.isNew);
  featuredCombos = combos.filter((c) => c.featured);
  featuredOffers = offers.filter((o) => o.featured);

  const counts = new Map();
  for (const p of products) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  allTags = [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  priceBounds = products.reduce(
    (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
    { min: Infinity, max: 0 },
  );
  if (!Number.isFinite(priceBounds.min)) priceBounds = { min: 0, max: 0 };

  catalogVersion += 1;
};

/**
 * Replaces the catalogue with a bootstrap payload. Each list is only taken if
 * the API actually sent one, so a partial response degrades to the seed for the
 * missing part rather than blanking a section of the shop.
 */
export const hydrate = (payload) => {
  if (!payload) return;

  if (payload.products?.length) products = payload.products;
  if (payload.categories?.length) categories = payload.categories;
  if (payload.combos?.length) combos = payload.combos;
  if (payload.offers?.length) offers = payload.offers;
  if (payload.banners?.length) banners = payload.banners;
  if (payload.testimonials?.length) testimonials = payload.testimonials;
  if (payload.faqs?.length) faqs = payload.faqs;

  recompute();
};

/**
 * Called once before React mounts. A failure is not fatal: the bundled JSON is
 * a complete catalogue, so the shop still works — it just will not show an
 * admin edit until the API is back. The reason is returned so the app can say so.
 */
export const bootstrap = async () => {
  try {
    hydrate(await api.bootstrap());
    live = true;
    return { live: true };
  } catch (error) {
    recompute();
    live = false;
    return { live: false, reason: error.message };
  }
};

/** Pulls the catalogue again — what an admin save calls when it has changed something. */
export const refresh = async () => {
  hydrate(await api.bootstrap());
  live = true;
};

// Derive once at module load so the seed is usable before bootstrap resolves.
recompute();
