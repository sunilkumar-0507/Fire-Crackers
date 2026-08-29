import { describe, it, expect } from 'vitest';
import { products } from '@/data';
import { resolveImage } from '@/utils/image';
import { PRODUCT_PHOTOS } from '@/utils/productPhotos';

describe('product photography', () => {
  it('ships every photo the catalogue names', () => {
    // A typo in a filename would otherwise fall through to the placeholder art
    // and go unnoticed — the page still renders, just with the wrong picture.
    const missing = products.flatMap((p) =>
      p.images.filter((key) => !PRODUCT_PHOTOS[key]).map((key) => `${p.slug} → ${key}`),
    );
    expect(missing).toEqual([]);
  });

  it('resolves every product image to a real photo, never to placeholder art', () => {
    const notPhotos = products
      .filter((p) => p.images.some((key) => resolveImage(key).kind !== 'url'))
      .map((p) => p.slug);
    expect(notPhotos).toEqual([]);
  });

  it('never shows the same photo twice in one gallery', () => {
    // Compared on the resolved URL rather than the key: two catalogue files can
    // be byte-identical, and the bundler collapses those onto one asset.
    const repeats = products
      .filter((p) => new Set(p.images.map((k) => PRODUCT_PHOTOS[k])).size !== p.images.length)
      .map((p) => p.slug);
    expect(repeats).toEqual([]);
  });

  it('still falls back to vector art for an art key', () => {
    expect(resolveImage('sparkler/3')).toEqual({ kind: 'art', type: 'sparkler', variant: 3 });
  });

  it('passes an absolute URL straight through, for when the API sends one', () => {
    expect(resolveImage('https://cdn.example.com/a.jpg')).toEqual({
      kind: 'url',
      src: 'https://cdn.example.com/a.jpg',
    });
  });
});
