import { describe, it, expect } from 'vitest';
import { searchProducts, filterProducts } from '@/utils/search';
import { products, categoriesWithCounts, findProduct } from '@/data';

describe('catalogue search', () => {
  it('ranks an exact name match first', () => {
    expect(searchProducts('Classic Bomb')[0].slug).toBe('classic-bomb');
  });

  it('searches descriptions too, but ranks name matches above them', () => {
    const results = searchProducts('sparkler');
    expect(results.length).toBeGreaterThan(3);

    // Description-only hits are legitimate results (a whip pencil described as
    // "gentler than a sparkler"), but they must never outrank the real thing.
    const firstDescriptionOnlyHit = results.findIndex(
      (p) => !p.name.toLowerCase().includes('sparkler') && p.category !== 'sparklers',
    );
    const lastNameHit = results.findLastIndex((p) => p.name.toLowerCase().includes('sparkler'));

    expect(lastNameHit).toBeGreaterThanOrEqual(0);
    if (firstDescriptionOnlyHit !== -1) {
      expect(firstDescriptionOnlyHit).toBeGreaterThan(lastNameHit);
    }
  });

  it('requires every term to match, so more words narrow the result', () => {
    const broad = searchProducts('sparkler');
    const narrow = searchProducts('colour sparkler');
    expect(narrow.length).toBeLessThan(broad.length);
    expect(narrow.length).toBeGreaterThan(0);
  });

  it('returns nothing for a term that is in no product', () => {
    expect(searchProducts('submarine')).toEqual([]);
  });

  it('ignores case, punctuation and extra whitespace', () => {
    expect(searchProducts('  FLOWER   POT!! ').length).toBe(searchProducts('flower pot').length);
  });

  it('returns an empty list for an empty query rather than everything', () => {
    expect(searchProducts('')).toEqual([]);
    expect(searchProducts('   ')).toEqual([]);
  });
});

describe('catalogue filtering', () => {
  it('returns the whole catalogue with no filters', () => {
    expect(filterProducts()).toHaveLength(products.length);
  });

  it('filters by category', () => {
    const pots = filterProducts({ category: 'flower-pots' });
    expect(pots.length).toBe(
      categoriesWithCounts.find((c) => c.slug === 'flower-pots').productCount,
    );
    expect(pots.every((p) => p.category === 'flower-pots')).toBe(true);
  });

  it('treats multiple tags as AND, not OR', () => {
    const both = filterProducts({ tags: ['silent', 'kids-safe'] });
    expect(both.length).toBeGreaterThan(0);
    expect(both.every((p) => p.tags.includes('silent') && p.tags.includes('kids-safe'))).toBe(true);
    expect(both.length).toBeLessThanOrEqual(filterProducts({ tags: ['silent'] }).length);
  });

  it('applies the price ceiling inclusively', () => {
    const cheap = filterProducts({ maxPrice: 150 });
    expect(cheap.every((p) => p.price <= 150)).toBe(true);
    expect(cheap.some((p) => p.price === 140)).toBe(true);
  });

  it('sorts by price ascending and descending', () => {
    const asc = filterProducts({ sort: 'price-asc' }).map((p) => p.price);
    const desc = filterProducts({ sort: 'price-desc' }).map((p) => p.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it('combines a query with filters', () => {
    const result = filterProducts({ query: 'sparkler', category: 'sparklers', maxPrice: 200 });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.category === 'sparklers' && p.price <= 200)).toBe(true);
  });

  it('can return an empty set without throwing', () => {
    expect(filterProducts({ category: 'bombs', tags: ['kids-safe'], maxPrice: 50 })).toEqual([]);
  });
});

describe('catalogue data integrity', () => {
  it('has unique ids and slugs', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);
  });

  it('places every product in a real category', () => {
    const slugs = new Set(categoriesWithCounts.map((c) => c.slug));
    expect(products.every((p) => slugs.has(p.category))).toBe(true);
  });

  it('never prices a product above its own MRP', () => {
    expect(products.every((p) => p.price < p.mrp)).toBe(true);
  });

  it('states a discount that matches the actual price gap within a point', () => {
    const off = products.filter(
      (p) => Math.abs(Math.round(((p.mrp - p.price) / p.mrp) * 100) - p.discount) > 1,
    );
    expect(off.map((p) => p.slug)).toEqual([]);
  });

  // One photo per SKU is the floor, not three: the 2026 catalogue is shot from
  // the real product photography, and most items only have a single frame. A
  // gallery padded out to three would be showing pictures of other products.
  // `images.test.js` carries the stronger guarantees — every key resolves to a
  // real photo, and no gallery repeats one.
  it('gives every product at least one image', () => {
    expect(products.every((p) => p.images.length >= 1)).toBe(true);
  });

  it('finds products by either slug or id', () => {
    expect(findProduct('p-001')).toBe(findProduct('2-75-inch-kuruvi'));
  });
});
