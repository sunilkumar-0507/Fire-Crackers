/**
 * The hero's reduced-motion fallback.
 *
 * Fireworks are the one thing on this shop that genuinely should not run for
 * somebody who has asked their system for less motion — a bursting, flickering
 * canvas is the exact class of animation that setting exists for. The fallback
 * is not "nothing", it is the static glyphs that stood in the hero before, so
 * the corner still looks considered rather than empty.
 */
import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import Hero from '@/components/home/Hero';

let reduceMotion = false;

beforeAll(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;

  window.matchMedia = (query) => ({
    matches: query.includes('prefers-reduced-motion') ? reduceMotion : false,
    media: query,
    addEventListener() {},
    removeEventListener() {},
  });

  window.scrollTo = () => {};
  HTMLCanvasElement.prototype.getContext = () => ({
    globalAlpha: 1,
    globalCompositeOperation: 'source-over',
    fillStyle: '', strokeStyle: '', lineWidth: 1, lineCap: 'butt',
    setTransform() {}, clearRect() {}, fillRect() {},
    beginPath() {}, closePath() {}, arc() {}, moveTo() {}, lineTo() {},
    fill() {}, stroke() {}, save() {}, restore() {},
  });

  global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() { return []; }
  };

  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  window.requestAnimationFrame = () => 0;
  window.cancelAnimationFrame = () => {};
});

const hosts = [];

const render = async () => {
  const host = document.createElement('div');
  document.body.appendChild(host);
  hosts.push(host);

  const root = createRoot(host);
  await act(async () => {
    root.render(
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
  it('runs the fireworks by default', async () => {
    reduceMotion = false;
    const host = await render();

    expect(host.querySelector('canvas')).not.toBeNull();
  });

  it('shows static art instead when reduced motion is asked for', async () => {
    reduceMotion = true;
    const host = await render();

    expect(host.querySelector('canvas')).toBeNull();
    // Not an empty corner — the glyphs that stood there before.
    expect(host.querySelectorAll('svg').length).toBeGreaterThan(0);
  });

  it('keeps the animation out of the accessibility tree either way', async () => {
    for (const setting of [false, true]) {
      reduceMotion = setting;
      const host = await render();

      const decoration = host.querySelector('canvas')?.closest('[aria-hidden="true"]')
        ?? host.querySelector('[aria-hidden="true"]');

      expect(decoration).not.toBeNull();
    }
  });
});
