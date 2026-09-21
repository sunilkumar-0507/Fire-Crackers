/**
 * The shop against a half-filled database.
 *
 * Removing the bundled catalogue made this reachable for the first time. The
 * seed JSON always had four banners, six combos, six offers and twelve FAQs in
 * it, so every component could assume its data existed — and several did, by
 * indexing straight into an array at module load. A real database does not make
 * that promise: a shopkeeper who has added products but not yet written a
 * banner is an ordinary Tuesday, and `banners.find(...).eyebrow` is a blank
 * white page.
 *
 * So this mounts the same pages the smoke test does, with products and
 * categories present and everything optional emptied out, and requires them to
 * render without a single React error. A section with nothing to show is
 * expected to omit itself, not to throw.
 */
import { describe, it, expect, beforeAll, afterEach, vi } from 'vitest';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { installDomStubs } from './setup/dom';
import { hydrate } from '@/data';

import products from '@/data/products.json';
import categories from '@/data/categories.json';

import RootLayout from '@/layouts/RootLayout';
import Home from '@/pages/Home';
import Products from '@/pages/Products';
import Category from '@/pages/Category';
import Offers from '@/pages/Offers';
import Combos from '@/pages/Combos';
import About from '@/pages/About';
import Checkout from '@/pages/Checkout';

const routes = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'products', element: <Products /> },
      { path: 'category/:slug', element: <Category /> },
      { path: 'offers', element: <Offers /> },
      { path: 'combos', element: <Combos /> },
      { path: 'about', element: <About /> },
      { path: 'checkout', element: <Checkout /> },
    ],
  },
];

/** Every page that reads one of the optional collections. */
const PATHS = ['/', '/products', '/category/sparklers', '/offers', '/combos', '/about', '/checkout'];

beforeAll(() => {
  installDomStubs();

  // The minimum a shop can open with: things to sell, and shelves to put them
  // on. Everything else is deliberately empty rather than absent, because an
  // empty array is what the API actually returns for a table with no rows.
  hydrate({
    products,
    categories,
    combos: [],
    offers: [],
    banners: [],
    testimonials: [],
    faqs: [],
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('a database with products but nothing else', () => {
  it.each(PATHS)('renders %s without crashing', async (path) => {
    const errors = [];
    const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
      errors.push(args.map(String).join(' '));
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const router = createMemoryRouter(routes, { initialEntries: [path] });

    await act(async () => {
      root.render(
        <StrictMode>
          <RouterProvider router={router} />
        </StrictMode>,
      );
    });

    // Still a page, not a stub: the header, the footer and whatever the page
    // does have are expected to be there.
    expect(container.textContent.length).toBeGreaterThan(50);
    expect(errors, `console.error during ${path}:\n${errors.join('\n')}`).toEqual([]);

    await act(async () => root.unmount());
    container.remove();
    spy.mockRestore();
  });

  it('omits the silent-range panel when there is no banner for it', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const router = createMemoryRouter(routes, { initialEntries: ['/'] });

    await act(async () => {
      root.render(
        <StrictMode>
          <RouterProvider router={router} />
        </StrictMode>,
      );
    });

    // The panel's own heading comes from the banner row, so with no banner
    // there is nothing it could honestly render.
    expect(container.textContent).not.toContain('Green Diwali');

    await act(async () => root.unmount());
    container.remove();
  });
});
