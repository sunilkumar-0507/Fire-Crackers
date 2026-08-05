import { products, categories } from '@/data';

const normalize = (s) =>
  (s || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Pre-computed haystack per product. Built once at module load so keystroke
 * filtering never re-serialises the catalogue.
 */
const index = products.map((p) => ({
  product: p,
  name: normalize(p.name),
  haystack: normalize(
    [p.name, p.category, p.brand, p.description, p.tags.join(' '), p.unit].join(' '),
  ),
}));

const categoryNames = new Map(categories.map((c) => [c.slug, normalize(c.name)]));

/**
 * Scored search across the local catalogue. Higher score = better match:
 * exact name > name prefix > name contains > category > any field.
 * Every term must match somewhere, so "gold sparkler" narrows properly.
 */
export const searchProducts = (query, limit = Infinity) => {
  const q = normalize(query);
  if (!q) return [];

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
    score += entry.product.rating;

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
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'New arrivals' },
];

const comparators = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  discount: (a, b) => b.discount - a.discount || b.rating - a.rating,
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  newest: (a, b) => Number(b.isNew) - Number(a.isNew) || b.rating - a.rating,
  relevance: (a, b) =>
    Number(b.bestSeller) - Number(a.bestSeller) ||
    Number(b.featured) - Number(a.featured) ||
    b.rating - a.rating,
};

/**
 * Single entry point used by the catalogue page. Keeping filter + sort here
 * (rather than in the component) keeps the page a pure view of URL state.
 */
export const filterProducts = ({
  query = '',
  category = 'all',
  tags = [],
  maxPrice = null,
  minRating = 0,
  inStockOnly = false,
  sort = 'relevance',
} = {}) => {
  let result = query ? searchProducts(query) : products.slice();

  if (category && category !== 'all') result = result.filter((p) => p.category === category);
  if (tags.length) result = result.filter((p) => tags.every((t) => p.tags.includes(t)));
  if (maxPrice != null) result = result.filter((p) => p.price <= maxPrice);
  if (minRating > 0) result = result.filter((p) => p.rating >= minRating);
  if (inStockOnly) result = result.filter((p) => p.stock > 0);

  // A search already returns results in relevance order — don't undo that.
  if (!(query && sort === 'relevance')) {
    result.sort(comparators[sort] ?? comparators.relevance);
  }
  return result;
};
