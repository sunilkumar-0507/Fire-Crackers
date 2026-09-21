import { products, categories, catalogVersion } from '@/data';
import { availabilityOf, AVAILABILITY } from '@/utils/format';

const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Pre-computed haystack per product, so keystroke filtering never
 * re-serialises the catalogue.
 *
 * Built on first use and rebuilt whenever the catalogue changes, rather than
 * once at module load. Module load is now the one moment the catalogue is
 * guaranteed to be *empty* — it arrives from the API just afterwards — so an
 * index built there would stay empty for the life of the page and every search
 * would return nothing, silently. Keying on `catalogVersion` keeps the "build
 * it once" property while surviving both the initial hydrate and an admin
 * refresh.
 */
let index = [];
let categoryNames = new Map();
let indexedVersion = -1;

const ensureIndex = () => {
  if (indexedVersion === catalogVersion) return;

  index = products.map((p) => ({
    product: p,
    name: normalize(p.name),
    haystack: normalize(
      [p.name, p.category, p.brand, p.description, (p.tags ?? []).join(' '), p.unit].join(' '),
    ),
  }));

  categoryNames = new Map(categories.map((c) => [c.slug, normalize(c.name)]));
  indexedVersion = catalogVersion;
};

/**
 * Scored search across the local catalogue. Higher score = better match:
 * exact name > name prefix > name contains > category > any field.
 * Every term must match somewhere, so "gold sparkler" narrows properly.
 */
export const searchProducts = (query, limit = Infinity) => {
  const q = normalize(query);
  if (!q) return [];

  ensureIndex();

  const terms = q.split(' ');

  const scored = [];
  for (const entry of index) {
    let score = 0;
    let matchedAll = true;

    for (const term of terms) {
      if (!entry.haystack.includes(term)) {
        matchedAll = false;
        break;
      }
      if (entry.name === term) score += 100;
      else if (entry.name.startsWith(term)) score += 60;
      else if (entry.name.includes(term)) score += 40;
      else if ((categoryNames.get(entry.product.category) || '').includes(term)) score += 24;
      else score += 8;
    }

    if (!matchedAll) continue;

    // Nudge the catalogue's strongest items up when scores tie.
    if (entry.product.bestSeller) score += 6;
    if (entry.product.featured) score += 4;

    scored.push({ product: entry.product, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.product);
};

/** Matching categories, so the search dropdown can offer a jump-to-category. */
export const searchCategories = (query, limit = 3) => {
  const q = normalize(query);
  if (!q) return [];
  return categories.filter((c) => normalize(`${c.name} ${c.tamilName} ${c.tagline}`).includes(q)).slice(0, limit);
};

/* -------------------------------------------------------------------------- */
/* Catalogue filtering + sorting                                              */
/* -------------------------------------------------------------------------- */

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'discount', label: 'Biggest discount' },
  { value: 'newest', label: 'New arrivals' },
];

const comparators = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  discount: (a, b) => b.discount - a.discount || a.price - b.price,
  newest: (a, b) => Number(b.isNew) - Number(a.isNew) || b.discount - a.discount,
  relevance: (a, b) =>
    Number(b.bestSeller) - Number(a.bestSeller) ||
    Number(b.featured) - Number(a.featured) ||
    b.discount - a.discount,
};

/**
 * Single entry point used by the catalogue page. Keeping filter + sort here
 * (rather than in the component) keeps the page a pure view of URL state.
 */
export const AVAILABILITY_FILTERS = [
  { value: 'all', label: 'Any' },
  { value: AVAILABILITY.available, label: 'In stock' },
  { value: AVAILABILITY.outOfStock, label: 'Out of stock' },
  { value: AVAILABILITY.unavailable, label: 'Unavailable' },
];

export const filterProducts = ({
  query = '',
  category = 'all',
  tags = [],
  maxPrice = null,
  availability = 'all',
  sort = 'relevance',
} = {}) => {
  let result = query ? searchProducts(query) : products.slice();

  if (category && category !== 'all') result = result.filter((p) => p.category === category);
  if (tags.length) result = result.filter((p) => tags.every((t) => p.tags.includes(t)));
  if (maxPrice != null) result = result.filter((p) => p.price <= maxPrice);

  // One switch rather than a checkbox: "in stock" has to exclude a deactivated
  // line as well as a sold-out one, and the other two states are worth being
  // able to ask for rather than only ever hide.
  if (availability && availability !== 'all') {
    result = result.filter((p) => availabilityOf(p).state === availability);
  }

  // A search already returns results in relevance order — don't undo that.
  if (!(query && sort === 'relevance')) {
    result.sort(comparators[sort] ?? comparators.relevance);
  }
  return result;
};
