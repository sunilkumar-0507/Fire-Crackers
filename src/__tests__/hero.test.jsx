/**
 * The hero's still-life.
 *
 * The right-hand column has been three different things now — a fireworks
 * canvas, then a grid of pack shots, now the festival still-life the brand
 * supplied. What this suite pins down is the part that should survive the next
 * redesign too: the picture is decoration, it is the page's largest paint, and
 * the copy beside it does not depend on it.
 *
 * The motion cases exist because the three animations are deliberately split
 * across three elements. Two `transform` animations on one element silently
 * fight, and the symptom — a drifting image that never rises into place, or a
 * glow that loses its centring — is the sort of thing that survives review.
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
  it('carries the still-life as decoration, not as content', async () => {
    hydrate({ products, categories });
    const host = await render();

    const art = host.querySelector('img');
    expect(art).not.toBeNull();

    // Everything the picture says, the copy beside it already says in words,
    // so it is announced to nobody: empty alt inside an aria-hidden container.
    expect(art.getAttribute('alt')).toBe('');
    expect(art.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  it('declares the art as the largest paint, at a fixed ratio', async () => {
    hydrate({ products, categories });
    const host = await render();
    const art = host.querySelector('img');

    // It is the LCP element on the homepage, so it must not be lazy.
    expect(art.getAttribute('loading')).toBe('eager');
    expect(art.getAttribute('fetchpriority')).toBe('high');

    // Intrinsic dimensions, so the copy below it does not jump when it lands.
    expect(art.getAttribute('width')).toBe('1254');
    expect(art.getAttribute('height')).toBe('1254');
  });

  it('keeps the three animations on three separate elements', async () => {
    hydrate({ products, categories });
    const host = await render();

    const rise = host.querySelector('.animate-rise-in');
    const float = host.querySelector('.animate-float');
    const glow = host.querySelector('.animate-glow');

    expect(rise).not.toBeNull();
    expect(float).not.toBeNull();
    expect(glow).not.toBeNull();

    // `rise-in` and `float` both drive transform. On one element the later
    // animation would win outright and the entrance would never play.
    expect(rise).not.toBe(float);
    expect(float).not.toBe(glow);
    expect(rise).not.toBe(glow);
  });

  it('does not depend on the catalogue for its picture', async () => {
    // The art is a bundled asset, not a product photo, so an empty database
    // costs the numbers in the sentence and nothing else.
    hydrate({ products: [], categories: [] });
    const host = await render();

    expect(host.querySelector('img')).not.toBeNull();
    expect(host.querySelector('h1')?.textContent).toContain('Light up Diwali');
  });
});
