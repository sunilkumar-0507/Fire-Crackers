/**
 * The hero's photography.
 *
 * The right-hand column used to be generated decoration — a fireworks canvas,
 * a breathing glow and three catalogue glyphs drifting behind the copy. It is
 * now real product photography, and the point of this suite is that it stays
 * real: every tile has to resolve to a photograph we actually ship, never to
 * the icon fallback that `ProductImage` draws for a missing one.
 *
 * The second case is the one that used to blank the page. The hero mounts
 * eagerly, before anything below the fold, so it is the first component to see
 * an empty catalogue — and a grid of three empty frames is worse than copy
 * that simply runs the full width.
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { installDomStubs } from './setup/dom';
import { hydrate } from '@/data';

import products from '@/data/products.json';
import categories from '@/data/categories.json';

import Hero from '@/components/home/Hero';

beforeAll(installDomStubs);

const hosts = [];

/** `pickTiles` reads the live bindings once per mount, so hydrate first. */
const render = async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  hosts.push(host);

  await act(async () => {
    createRoot(host).render(
      <MemoryRouter>
        <Hero />
      </MemoryRouter>,
    );
  });

  return host;
};

afterEach(() => {
  while (hosts.length) hosts.pop()?.remove();
});

describe('the hero', () => {
  it('fronts the shop with real product photographs', async () => {
    hydrate({ products, categories });
    const host = await render();

    const images = [...host.querySelectorAll('img')];
    expect(images.length).toBeGreaterThan(0);

    for (const img of images) {
      // A real asset URL, and a name a screen reader can read out — not the
      // tinted icon box that stands in for a photo we do not have.
      expect(img.getAttribute('src')).toBeTruthy();
      expect(img.getAttribute('alt')).toBeTruthy();
    }

    // Each one links to the product it shows, so the picture is a way in.
    const hrefs = [...host.querySelectorAll('a[href^="/product/"]')];
    expect(hrefs.length).toBe(images.length);
  });

  it('never repeats a photograph across the tiles', async () => {
    hydrate({ products, categories });
    const host = await render();

    const sources = [...host.querySelectorAll('img')].map((img) => img.getAttribute('src'));
    expect(new Set(sources).size).toBe(sources.length);
  });

  it('drops the photo column rather than framing nothing', async () => {
    hydrate({ products: [], categories: [] });
    const host = await render();

    expect(host.querySelector('img')).toBeNull();
    // The proposition still renders — an empty catalogue costs the pictures,
    // not the headline.
    expect(host.querySelector('h1')?.textContent).toContain('Light up Diwali');
  });

  it('leaves no animated decoration behind', async () => {
    hydrate({ products, categories });
    const host = await render();

    expect(host.querySelector('canvas')).toBeNull();
    expect(host.querySelector('[class*="animate-"]')).toBeNull();
  });
});
