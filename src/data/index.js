/**
 * The catalogue.
 *
 * This is the ONLY module that knows where data comes from. Every component
 * reads through the bindings below at render time, synchronously — no awaiting,
 * no loading states scattered through thirty files.
 *
 * Everything here starts empty and is filled from the API. There is no bundled
 * copy of the shop any more: the database is the single source of truth, and a
 * shop that cannot reach it shows an error rather than a catalogue that might
 * be months stale. Seeded JSON used to live here as a fallback, which meant a
 * broken API looked exactly like a working one — same products, same prices,
 * no way for anyone to tell from the screen that the shop had stopped
 * answering. Wrong prices are worse than no prices.
 *
 * `hydrate()` swaps the whole catalogue in one go, and because these are ES
 * module *live bindings*, every importer sees the new arrays on its next
 * render. `bootstrap()` runs once in main.jsx before React mounts, so the first
 * paint already has real data.
 *
 * The JSON files still sitting beside this one are not dead: they are what the
 * API seeds an empty database from, linked into the API project directly. They
 * are simply no longer part of the shop's bundle.
 *
 * After an admin save, call `refresh()` to pull the catalogue again.
 */
import { api } from '@/lib/api';
import { hydrateConfig, hydrateFulfilment, hydratePayments } from '@/constants';

/* -------------------------------------------------------------------------- */
/* Live bindings                                                               */
/* -------------------------------------------------------------------------- */

export let categories = [];
export let products = [];
export let banners = [];
export let combos = [];
export let testimonials = [];
export let faqs = [];

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

/** Every distinct tag in the catalogue, with usage counts, most used first. */
export let allTags = [];

export let priceBounds = { min: 0, max: 0 };

/** The deepest discount in the catalogue, as a whole percentage. */
export let deepestDiscount = 0;

/**
 * Bumped on every hydrate. The router keys off it, so a catalogue that changed
 * under a mounted tree forces a clean remount rather than leaving half the page
 * showing the previous prices.
 */
export let catalogVersion = 0;

/** True once the API has answered with a catalogue. */
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

  const counts = new Map();
  for (const p of products) for (const t of p.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
  allTags = [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  priceBounds = products.reduce(
    (acc, p) => ({ min: Math.min(acc.min, p.price), max: Math.max(acc.max, p.price) }),
    { min: Infinity, max: 0 },
  );
  if (!Number.isFinite(priceBounds.min)) priceBounds = { min: 0, max: 0 };

  // Recomputed here rather than at module load, which is when it used to be
  // read off the bundled seed. With nothing bundled, a module-level constant
  // would be a permanent zero.
  deepestDiscount = products.reduce((best, p) => Math.max(best, p.discount ?? 0), 0);

  catalogVersion += 1;
};

/**
 * Replaces the catalogue with a bootstrap payload.
 *
 * A list is taken whenever the API sent one, **including an empty one** — an
 * empty array is an answer ("this shop has no combos"), and treating it as a
 * missing field is how a section keeps showing rows the shopkeeper has
 * deleted. Only an absent key leaves the current list alone.
 */
export const hydrate = (payload) => {
  if (!payload) return;

  if (payload.products) products = payload.products;
  if (payload.categories) categories = payload.categories;
  if (payload.combos) combos = payload.combos;
  if (payload.banners) banners = payload.banners;
  if (payload.testimonials) testimonials = payload.testimonials;
  if (payload.faqs) faqs = payload.faqs;

  recompute();
};

/**
 * Called once before React mounts.
 *
 * Four calls, not one. The catalogue, the shop's configuration (brand,
 * shipping, coupon codes, districts, payment methods), the fulfilment copy and
 * whether online payment is available are separate endpoints, and they are
 * fetched together so the first paint has all four.
 *
 * The catalogue is the one that decides whether the shop can open at all: with
 * no products there is nothing to sell, so a failure there is reported as fatal
 * and main.jsx shows an error screen instead of mounting an empty shop. The
 * other three have sensible defaults built in and only downgrade the page.
 */
export const bootstrap = async () => {
  const [catalogue, config, fulfilment, payments] = await Promise.allSettled([
    api.bootstrap(),
    api.config(),
    api.fulfilment(),
    api.paymentConfig(),
  ]);

  if (config.status === 'fulfilled') hydrateConfig(config.value);
  if (fulfilment.status === 'fulfilled') hydrateFulfilment(fulfilment.value);
  if (payments.status === 'fulfilled') hydratePayments(payments.value);

  if (catalogue.status === 'rejected') {
    return { live: false, fatal: true, reason: catalogue.reason?.message };
  }

  hydrate(catalogue.value);
  live = true;

  // The shop reached the API and the API said it has nothing. That is a real
  // answer, and it is still not a shop — an empty grid with a working search
  // box reads as a bug to a customer and hides a genuine problem from the
  // shopkeeper, so it gets the same screen as an unreachable API.
  if (!products.length) {
    return {
      live: true,
      fatal: true,
      reason: 'The catalogue came back empty. The database has no products in it yet.',
    };
  }

  const degraded = [config, fulfilment, payments].find((r) => r.status === 'rejected');

  return degraded
    ? { live: true, fatal: false, reason: degraded.reason?.message }
    : { live: true, fatal: false };
};

/** Pulls the catalogue again — what an admin save calls when it has changed something. */
export const refresh = async () => {
  hydrate(await api.bootstrap());
  live = true;
};
