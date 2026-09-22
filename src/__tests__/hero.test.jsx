/**
 * The hero's still-life.
 *
 * The right-hand column has been three different things now — a fireworks
 * canvas, then a grid of pack shots, now the festival still-life the brand
 * supplied. What this suite pins down is the part that should survive the next
 * redesign too: the picture is decoration, it is the page's largest paint, and
 * the copy beside it does not depend on it.
 *
 * The motion cases exist because the three CSS animations are deliberately
 * split across three elements. Two `transform` animations on one element
 * silently fight, and the symptom — a drifting image that never rises into
 * place, or a glow that loses its centring — is the sort of thing that
 * survives review.
 *
 * The fireworks case is the one with teeth. Every other animation on this page
 * is CSS, and the `prefers-reduced-motion` block at the end of globals.css
 * switches all of them off on its own. It cannot touch a
 * `requestAnimationFrame` loop, so the canvas has to be left unmounted
 * instead — and nothing about the markup would tell you that had regressed.
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

let reduceMotion = false;

beforeAll(() => {
  installDomStubs();

  // installDomStubs answers `false` to everything; the hero branches on this
  // one query, so it needs a handle on it.
  window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion') ? reduceMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });
});

afterEach(() => {
  reduceMotion = false;
});

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

  it('sets fireworks off behind the picture', async () => {
    hydrate({ products, categories });
    const host = await render();

    const canvas = host.querySelector('canvas');
    expect(canvas).not.toBeNull();

    // Decoration, and masked off the headline rather than spread over it.
    expect(canvas.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(host.querySelector('.mask-hero-fx')).not.toBeNull();
  });

  it('leaves the canvas unmounted when reduced motion is asked for', async () => {
    reduceMotion = true;
    hydrate({ products, categories });
    const host = await render();

    // Not "hidden" and not "paused" — absent. A canvas that mounts has already
    // started its loop, and the CSS that stops the other animations on this
    // page has no reach into it.
    expect(host.querySelector('canvas')).toBeNull();

    // The still image stays; the setting is about motion, not about pictures.
    expect(host.querySelector('img')).not.toBeNull();
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
